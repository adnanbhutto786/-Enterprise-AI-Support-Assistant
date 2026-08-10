import React, { useEffect, useState, useRef } from "react"
import { useLocation } from "react-router-dom"
import { 
  Send, 
  Bot, 
  User, 
  Loader2, 
  Sparkles, 
  CheckCircle2, 
  Copy, 
  Check, 
  RotateCcw, 
  Paperclip, 
  X, 
  AlertTriangle, 
  ArrowDown, 
  HelpCircle, 
  BookOpen, 
  ShieldAlert, 
  LifeBuoy, 
  FileText, 
  Clock, 
  Sparkle,
  Download,
  Printer,
  FileDown,
  Share2
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import api from "@/lib/api"

type Message = {
  id: string
  role: "user" | "ai"
  content: string
  citations?: string
  confidence_low?: boolean
  confidence?: number
  attachmentName?: string
  attachmentType?: string
  timestamp: string
}

const suggestedPrompts = [
  { text: "Why is my FI document posting blocked?", tag: "SAP FI" },
  { text: "How to fix SAP MM ME013 Purchase Order error?", tag: "SAP MM" },
  { text: "How to reset user password in SAP Basis (SU01)?", tag: "Basis" },
  { text: "How to resolve SAP SD billing pricing condition error (V1002)?", tag: "SAP SD" },
  { text: "What transaction code is used for Purchase Requisition approval?", tag: "Workflow" }
]

export default function AIChat() {
  const location = useLocation()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [attachment, setAttachment] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [showScrollBottom, setShowScrollBottom] = useState(false)
  const [escalatingId, setEscalatingId] = useState<string | null>(null)
  const [escalatedTickets, setEscalatedTickets] = useState<{ [key: string]: number }>({})
  const [escalateSuccess, setEscalateSuccess] = useState<string | null>(null)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Scroll to bottom helper (strictly scoped to chat container)
  const scrollToBottom = (behavior: ScrollBehavior = "smooth") => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        top: scrollContainerRef.current.scrollHeight,
        behavior
      })
    }
  }

  // Handle user scroll detection
  const handleScroll = () => {
    if (!scrollContainerRef.current) return
    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current
    const isUp = scrollHeight - scrollTop - clientHeight > 160
    setShowScrollBottom(isUp)
  }

  useEffect(() => {
    scrollToBottom("smooth")
  }, [messages, isLoading])

  useEffect(() => {
    if (location.state?.initialMessage) {
      const initialMsg = location.state.initialMessage
      window.history.replaceState({}, document.title)
      sendMessage(initialMsg)
    }
  }, [location.state])

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const clearChat = () => {
    setMessages([])
    setAttachment(null)
    setPreviewUrl(null)
  }

  // Export Chat to Printable / Saveable PDF
  const exportToPDF = () => {
    if (messages.length === 0) return
    const userEmail = localStorage.getItem("userEmail") || "employee@company.com"
    const printDate = new Date().toLocaleString()
    
    const printWindow = window.open("", "_blank")
    if (!printWindow) return

    const messagesHtml = messages
      .map((msg, idx) => {
        const isUser = msg.role === "user"
        const formattedContent = msg.content
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")
          .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
          .replace(/`([^`]+)`/g, "<code style='background:#ede9fe;color:#5b21b6;padding:2px 5px;border-radius:4px;font-size:12px;font-family:monospace;'>$1</code>")
          .replace(/\n/g, "<br/>")

        return `
          <div style="margin-bottom: 20px; padding: 16px 20px; border-radius: 12px; background: ${isUser ? '#eef2ff' : '#f8fafc'}; border: 1px solid ${isUser ? '#c7d2fe' : '#e2e8f0'}; border-left: 5px solid ${isUser ? '#4f46e5' : '#7c3aed'};">
            <div style="display:flex; justify-content:space-between; margin-bottom: 8px; font-size: 11px; font-weight: bold; color: ${isUser ? '#4338ca' : '#6d28d9'}; text-transform: uppercase;">
              <span>${isUser ? '👤 EMPLOYEE QUESTION' : '🤖 AI SUPPORT RESOLUTION'} (Exchange #${idx + 1})</span>
              <span style="color: #64748b;">${msg.timestamp}</span>
            </div>
            <div style="font-size: 13.5px; line-height: 1.6; color: #1e293b;">${formattedContent}</div>
            ${msg.attachmentName ? `<div style="margin-top: 10px; font-size: 12px; color: #475569; background: #e2e8f0; padding: 6px 12px; border-radius: 6px;">📎 Attached: <strong>${msg.attachmentName}</strong></div>` : ''}
            ${msg.citations ? `<div style="margin-top: 12px; padding: 10px 14px; background: #f1f5f9; border-left: 3px solid #0284c7; border-radius: 6px; font-size: 12px; color: #334155;"><strong>📚 References & Document Citations:</strong><br/>${msg.citations.replace(/\n/g, '<br/>')}</div>` : ''}
          </div>
        `
      })
      .join("")

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Enterprise AI Support Log - ${new Date().toISOString().split('T')[0]}</title>
          <style>
            @media print {
              body { padding: 0; background: #ffffff !important; }
              .no-print { display: none !important; }
            }
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; padding: 40px; max-width: 850px; margin: 0 auto; color: #0f172a; background: #ffffff; }
            .header-box { border-bottom: 2px solid #6366f1; padding-bottom: 20px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: flex-start; }
            .brand-title { font-size: 22px; font-weight: 800; color: #1e1b4b; margin: 0; }
            .brand-subtitle { font-size: 12px; color: #6366f1; font-weight: 600; text-transform: uppercase; margin-top: 4px; letter-spacing: 0.5px; }
            .meta-box { font-size: 12px; color: #64748b; text-align: right; line-height: 1.6; }
            .footer-box { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0; font-size: 11px; color: #94a3b8; text-align: center; }
            .btn-print { background: #4f46e5; color: white; border: none; padding: 10px 20px; border-radius: 8px; font-weight: 600; cursor: pointer; font-size: 13px; box-shadow: 0 4px 6px -1px rgba(79, 70, 229, 0.2); }
            .btn-print:hover { background: #4338ca; }
          </style>
        </head>
        <body>
          <div class="no-print" style="margin-bottom: 24px; display: flex; justify-content: space-between; align-items: center; background: #f8fafc; padding: 12px 18px; border-radius: 10px; border: 1px solid #e2e8f0;">
            <span style="font-size: 13px; color: #475569; font-weight: 500;">Tip: In the print dialog, select <strong>"Save as PDF"</strong> to save to your computer.</span>
            <button class="btn-print" onclick="window.print()">🖨️ Save as PDF / Print</button>
          </div>
          <div class="header-box">
            <div>
              <h1 class="brand-title">Enterprise AI Support Assistant</h1>
              <div class="brand-subtitle">SAP Troubleshooting Session & Support Log</div>
            </div>
            <div class="meta-box">
              <div><strong>Employee:</strong> ${userEmail}</div>
              <div><strong>Generated:</strong> ${printDate}</div>
              <div><strong>Exchanges:</strong> ${messages.length}</div>
            </div>
          </div>
          <div>
            ${messagesHtml}
          </div>
          <div class="footer-box">
            Enterprise AI Support Assistant • Confidential Enterprise Troubleshooting Log • Exported on ${printDate}
          </div>
          <script>
            setTimeout(() => { window.print(); }, 400);
          </script>
        </body>
      </html>
    `)
    printWindow.document.close()
  }

  // Export Chat to Text / Notes File (.txt)
  const exportToText = () => {
    if (messages.length === 0) return
    const userEmail = localStorage.getItem("userEmail") || "employee@company.com"
    const timestamp = new Date().toLocaleString()
    
    let content = `================================================================================\n`
    content += `ENTERPRISE AI SUPPORT ASSISTANT - SAP TROUBLESHOOTING LOG\n`
    content += `User: ${userEmail}\n`
    content += `Generated: ${timestamp}\n`
    content += `Total Exchanges: ${messages.length}\n`
    content += `================================================================================\n\n`

    messages.forEach((msg, idx) => {
      const roleName = msg.role === "user" ? "YOU (EMPLOYEE)" : "AI SUPPORT COPILOT"
      content += `--------------------------------------------------------------------------------\n`
      content += `[${idx + 1}] ${roleName} - ${msg.timestamp}\n`
      content += `--------------------------------------------------------------------------------\n`
      content += `${msg.content}\n\n`
      if (msg.attachmentName) {
        content += `[Attachment]: ${msg.attachmentName}\n\n`
      }
      if (msg.citations) {
        content += `[Source Citations]:\n${msg.citations}\n\n`
      }
    })

    content += `================================================================================\n`
    content += `END OF LOG - Enterprise Support Assistant\n`
    content += `================================================================================\n`

    const blob = new Blob([content], { type: "text/plain;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `SAP_Troubleshooting_Log_${new Date().toISOString().split('T')[0]}.txt`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  // Copy Full Session Transcript
  const copyFullTranscript = () => {
    if (messages.length === 0) return
    let text = `Enterprise AI Support Log (${new Date().toLocaleDateString()}):\n\n`
    messages.forEach((m, idx) => {
      text += `[${idx + 1}] ${m.role === 'user' ? '👤 Employee' : '🤖 AI'} (${m.timestamp}):\n${m.content}\n\n`
    })
    navigator.clipboard.writeText(text)
    setCopiedId("full-transcript")
    setTimeout(() => setCopiedId(null), 2500)
  }

  const sendMessage = async (text: string) => {
    if (!text.trim() && !attachment) return

    const now = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    const userMsgId = `user-${Date.now()}`
    
    const userMessage: Message = {
      id: userMsgId,
      role: "user",
      content: text,
      attachmentName: attachment?.name,
      attachmentType: attachment?.type,
      timestamp: now
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
    }

    try {
      const userEmail = localStorage.getItem("userEmail") || "employee@company.com"
      const payload: any = { message: text, user_email: userEmail }
      if (attachment) payload.attachment_name = attachment.name

      const response = await api.post("/api/chat", payload)
      
      const aiMsgId = `ai-${Date.now()}`
      const aiMessage: Message = {
        id: aiMsgId,
        role: "ai",
        content: response.data.answer || "The assistant could not generate a response.",
        citations: response.data.citations,
        confidence_low: response.data.confidence_low,
        confidence: response.data.confidence,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      }
      setMessages((prev) => [...prev, aiMessage])
    } catch (err: any) {
      const errorMsg: Message = {
        id: `err-${Date.now()}`,
        role: "ai",
        content: "I encountered a connection error while communicating with the AI service. Please check your backend connection or try again in a moment.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      }
      setMessages((prev) => [...prev, errorMsg])
    } finally {
      setIsLoading(false)
      setAttachment(null)
      setPreviewUrl(null)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage(input)
    }
  }

  const raiseEscalationTicket = async (msg: Message) => {
    const userEmail = localStorage.getItem("userEmail") || "employee@company.com"
    setEscalatingId(msg.id)
    try {
      const res = await api.post("/api/tickets", {
        title: `AI Escalation: ${msg.content.slice(0, 40)}...`,
        description: `Escalated from AI Chat:\n\n${msg.content}`,
        category: "AI-Escalation",
        priority: "High",
        user_email: userEmail
      })
      if (res.data.status === "success") {
        setEscalatedTickets((prev) => ({ ...prev, [msg.id]: res.data.ticket_id }))
        setEscalateSuccess(`Support Ticket #${res.data.ticket_id} created and dispatched to human experts!`)
        setTimeout(() => setEscalateSuccess(null), 5000)
      }
    } catch (err) {
      console.error("Failed to raise ticket:", err)
    } finally {
      setEscalatingId(null)
    }
  }

  // Rich Text Formatter for SAP Steps and Markdown
  const renderFormattedContent = (content: string) => {
    const lines = content.split("\n")
    return lines.map((line, lineIdx) => {
      // Empty line
      if (!line.trim()) {
        return <div key={lineIdx} className="h-2" />
      }

      // Main Step Header: e.g. **Step 1: ...** or Step 1:
      const stepMatch = line.match(/^(\*\*Step \d+:?.*?\*\*|Step \d+:?.*?:?)/i)
      if (stepMatch) {
        return (
          <div key={lineIdx} className="my-2 pt-1.5 flex items-center gap-2">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              {line.replace(/\*\*/g, "")}
            </span>
          </div>
        )
      }

      // Resolution Steps Header
      if (line.includes("**Resolution Steps:**") || line.includes("Resolution Steps:")) {
        return (
          <div key={lineIdx} className="my-2.5 flex items-center gap-2 text-xs font-bold text-indigo-300 uppercase tracking-wider">
            <Sparkle className="h-3.5 w-3.5 text-indigo-400" />
            <span>Resolution Steps</span>
          </div>
        )
      }

      // Numbered List (e.g. 1. Go to transaction...)
      const numMatch = line.match(/^(\d+)\.\s+(.*)/)
      if (numMatch) {
        return (
          <div key={lineIdx} className="flex items-start gap-2.5 my-1.5 pl-1 text-sm text-slate-200">
            <span className="flex-shrink-0 flex items-center justify-center w-5 h-5 rounded-full bg-indigo-600/30 text-indigo-300 font-bold text-[11px] border border-indigo-500/30 mt-0.5">
              {numMatch[1]}
            </span>
            <div className="flex-1 leading-relaxed">
              {formatInlineText(numMatch[2])}
            </div>
          </div>
        )
      }

      // Bullet points (e.g. - Vendor or * Item)
      const bulletMatch = line.match(/^[-*•]\s+(.*)/)
      if (bulletMatch) {
        return (
          <div key={lineIdx} className="flex items-start gap-2.5 my-1 pl-2 text-sm text-slate-300">
            <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 mt-2 flex-shrink-0" />
            <div className="flex-1 leading-relaxed">
              {formatInlineText(bulletMatch[1])}
            </div>
          </div>
        )
      }

      // Regular paragraph line with inline formatting
      return (
        <p key={lineIdx} className="text-sm leading-relaxed text-slate-200 my-1">
          {formatInlineText(line)}
        </p>
      )
    })
  }

  // Inline formatting helper (T-Codes, bold text, code tags)
  const formatInlineText = (text: string) => {
    // Replace **bold** with <strong>
    const parts = text.split(/(\*\*.*?\*\*|`.*?`)/g)
    return parts.map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        const inner = part.slice(2, -2)
        // If it looks like a T-Code (e.g. OBA7, ME23N, SU01, VK11, MM02)
        if (/^[A-Z0-9_]{3,8}$/.test(inner)) {
          return (
            <span key={i} className="inline-flex items-center px-2 py-0.5 mx-1 rounded-md text-xs font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
              {inner}
            </span>
          )
        }
        return <strong key={i} className="font-bold text-white">{inner}</strong>
      }
      if (part.startsWith("`") && part.endsWith("`")) {
        return (
          <code key={i} className="px-1.5 py-0.5 rounded text-xs font-mono bg-slate-900 text-indigo-300 border border-white/10 mx-0.5">
            {part.slice(1, -1)}
          </code>
        )
      }
      return part
    })
  }

  return (
    <div className="h-full w-full max-w-5xl mx-auto flex flex-col min-h-0 text-white relative">
      {/* Escalation Success Alert */}
      {escalateSuccess && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-emerald-600/90 backdrop-blur-md border border-emerald-400/40 text-white text-xs font-semibold shadow-2xl animate-in fade-in slide-in-from-top-4 duration-300">
          <CheckCircle2 className="h-4 w-4" />
          <span>{escalateSuccess}</span>
        </div>
      )}

      {/* Main Glassmorphism Chat Card */}
      <Card className="flex-1 flex flex-col min-h-0 overflow-hidden border border-white/10 bg-slate-950/80 backdrop-blur-2xl shadow-2xl rounded-2xl relative">
        
        {/* Chat Top Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-white/10 bg-slate-900/80 backdrop-blur-md z-20 shrink-0">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="p-2 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-500/20">
                <Bot className="h-5 w-5 animate-pulse" />
              </div>
              <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold tracking-tight text-white">Enterprise AI Assistant</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Groq LLaMA-3.3 Active
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Company ERP, SAP Modules & IT Support Copilot</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {messages.length > 0 && (
              <>
                {/* Export Chat Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 rounded-xl border-white/10 bg-white/[0.03] hover:bg-white/10 text-xs text-indigo-300 hover:text-white transition-colors"
                      title="Export conversation log"
                    >
                      <Download className="h-3.5 w-3.5 mr-1.5 text-indigo-400" />
                      <span>Export Chat</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 rounded-2xl border-white/10 shadow-2xl bg-[#0d1030]/95 backdrop-blur-xl p-1.5 z-[100] text-white">
                    <DropdownMenuLabel className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 px-3 py-1.5">
                      Export Options
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-white/10 my-1" />
                    
                    <DropdownMenuItem 
                      onClick={exportToPDF}
                      className="flex items-center gap-2.5 px-3 py-2 text-xs rounded-xl hover:bg-indigo-600/20 text-slate-200 hover:text-white cursor-pointer transition-colors"
                    >
                      <Printer className="h-4 w-4 text-indigo-400" />
                      <div>
                        <div className="font-medium">Save as PDF / Print</div>
                        <div className="text-[10px] text-slate-400">Formatted support document</div>
                      </div>
                    </DropdownMenuItem>

                    <DropdownMenuItem 
                      onClick={exportToText}
                      className="flex items-center gap-2.5 px-3 py-2 text-xs rounded-xl hover:bg-indigo-600/20 text-slate-200 hover:text-white cursor-pointer transition-colors"
                    >
                      <FileDown className="h-4 w-4 text-purple-400" />
                      <div>
                        <div className="font-medium">Download as Text (.txt)</div>
                        <div className="text-[10px] text-slate-400">Raw troubleshooting log</div>
                      </div>
                    </DropdownMenuItem>

                    <DropdownMenuSeparator className="bg-white/10 my-1" />

                    <DropdownMenuItem 
                      onClick={copyFullTranscript}
                      className="flex items-center gap-2.5 px-3 py-2 text-xs rounded-xl hover:bg-indigo-600/20 text-slate-200 hover:text-white cursor-pointer transition-colors"
                    >
                      {copiedId === "full-transcript" ? (
                        <Check className="h-4 w-4 text-emerald-400" />
                      ) : (
                        <Share2 className="h-4 w-4 text-sky-400" />
                      )}
                      <div>
                        <div className="font-medium">{copiedId === "full-transcript" ? "Copied to Clipboard!" : "Copy Full Transcript"}</div>
                        <div className="text-[10px] text-slate-400">Copy all to clipboard</div>
                      </div>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* New Chat Button */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearChat}
                  className="h-8 rounded-xl border-white/10 bg-white/[0.03] hover:bg-white/10 text-xs text-slate-300 transition-colors"
                  title="Start a new conversation"
                >
                  <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
                  <span>New Chat</span>
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Scrollable Messages Area */}
        <div 
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto min-h-0 p-4 md:p-6 space-y-6 scroll-smooth scrollbar-thin scrollbar-thumb-indigo-500/20 scrollbar-track-transparent"
        >
          {messages.length === 0 ? (
            <div className="h-full min-h-[300px] flex flex-col items-center justify-center text-center p-6 space-y-4 my-auto">
              <div className="relative">
                <div className="p-5 rounded-3xl bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 text-indigo-400 shadow-xl shadow-indigo-500/10">
                  <Sparkles className="h-10 w-10 animate-bounce" />
                </div>
                <div className="absolute -bottom-1 -right-1 p-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400">
                  <Check className="h-3 w-3" />
                </div>
              </div>

              <div className="max-w-md space-y-1.5">
                <h3 className="text-lg font-bold text-white">How can I assist your workflow today?</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Ask me about SAP FI, MM, SD, PM, Basis error codes, transaction workflows, or internal company guidelines.
                </p>
              </div>

              {/* Quick Prompts Grid */}
              <div className="w-full max-w-xl pt-2">
                <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest mb-3">Popular Inquiries</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {suggestedPrompts.map((p, idx) => (
                    <button
                      key={idx}
                      onClick={() => sendMessage(p.text)}
                      className="p-3 rounded-2xl bg-slate-900/50 hover:bg-slate-900/90 border border-white/5 hover:border-indigo-500/30 text-left transition-all group flex flex-col justify-between gap-2 text-xs"
                    >
                      <span className="text-slate-300 group-hover:text-white line-clamp-2">{p.text}</span>
                      <span className="text-[10px] font-bold text-indigo-400 w-fit px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20">
                        {p.tag}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            messages.map((msg) => (
              <div 
                key={msg.id} 
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} animate-in fade-in-50 duration-200`}
              >
                {msg.role === "user" ? (
                  <div className="flex gap-3 max-w-[85%] sm:max-w-[75%] flex-row-reverse">
                    {/* User Avatar */}
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white text-xs font-bold shadow-md shadow-indigo-600/30 border border-white/20 shrink-0 mt-0.5">
                      <User className="h-4 w-4" />
                    </div>

                    {/* User Bubble */}
                    <div className="flex flex-col space-y-1 items-end min-w-0">
                      <div className="rounded-2xl rounded-tr-xs bg-indigo-600 text-white px-4 py-3 shadow-lg shadow-indigo-600/25 border border-indigo-400/40">
                        {/* Role & Time Header */}
                        <div className="flex items-center justify-between gap-4 mb-1.5 pb-1 border-b border-white/20 text-[10px] font-bold uppercase tracking-wider text-indigo-100">
                          <span>YOU</span>
                          <span className="flex items-center gap-1 font-normal text-indigo-200">
                            <Clock className="h-3 w-3" />
                            {msg.timestamp}
                          </span>
                        </div>

                        {/* Content */}
                        <p className="whitespace-pre-wrap text-sm leading-relaxed text-white font-normal break-words">
                          {msg.content}
                        </p>

                        {/* Attachment Tag */}
                        {msg.attachmentName && (
                          <div className="mt-2.5 inline-flex items-center gap-2 rounded-lg bg-indigo-700/70 border border-white/15 px-2.5 py-1 text-xs text-white">
                            <FileText className="h-3.5 w-3.5 text-indigo-200" />
                            <span className="truncate max-w-[180px]">{msg.attachmentName}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-3 max-w-[92%] md:max-w-[85%] flex-row">
                    {/* AI Avatar */}
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shadow-md shadow-purple-500/20 border border-white/20 shrink-0 mt-0.5">
                      <Bot className="h-4 w-4" />
                    </div>

                    {/* AI Bubble */}
                    <div className="flex flex-col space-y-1 min-w-0 flex-1">
                      <div className="rounded-2xl rounded-tl-xs bg-slate-900/90 backdrop-blur-xl border border-white/10 text-slate-200 px-5 py-4 shadow-xl">
                        {/* Role & Actions Header */}
                        <div className="flex items-center justify-between gap-3 mb-2.5 pb-1.5 border-b border-white/10 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                          <span className="flex items-center gap-1.5 text-indigo-300 font-bold">
                            <Bot className="h-3.5 w-3.5 text-indigo-400" />
                            AI ASSISTANT
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="flex items-center gap-1 text-slate-400 font-normal">
                              <Clock className="h-3 w-3" />
                              {msg.timestamp}
                            </span>
                            <button
                              onClick={() => copyToClipboard(msg.content, msg.id)}
                              className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                              title="Copy response"
                            >
                              {copiedId === msg.id ? (
                                <Check className="h-3.5 w-3.5 text-emerald-400" />
                              ) : (
                                <Copy className="h-3.5 w-3.5" />
                              )}
                            </button>
                          </div>
                        </div>

                        {/* Content */}
                        <div className="space-y-1">
                          {renderFormattedContent(msg.content)}
                        </div>

                        {/* Attachment Tag */}
                        {msg.attachmentName && (
                          <div className="mt-3 inline-flex items-center gap-2 rounded-xl bg-slate-950/60 border border-white/10 px-3 py-1.5 text-xs text-slate-300">
                            <FileText className="h-3.5 w-3.5 text-indigo-400" />
                            <span className="truncate max-w-[200px]">{msg.attachmentName}</span>
                          </div>
                        )}

                      {/* Source Citations */}
                      {msg.citations && (
                        <div className="mt-4 rounded-2xl border border-indigo-500/20 bg-indigo-950/30 p-3 text-xs text-slate-300">
                          <div className="flex items-center gap-1.5 font-semibold text-indigo-300 mb-1.5">
                            <BookOpen className="h-3.5 w-3.5 text-indigo-400" />
                            <span>Document References</span>
                          </div>
                          <div className="whitespace-pre-wrap text-[11px] text-slate-300 font-mono leading-relaxed bg-slate-950/60 p-2.5 rounded-xl border border-white/5">
                            {msg.citations}
                          </div>
                        </div>
                      )}

                      {/* Confidence Score Pill */}
                      {typeof msg.confidence === "number" && (
                        <div className="mt-3 flex items-center justify-between rounded-xl bg-slate-950/50 border border-white/5 px-3 py-1.5 text-xs text-slate-400">
                          <span>Confidence Score</span>
                          <span className={`font-bold ${msg.confidence < 0.7 ? "text-amber-400" : "text-emerald-400"}`}>
                            {(msg.confidence * 100).toFixed(0)}%
                          </span>
                        </div>
                      )}

                      {/* Low Confidence Escalation Box */}
                      {msg.confidence_low && (
                        <div className="mt-4 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-3.5 space-y-2.5">
                          <div className="flex items-center gap-2 text-amber-300 text-xs font-bold">
                            <AlertTriangle className="h-4 w-4 text-amber-400" />
                            <span>Low Confidence Response</span>
                          </div>
                          <p className="text-xs text-slate-300 leading-relaxed">
                            This issue might require specialized human diagnosis. You can create a direct support ticket for enterprise experts.
                          </p>

                          {escalatedTickets[msg.id] ? (
                            <div className="flex items-center gap-2 text-xs text-emerald-300 font-semibold bg-emerald-500/10 border border-emerald-500/20 px-3 py-2 rounded-xl">
                              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                              <span>Ticket #{escalatedTickets[msg.id]} created & assigned to human experts</span>
                            </div>
                          ) : (
                            <Button
                              size="sm"
                              onClick={() => raiseEscalationTicket(msg)}
                              disabled={escalatingId === msg.id}
                              className="rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold h-8 shadow-md shadow-amber-600/20"
                            >
                              {escalatingId === msg.id ? (
                                <>
                                  <Loader2 className="h-3 w-3 animate-spin mr-1.5" />
                                  Creating Ticket...
                                </>
                              ) : (
                                <>
                                  <LifeBuoy className="h-3.5 w-3.5 mr-1.5" />
                                  Escalate to Human Expert
                                </>
                              )}
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                )}
              </div>
            ))
          )}

          {/* AI Generating Loading Skeleton */}
          {isLoading && (
            <div className="flex justify-start animate-in fade-in-50 duration-200">
              <div className="flex gap-3 max-w-[80%]">
                <div className="w-8 h-8 rounded-xl bg-purple-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-1 shadow-md shadow-purple-500/20">
                  <Bot className="h-4 w-4 animate-pulse" />
                </div>
                <div className="bg-slate-900/80 border border-white/10 rounded-3xl rounded-tl-none p-4 space-y-3 min-w-[260px] md:min-w-[340px]">
                  <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                    <Loader2 className="h-3 w-3 animate-spin text-indigo-400" />
                    <span>Analyzing documents & generating solution...</span>
                  </div>
                  <div className="space-y-2">
                    <div className="h-3.5 rounded bg-slate-800 animate-pulse w-full" />
                    <div className="h-3.5 rounded bg-slate-800 animate-pulse w-5/6" />
                    <div className="h-3.5 rounded bg-slate-800 animate-pulse w-3/4" />
                  </div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} className="h-1" />
        </div>

        {/* Scroll to Bottom Quick Button */}
        {showScrollBottom && (
          <button
            onClick={() => scrollToBottom("smooth")}
            className="absolute bottom-28 right-6 z-30 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xl shadow-indigo-600/30 transition-all transform hover:scale-105"
          >
            <ArrowDown className="h-3.5 w-3.5 animate-bounce" />
            <span>Latest message</span>
          </button>
        )}

        {/* Chat Input Footer */}
        <div className="p-4 border-t border-white/10 bg-slate-900/70 backdrop-blur-xl z-20 flex-shrink-0">
          {/* Quick Prompts Chip Bar (When Chat has active messages) */}
          {messages.length > 0 && (
            <div className="flex items-center gap-2 overflow-x-auto pb-2.5 mb-2 scrollbar-none">
              <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-500 flex-shrink-0 flex items-center gap-1">
                <Sparkle className="h-3 w-3 text-indigo-400" />
                Prompts:
              </span>
              {suggestedPrompts.slice(0, 3).map((prompt, i) => (
                <button
                  key={i}
                  onClick={() => sendMessage(prompt.text)}
                  className="px-3 py-1 rounded-full text-xs bg-slate-950/60 hover:bg-white/10 text-slate-300 hover:text-white border border-white/5 hover:border-white/15 whitespace-nowrap transition-colors flex-shrink-0"
                >
                  {prompt.text}
                </button>
              ))}
            </div>
          )}

          {/* Attachment Preview Chip */}
          {attachment && (
            <div className="mb-3 flex items-center justify-between p-2.5 rounded-2xl bg-indigo-950/40 border border-indigo-500/20 text-xs text-slate-200">
              <div className="flex items-center gap-2 truncate">
                <FileText className="h-4 w-4 text-indigo-400 flex-shrink-0" />
                <span className="font-medium truncate">{attachment.name}</span>
                <span className="text-slate-400 text-[11px]">({(attachment.size / 1024 / 1024).toFixed(2)} MB)</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setAttachment(null)
                  setPreviewUrl(null)
                }}
                className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )}

          {/* Input & Send Controls */}
          <div className="flex items-end gap-2 bg-slate-950/80 border border-white/15 focus-within:border-indigo-500/60 rounded-2xl p-1.5 transition-all shadow-inner">
            {/* Attachment Button */}
            <label className="p-2.5 rounded-xl hover:bg-white/5 text-slate-400 hover:text-indigo-300 transition-colors cursor-pointer flex-shrink-0" title="Attach file or screenshot">
              <Paperclip className="h-4 w-4" />
              <input
                type="file"
                accept="image/*,application/pdf"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0] ?? null
                  if (file) {
                    setAttachment(file)
                    setPreviewUrl(file.type.startsWith("image/") ? URL.createObjectURL(file) : null)
                  }
                }}
              />
            </label>

            {/* Textarea */}
            <textarea
              ref={textareaRef}
              rows={1}
              value={input}
              onChange={(e) => {
                setInput(e.target.value)
                e.target.style.height = "auto"
                e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`
              }}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
              placeholder="Ask an SAP question (e.g. How to fix FI Document Posting Error F5080?)..."
              className="flex-1 bg-transparent border-0 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-0 resize-none py-2 px-1 max-h-32 min-h-[36px]"
            />

            {/* Send Button */}
            <Button
              type="button"
              onClick={() => sendMessage(input)}
              disabled={isLoading || (!input.trim() && !attachment)}
              className="h-10 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition-all shadow-md shadow-indigo-600/30 flex-shrink-0 disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  <span className="hidden sm:inline ml-1 text-xs">Send</span>
                </>
              )}
            </Button>
          </div>

          <p className="text-[10px] text-slate-500 text-center mt-2">
            Press <kbd className="px-1 py-0.5 rounded bg-slate-900 border border-white/10 font-mono text-[9px]">Enter</kbd> to send, <kbd className="px-1 py-0.5 rounded bg-slate-900 border border-white/10 font-mono text-[9px]">Shift + Enter</kbd> for new line.
          </p>
        </div>
      </Card>
    </div>
  )
}
