import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, AlertCircle, Clock, CheckCircle, UserCheck, Send, MessageSquare, CheckCircle2, RefreshCw } from "lucide-react"
import api from "@/lib/api"
import { Skeleton } from "@/components/ui/skeleton"

type Ticket = {
  id: number
  title: string
  description: string
  status: "Open" | "In Progress" | "Resolved"
  priority: "Low" | "Medium" | "High" | "Critical"
  category: string
  created_at: string
  user_email: string
  assigned_expert: string
  expert_email: string
  expert_phone: string
}

type Note = {
  id: number
  ticket_id: number
  author: string
  author_role: string
  message: string
  created_at: string
}

export default function ExpertTickets() {
  const [searchTerm, setSearchTerm] = useState("")
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [userRole, setUserRole] = useState<string>("expert")
  const [userEmail, setUserEmail] = useState<string>("")
  const [userName, setUserName] = useState<string>("Expert")
  const [loading, setLoading] = useState(true)
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null)
  
  // Notes state
  const [notes, setNotes] = useState<Note[]>([])
  const [noteInput, setNoteInput] = useState("")
  const [sendingNote, setSendingNote] = useState(false)
  const [updatingStatus, setUpdatingStatus] = useState(false)
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const notesEndRef = useRef<HTMLDivElement>(null)

  const showToast = (text: string, type: "success" | "error" = "success") => {
    setFeedback({ type, text })
    setTimeout(() => setFeedback(null), 3500)
  }

  const fetchTickets = () => {
    setLoading(true)
    api.get("/api/tickets")
      .then(res => {
        setTickets(res.data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }

  const fetchNotes = (ticketId: number) => {
    api.get(`/api/tickets/${ticketId}/notes`)
      .then(res => {
        setNotes(res.data || [])
        setTimeout(() => notesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }), 100)
      })
      .catch(() => setNotes([]))
  }

  useEffect(() => {
    const role = localStorage.getItem("userRole") || "expert"
    const email = localStorage.getItem("userEmail") || ""
    const name = localStorage.getItem("userName") || "SAP Consultant"
    setUserRole(role)
    setUserEmail(email)
    setUserName(name)
    fetchTickets()
  }, [])

  const selectTicket = (ticket: Ticket) => {
    setSelectedTicket(ticket)
    fetchNotes(ticket.id)
  }

  const handleStatusChange = async (newStatus: string) => {
    if (!selectedTicket) return
    setUpdatingStatus(true)
    try {
      const resp = await api.post(`/api/tickets/${selectedTicket.id}/status`, { status: newStatus })
      if (resp.data.status === "success") {
        // Update local state
        const updatedTickets = tickets.map(t => {
          if (t.id === selectedTicket.id) {
            return { ...t, status: newStatus as any }
          }
          return t
        })
        setTickets(updatedTickets)
        setSelectedTicket({ ...selectedTicket, status: newStatus as any })
        
        // Add an auto system note about status update
        try {
          await api.post(`/api/tickets/${selectedTicket.id}/notes`, {
            message: `System Alert: Ticket status updated to '${newStatus}' by Expert.`,
            author: userName,
            author_role: "expert"
          })
        } catch {
          // ignore if note post fails
        }
        
        fetchNotes(selectedTicket.id)
        showToast(`Ticket status updated to '${newStatus}'`)
      }
    } catch (err: any) {
      console.error("Failed to update status:", err)
      const msg = err.response?.data?.detail || "Failed to update status. Please try again."
      showToast(msg, "error")
    } finally {
      setUpdatingStatus(false)
    }
  }

  const handleSendNote = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!noteInput.trim() || !selectedTicket) return
    setSendingNote(true)
    const noteText = noteInput.trim()
    try {
      const resp = await api.post(`/api/tickets/${selectedTicket.id}/notes`, {
        message: noteText,
        author: userName,
        author_role: "expert"
      })
      if (resp.data.status === "success") {
        setNoteInput("")
        fetchNotes(selectedTicket.id)
        showToast("Note added successfully")
      }
    } catch (err: any) {
      console.error("Failed to add note:", err)
      const msg = err.response?.data?.detail || "Failed to add note. Please try again."
      showToast(msg, "error")
    } finally {
      setSendingNote(false)
    }
  }

  const filteredTickets = tickets.filter(t => 
    t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.id.toString().includes(searchTerm)
  )

  return (
    <div className="grid gap-6 md:grid-cols-3 relative z-10 text-white">
      {/* Left side: Tickets List */}
      <Card className="glass-panel border-white/5 bg-slate-900/40 backdrop-blur-xl md:col-span-2 rounded-3xl p-6 shadow-xl flex flex-col h-[calc(100vh-140px)]">
        <CardHeader className="px-0 pt-0 pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-bold tracking-tight">Assigned Tickets</CardTitle>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={fetchTickets}
              className="h-8 px-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-xs text-slate-300"
            >
              <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
          <div className="relative mt-2">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search assigned tickets by title, body, or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 h-10 bg-slate-950/50 border-white/10 text-white rounded-xl placeholder:text-slate-500 focus-visible:ring-1 focus-visible:ring-indigo-500"
            />
          </div>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto px-0 pb-0 pt-2">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <Skeleton key={i} className="h-16 w-full bg-white/5 rounded-xl" />
              ))}
            </div>
          ) : filteredTickets.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle className="mx-auto h-12 w-12 text-emerald-400/20 mb-3" />
              <p className="text-sm font-semibold text-slate-300">No tickets found</p>
              <p className="text-xs text-slate-500 mt-1">There are no tickets assigned to your email.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="border-b border-white/5">
                  <TableRow className="hover:bg-transparent border-b-white/5">
                    <TableHead className="text-xs font-bold text-slate-400 uppercase tracking-wider w-16">ID</TableHead>
                    <TableHead className="text-xs font-bold text-slate-400 uppercase tracking-wider">Ticket Info</TableHead>
                    <TableHead className="text-xs font-bold text-slate-400 uppercase tracking-wider w-24 text-center">Priority</TableHead>
                    <TableHead className="text-xs font-bold text-slate-400 uppercase tracking-wider w-28 text-center">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTickets.map((t) => (
                    <TableRow 
                      key={t.id}
                      onClick={() => selectTicket(t)}
                      className={`cursor-pointer hover:bg-white/5 border-b border-white/5 transition-colors ${
                        selectedTicket?.id === t.id ? "bg-indigo-600/10 border-l-2 border-l-indigo-500" : ""
                      }`}
                    >
                      <TableCell className="font-bold text-slate-400">#{t.id}</TableCell>
                      <TableCell>
                        <div className="font-semibold text-white line-clamp-1">{t.title}</div>
                        <div className="text-xs text-slate-400 line-clamp-1 mt-0.5">{t.description}</div>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className={`text-[10px] px-2 py-0.5 font-bold rounded-full border ${
                          t.priority === "High" || t.priority === "Critical" ? "bg-red-500/10 text-red-300 border-red-500/20" :
                          t.priority === "Medium" ? "bg-amber-500/10 text-amber-300 border-amber-500/20" :
                          "bg-blue-500/10 text-blue-300 border-blue-500/20"
                        }`}>
                          {t.priority}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className={`inline-flex items-center gap-1 text-[10px] px-2.5 py-1 font-bold rounded-full ${
                          t.status === "Open" ? "bg-red-500/10 text-red-300" :
                          t.status === "In Progress" ? "bg-amber-500/10 text-amber-300" :
                          "bg-emerald-500/10 text-emerald-300"
                        }`}>
                          {t.status === "Open" && <AlertCircle className="h-3 w-3" />}
                          {t.status === "In Progress" && <Clock className="h-3 w-3" />}
                          {t.status === "Resolved" && <CheckCircle className="h-3 w-3" />}
                          {t.status}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Right side: Detailed Workspace & Notes */}
      <Card className="glass-panel border-white/5 bg-slate-900/40 backdrop-blur-xl rounded-3xl p-6 shadow-xl h-[calc(100vh-140px)] flex flex-col">
        {feedback && (
          <div className={`mb-3 p-2.5 rounded-xl text-xs flex items-center gap-2 animate-in fade-in slide-in-from-top-1 ${
            feedback.type === "success" 
              ? "bg-emerald-950/60 border border-emerald-500/30 text-emerald-300" 
              : "bg-red-950/60 border border-red-500/30 text-red-300"
          }`}>
            {feedback.type === "success" ? <CheckCircle2 className="h-3.5 w-3.5 flex-shrink-0" /> : <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />}
            <span>{feedback.text}</span>
          </div>
        )}

        {selectedTicket ? (
          <div className="flex flex-col h-full overflow-hidden">
            {/* Ticket Header & Status Control */}
            <div className="pb-4 border-b border-white/5">
              <span className="text-xs text-indigo-400 font-semibold uppercase tracking-widest">#{selectedTicket.id} / Category: {selectedTicket.category}</span>
              <h2 className="text-lg font-bold text-white mt-1 leading-snug">{selectedTicket.title}</h2>
              <p className="text-xs text-slate-400 mt-1">Submitted by: {selectedTicket.user_email}</p>
              
              {/* Status Actions */}
              <div className="mt-4 flex flex-col gap-2">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Update Status</span>
                <div className="flex gap-2">
                  <Button 
                    onClick={() => handleStatusChange("In Progress")}
                    disabled={selectedTicket.status === "In Progress" || updatingStatus}
                    className="flex-1 h-8 rounded-lg bg-amber-600/20 text-amber-400 border border-amber-500/20 text-xs hover:bg-amber-600/30 disabled:opacity-50"
                  >
                    In Progress
                  </Button>
                  <Button 
                    onClick={() => handleStatusChange("Resolved")}
                    disabled={selectedTicket.status === "Resolved" || updatingStatus}
                    className="flex-1 h-8 rounded-lg bg-emerald-600/20 text-emerald-400 border border-emerald-500/20 text-xs hover:bg-emerald-600/30 disabled:opacity-50"
                  >
                    Resolve
                  </Button>
                </div>
              </div>
            </div>

            {/* Ticket Description */}
            <div className="py-4 border-b border-white/5 max-h-36 overflow-y-auto">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Issue Description</span>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed whitespace-pre-wrap">{selectedTicket.description}</p>
            </div>

            {/* Notes Section */}
            <div className="flex-1 flex flex-col overflow-hidden pt-4">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                <MessageSquare className="h-3 w-3" /> Collaboration Notes ({notes.length})
              </span>
              
              {/* Messages List */}
              <div className="flex-1 overflow-y-auto space-y-3 pr-1 mb-4">
                {notes.length === 0 ? (
                  <p className="text-xs text-slate-500 text-center py-6">No comments or activity logs yet.</p>
                ) : (
                  notes.map((note) => {
                    const isSelf = note.author === userName || note.author_role === "expert"
                    const isSystem = note.message.startsWith("System Alert:")
                    return (
                      <div 
                        key={note.id} 
                        className={`flex flex-col max-w-[85%] rounded-xl p-2.5 text-xs ${
                          isSystem 
                            ? "bg-slate-950/20 border border-white/5 mx-auto text-center text-[10px] text-slate-400 max-w-full" 
                            : isSelf 
                              ? "bg-indigo-600/25 text-white border border-indigo-500/10 ml-auto rounded-tr-none" 
                              : "bg-slate-950/40 text-slate-200 border border-white/5 mr-auto rounded-tl-none"
                        }`}
                      >
                        {!isSystem && (
                          <div className="flex justify-between items-center gap-4 mb-1 text-[10px] font-bold text-slate-400">
                            <span>{note.author} ({note.author_role.toUpperCase()})</span>
                          </div>
                        )}
                        <p className="leading-relaxed whitespace-pre-wrap">{note.message}</p>
                        {!isSystem && <span className="text-[8px] text-slate-500 self-end mt-1">{note.created_at}</span>}
                      </div>
                    )
                  })
                )}
                <div ref={notesEndRef} />
              </div>

              {/* Message Input Form */}
              <form onSubmit={handleSendNote} className="flex gap-2 items-center">
                <Input
                  placeholder="Type notes or message..."
                  value={noteInput}
                  onChange={(e) => setNoteInput(e.target.value)}
                  className="flex-1 h-9 bg-slate-950/50 border-white/10 text-white rounded-lg placeholder:text-slate-500 focus-visible:ring-1 focus-visible:ring-indigo-500 text-xs"
                />
                <Button 
                  type="submit" 
                  disabled={sendingNote || !noteInput.trim()}
                  className="h-9 w-9 rounded-lg bg-indigo-600 hover:bg-indigo-500 flex items-center justify-center p-0 disabled:opacity-50"
                >
                  <Send className="h-4 w-4 text-white" />
                </Button>
              </form>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center p-6 text-slate-500">
            <UserCheck className="h-12 w-12 text-slate-600 mb-3" />
            <p className="text-sm font-semibold text-slate-400">No ticket selected</p>
            <p className="text-xs text-slate-600 mt-1">Select a ticket from the left panel to start resolving and adding notes.</p>
          </div>
        )}
      </Card>
    </div>
  )
}
