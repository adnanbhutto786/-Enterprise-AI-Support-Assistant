import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, AlertCircle, Clock, CheckCircle, UserCheck, Paperclip, Send, Mail, MessageSquare } from "lucide-react"
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
  attachments: string[]
  conversation_summary: string
}

type Note = {
  id: number
  ticket_id: number
  author: string
  author_role: string
  message: string
  created_at: string
}

type ExpertUser = {
  id: number
  email: string
  name: string
  phone: string
  role: string
  status: string
}

export default function TicketManagement() {
  const [searchTerm, setSearchTerm] = useState("")
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [userRole, setUserRole] = useState<string>("employee")
  const [userEmail, setUserEmail] = useState<string>("")
  const [loading, setLoading] = useState(true)
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null)
  const [newTicketTitle, setNewTicketTitle] = useState("")
  const [newTicketDesc, setNewTicketDesc] = useState("")

  // Expert assign state
  const [expertName, setExpertName] = useState("")
  const [expertEmail, setExpertEmail] = useState("")
  const [expertPhone, setExpertPhone] = useState("")
  const [expertsList, setExpertsList] = useState<ExpertUser[]>([])
  const [assigningSaving, setAssigningSaving] = useState(false)
  const [assignSuccess, setAssignSuccess] = useState("")

  // Notes state
  const [notes, setNotes] = useState<Note[]>([])
  const [noteInput, setNoteInput] = useState("")
  const [sendingNote, setSendingNote] = useState(false)
  const notesEndRef = useRef<HTMLDivElement>(null)

  const fetchTickets = () => {
    api.get("/api/tickets")
      .then(res => {
        const safeTickets = res.data.map((t: Ticket) => ({
          ...t,
          assigned_expert: t.assigned_expert || "",
          expert_email: t.expert_email || "",
          expert_phone: t.expert_phone || "",
          attachments: t.attachments || [],
          conversation_summary: t.conversation_summary || "",
        }))
        setTickets(safeTickets)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }

  const fetchNotes = (ticketId: number) => {
    api.get(`/api/tickets/${ticketId}/notes`)
      .then(res => {
        setNotes(res.data)
        setTimeout(() => notesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }), 100)
      })
      .catch(() => setNotes([]))
  }

  const fetchExperts = () => {
    api.get("/api/experts")
      .then(res => setExpertsList(res.data))
      .catch(() => setExpertsList([]))
  }

  useEffect(() => {
    const role = localStorage.getItem("userRole") || "employee"
    const email = localStorage.getItem("userEmail") || ""
    setUserRole(role)
    setUserEmail(email)
    fetchTickets()
    fetchExperts()
  }, [])

  const selectTicket = (ticket: Ticket) => {
    setSelectedTicket(ticket)
    setExpertName(ticket.assigned_expert || "")
    setExpertEmail(ticket.expert_email || "")
    setExpertPhone(ticket.expert_phone || "")
    setAssignSuccess("")
    fetchNotes(ticket.id)
    fetchExperts()
  }

  const handleResolve = (id: number) => {
    api.post(`/api/tickets/${id}/resolve`)
      .then(() => {
        fetchTickets()
        if (selectedTicket?.id === id) {
          setSelectedTicket(prev => prev ? { ...prev, status: "Resolved" } : null)
        }
      })
      .catch(err => console.error("Failed to resolve ticket:", err))
  }

  const handleAssignExpert = () => {
    if (!expertName.trim() || !selectedTicket) return
    setAssigningSaving(true)
    setAssignSuccess("")
    api.post(`/api/tickets/${selectedTicket.id}/assign`, {
      expert_name: expertName.trim(),
      expert_email: expertEmail.trim(),
      expert_phone: expertPhone.trim(),
    })
      .then(() => {
        setTickets(prev => prev.map(t =>
          t.id === selectedTicket.id
            ? { ...t, assigned_expert: expertName.trim(), expert_email: expertEmail.trim(), expert_phone: expertPhone.trim(), status: "In Progress" }
            : t
        ))
        setSelectedTicket(prev => prev
          ? { ...prev, assigned_expert: expertName.trim(), expert_email: expertEmail.trim(), expert_phone: expertPhone.trim(), status: "In Progress" }
          : null
        )
        setAssignSuccess(expertEmail ? `Expert assigned! Email sent to ${expertEmail}` : "Expert assigned! Status: In Progress")
        setAssigningSaving(false)
      })
      .catch(() => setAssigningSaving(false))
  }

  const handleSendNote = () => {
    if (!noteInput.trim() || !selectedTicket) return
    setSendingNote(true)
    api.post(`/api/tickets/${selectedTicket.id}/notes`, {
      message: noteInput.trim(),
      author: userEmail || (userRole === "admin" ? "Admin" : "Employee"),
      author_role: userRole,
    })
      .then(res => {
        const newNote: Note = {
          id: res.data.id,
          ticket_id: selectedTicket.id,
          author: userEmail || userRole,
          author_role: userRole,
          message: noteInput.trim(),
          created_at: new Date().toISOString().replace("T", " ").slice(0, 19),
        }
        setNotes(prev => [...prev, newNote])
        setNoteInput("")
        setSendingNote(false)
        setTimeout(() => notesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }), 100)
      })
      .catch(() => setSendingNote(false))
  }

  const handleCreateTicket = () => {
    if (!newTicketTitle.trim() || !newTicketDesc.trim()) return
    const email = localStorage.getItem("userEmail") || "employee@company.com"
    api.post("/api/tickets", {
      title: newTicketTitle,
      description: newTicketDesc,
      category: "General",
      priority: "Medium",
      user_email: email
    })
    .then(() => {
      fetchTickets()
      setNewTicketTitle("")
      setNewTicketDesc("")
    })
    .catch(err => console.error("Failed to create ticket:", err))
  }

  const filteredTickets = tickets.filter(ticket =>
    ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ticket.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    String(ticket.id).includes(searchTerm)
  )

  return (
    <div className="space-y-6 text-white relative z-10">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">Ticket Log</h1>
          <p className="text-slate-400 mt-2 text-sm">
            {userRole === "admin"
              ? "Monitor and resolve all SAP support tickets escalated by employees or generated by the AI."
              : "Track and manage SAP support tickets generated manually or escalated by the AI."
            }
          </p>
        </div>
        {userRole !== "admin" && (
          <Card className="w-full xl:w-auto border-white/5 bg-slate-900/40 backdrop-blur-md shadow-xl">
            <CardContent className="space-y-3 p-6">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Create new support ticket</p>
              <Input value={newTicketTitle} onChange={(e) => setNewTicketTitle(e.target.value)} placeholder="Issue title" className="bg-slate-950/50 border-white/10 text-white placeholder-slate-500 rounded-2xl" />
              <Input value={newTicketDesc} onChange={(e) => setNewTicketDesc(e.target.value)} placeholder="Short description" className="bg-slate-950/50 border-white/10 text-white placeholder-slate-500 rounded-2xl" />
              <Button onClick={handleCreateTicket} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl h-11">Create Ticket</Button>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="flex flex-col gap-4 xl:flex-row xl:items-start">
        {/* Tickets Table */}
        <div className="flex-1">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-3.5 h-4 w-4 text-slate-500" />
            <Input placeholder="Search tickets by ID, title or module..." className="pl-9 bg-slate-950/40 border-white/10 text-white placeholder-slate-500 rounded-2xl" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>

          <Card className="mt-4 border-white/5 bg-slate-900/40 backdrop-blur-md text-white shadow-xl hidden md:block">
            <Table>
              <TableHeader>
                <TableRow className="border-white/5">
                  <TableHead className="text-slate-400">Ticket ID</TableHead>
                  <TableHead className="text-slate-400">Issue</TableHead>
                  <TableHead className="text-slate-400">Submitted By</TableHead>
                  <TableHead className="text-slate-400">Date & Time</TableHead>
                  <TableHead className="text-slate-400">Priority</TableHead>
                  <TableHead className="text-slate-400">Status</TableHead>
                  <TableHead className="text-right text-slate-400">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, index) => (
                    <TableRow key={index} className="border-white/5">
                      <TableCell><Skeleton className="h-4 w-16 bg-slate-800" /></TableCell>
                      <TableCell>
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-40 bg-slate-800" />
                          <Skeleton className="h-3 w-60 bg-slate-800" />
                        </div>
                      </TableCell>
                      <TableCell><Skeleton className="h-3 w-32 bg-slate-800" /></TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <Skeleton className="h-3.5 w-20 bg-slate-800" />
                          <Skeleton className="h-2.5 w-12 bg-slate-800" />
                        </div>
                      </TableCell>
                      <TableCell><Skeleton className="h-5 w-16 rounded bg-slate-800" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-20 bg-slate-800" /></TableCell>
                      <TableCell className="text-right"><Skeleton className="h-8 w-16 rounded-xl inline-block bg-slate-800" /></TableCell>
                    </TableRow>
                  ))
                ) : filteredTickets.length === 0 ? (
                  <TableRow><TableCell colSpan={7} className="text-center py-6 text-slate-500">No tickets found.</TableCell></TableRow>
                ) : (
                  filteredTickets.map((ticket) => (
                    <TableRow
                      key={ticket.id}
                      className={`border-white/5 cursor-pointer transition-all hover:bg-white/5 ${selectedTicket?.id === ticket.id ? "bg-indigo-500/10" : ""}`}
                      onClick={() => selectTicket(ticket)}
                    >
                      <TableCell className="font-bold text-slate-300">#TS-{ticket.id}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-slate-200">{ticket.title}</p>
                          <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">{ticket.category} · {ticket.description}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-slate-300 text-xs">{ticket.user_email || "—"}</TableCell>
                      <TableCell>
                        <div className="text-xs text-slate-300 whitespace-nowrap">
                          {ticket.created_at ? (
                            <>
                              <p className="font-semibold text-slate-200">{ticket.created_at.split(" ")[0]}</p>
                              <p className="text-slate-500">{ticket.created_at.split(" ")[1] || ""}</p>
                            </>
                          ) : "—"}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                          ticket.priority === "Critical" || ticket.priority === "High" ? "bg-red-500/15 text-red-400 border border-red-500/20"
                          : ticket.priority === "Medium" ? "bg-yellow-500/15 text-yellow-400 border border-yellow-500/20"
                          : "bg-green-500/15 text-green-400 border border-green-500/20"
                        }`}>{ticket.priority}</span>
                      </TableCell>
                      <TableCell>
                        <span className="flex items-center gap-1.5 text-xs font-semibold">
                          {ticket.status === "Open" && <AlertCircle className="h-4 w-4 text-red-400" />}
                          {ticket.status === "In Progress" && <Clock className="h-4 w-4 text-yellow-400 animate-pulse" />}
                          {ticket.status === "Resolved" && <CheckCircle className="h-4 w-4 text-green-400" />}
                          <span className={ticket.status === "Resolved" ? "text-green-400" : ticket.status === "In Progress" ? "text-yellow-400" : "text-slate-200"}>{ticket.status}</span>
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        {userRole === "admin" && ticket.status !== "Resolved" ? (
                          <Button onClick={(e) => { e.stopPropagation(); handleResolve(ticket.id) }} size="sm" className="bg-green-600 hover:bg-green-700 text-white rounded-xl text-xs">Resolve</Button>
                        ) : (
                          <span className="text-xs text-slate-500 font-medium">{ticket.status === "Resolved" ? "✓" : "—"}</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Card>

          {/* Mobile responsive card layout */}
          <div className="mt-4 space-y-4 md:hidden">
            {loading ? (
              Array.from({ length: 3 }).map((_, index) => (
                <Card key={index} className="border-white/5 bg-slate-900/40 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-4 w-20 bg-slate-800" />
                    <Skeleton className="h-5 w-16 bg-slate-800" />
                  </div>
                  <Skeleton className="h-4 w-3/4 bg-slate-800" />
                  <Skeleton className="h-3 w-1/2 bg-slate-800" />
                  <div className="flex items-center justify-between pt-2 border-t border-white/5">
                    <Skeleton className="h-3 w-24 bg-slate-800" />
                    <Skeleton className="h-6 w-16 bg-slate-800" />
                  </div>
                </Card>
              ))
            ) : filteredTickets.length === 0 ? (
              <p className="text-center py-6 text-slate-500 text-sm">No tickets found.</p>
            ) : (
              filteredTickets.map(ticket => (
                <Card 
                  key={ticket.id} 
                  className={`border-white/5 bg-slate-900/40 p-4 space-y-3 cursor-pointer transition-all hover:bg-white/5 ${selectedTicket?.id === ticket.id ? "border-indigo-500/50 bg-indigo-500/5" : ""}`}
                  onClick={() => selectTicket(ticket)}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-indigo-300">#TS-{ticket.id}</span>
                    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                      ticket.priority === "Critical" || ticket.priority === "High" ? "bg-red-500/15 text-red-400 border border-red-500/20"
                      : ticket.priority === "Medium" ? "bg-yellow-500/15 text-yellow-400 border border-yellow-500/20"
                      : "bg-green-500/15 text-green-400 border border-green-500/20"
                    }`}>{ticket.priority}</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm text-slate-200">{ticket.title}</h4>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2">{ticket.description}</p>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-white/5 text-xs text-slate-500">
                    <span>{ticket.category}</span>
                    <span className="flex items-center gap-1.5 font-semibold">
                      <span className={ticket.status === "Resolved" ? "text-green-400" : ticket.status === "In Progress" ? "text-yellow-400" : "text-slate-200"}>{ticket.status}</span>
                    </span>
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>

        {/* Right Panel */}
        <div className="w-full xl:w-80 space-y-3">
          <Card className="border-white/5 bg-slate-900/40 backdrop-blur-md text-white shadow-xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Ticket Details</CardTitle>
              {selectedTicket && <p className="text-xs text-slate-400 mt-1">#TS-{selectedTicket.id} — {selectedTicket.category} Module</p>}
            </CardHeader>
            <CardContent className="space-y-3">
              {selectedTicket ? (
                <div className="space-y-3">
                  {/* Submitted By */}
                  <div className="rounded-2xl bg-slate-950/70 p-3 border border-white/5">
                    <p className="text-[10px] uppercase tracking-widest text-slate-500 mb-1">Submitted By</p>
                    <p className="text-sm font-semibold text-indigo-300">{selectedTicket.user_email}</p>
                  </div>

                  {/* Date */}
                  <div className="rounded-2xl bg-slate-950/70 p-3 border border-white/5">
                    <p className="text-[10px] uppercase tracking-widest text-slate-500 mb-1">Submitted At</p>
                    <p className="text-sm font-bold text-white">{selectedTicket.created_at?.split(" ")[0]}</p>
                    <p className="text-xs text-slate-400">{selectedTicket.created_at?.split(" ")[1] || ""}</p>
                  </div>

                  {/* Priority + Status */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="rounded-2xl bg-slate-950/70 p-3 border border-white/5">
                      <p className="text-[10px] uppercase tracking-widest text-slate-500 mb-1">Priority</p>
                      <span className={`text-xs font-bold ${selectedTicket.priority === "High" || selectedTicket.priority === "Critical" ? "text-red-400" : selectedTicket.priority === "Medium" ? "text-yellow-400" : "text-green-400"}`}>{selectedTicket.priority}</span>
                    </div>
                    <div className="rounded-2xl bg-slate-950/70 p-3 border border-white/5">
                      <p className="text-[10px] uppercase tracking-widest text-slate-500 mb-1">Status</p>
                      <span className={`text-xs font-bold ${selectedTicket.status === "Resolved" ? "text-green-400" : selectedTicket.status === "In Progress" ? "text-yellow-400" : "text-red-400"}`}>{selectedTicket.status}</span>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="rounded-2xl bg-slate-950/70 p-3 border border-white/5">
                    <p className="text-[10px] uppercase tracking-widest text-slate-500 mb-1">Description</p>
                    <p className="text-xs leading-relaxed text-slate-300">{selectedTicket.description}</p>
                  </div>

                  {/* Assigned Expert */}
                  <div className="rounded-2xl bg-slate-950/70 p-3 border border-white/5">
                    <p className="text-[10px] uppercase tracking-widest text-slate-500 mb-2">Assigned Expert</p>
                    {userRole === "admin" ? (
                      <div className="space-y-3">
                        {assignSuccess && (
                          <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs">{assignSuccess}</div>
                        )}
                        
                        {/* Quick Select Expert Dropdown */}
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <label className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Select Expert from System</label>
                            <span className="text-[10px] text-indigo-400 font-medium">{expertsList.length} Experts Available</span>
                          </div>
                          <select 
                            onFocus={fetchExperts}
                            onChange={(e) => {
                              const selectedId = e.target.value;
                              if (!selectedId) return;
                              const found = expertsList.find(ex => ex.id.toString() === selectedId);
                              if (found) {
                                setExpertName(found.name || found.email);
                                setExpertEmail(found.email);
                                setExpertPhone(found.phone || "");
                              }
                            }}
                            className="w-full h-9 text-xs bg-slate-900 border border-white/10 text-white rounded-xl px-2 focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer"
                          >
                            <option value="">-- Choose Registered Expert --</option>
                            {expertsList.map(exp => (
                              <option key={exp.id} value={exp.id}>
                                {exp.name ? `${exp.name} (${exp.email})` : exp.email} {exp.phone ? `| WhatsApp: ${exp.phone}` : ''}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="space-y-2 pt-1">
                          <Input value={expertName} onChange={(e) => setExpertName(e.target.value)} placeholder="Expert name *" className="h-8 text-xs bg-slate-900/80 border-white/10 text-white placeholder:text-slate-600 rounded-xl" />
                          <Input value={expertEmail} onChange={(e) => setExpertEmail(e.target.value)} placeholder="Expert email (optional)" className="h-8 text-xs bg-slate-900/80 border-white/10 text-white placeholder:text-slate-600 rounded-xl" />
                          <Input value={expertPhone} onChange={(e) => setExpertPhone(e.target.value)} placeholder="WhatsApp number (optional)" className="h-8 text-xs bg-slate-900/80 border-white/10 text-white placeholder:text-slate-600 rounded-xl" />
                        </div>

                        <Button disabled={assigningSaving || !expertName.trim()} onClick={handleAssignExpert}
                          className="w-full h-8 text-xs bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl">
                          {assigningSaving ? "Saving..." : "Assign & Notify Expert"}
                        </Button>
                        {/* Contact links if already assigned */}
                        {selectedTicket.assigned_expert && (
                          <div className="pt-1 space-y-1">
                            <p className="text-[10px] text-slate-500 uppercase tracking-widest">Currently Assigned</p>
                            <p className="text-xs text-indigo-300 flex items-center gap-1"><UserCheck className="h-3 w-3" /> {selectedTicket.assigned_expert}</p>
                            {selectedTicket.expert_email && (
                              <a href={`mailto:${selectedTicket.expert_email}`} className="text-xs text-blue-400 flex items-center gap-1 hover:underline">
                                <Mail className="h-3 w-3" /> {selectedTicket.expert_email}
                              </a>
                            )}
                            {selectedTicket.expert_phone && (
                              <a href={`https://wa.me/${selectedTicket.expert_phone.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer" className="text-xs text-green-400 flex items-center gap-1 hover:underline">
                                <MessageSquare className="h-3 w-3" /> WhatsApp: {selectedTicket.expert_phone}
                              </a>
                            )}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <p className="text-sm font-semibold text-white flex items-center gap-2">
                          <UserCheck className="h-4 w-4 text-indigo-400" />
                          {selectedTicket.assigned_expert || "Not Assigned Yet"}
                        </p>
                        {selectedTicket.expert_email && (
                          <a href={`mailto:${selectedTicket.expert_email}`} className="text-xs text-blue-400 flex items-center gap-1 hover:underline">
                            <Mail className="h-3 w-3" /> {selectedTicket.expert_email}
                          </a>
                        )}
                        {selectedTicket.expert_phone && (
                          <a href={`https://wa.me/${selectedTicket.expert_phone.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer" className="text-xs text-green-400 flex items-center gap-1 hover:underline">
                            <MessageSquare className="h-3 w-3" /> WhatsApp: {selectedTicket.expert_phone}
                          </a>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Admin Resolve Button */}
                  {userRole === "admin" && selectedTicket.status !== "Resolved" && (
                    <Button onClick={() => handleResolve(selectedTicket.id)} className="w-full bg-green-600 hover:bg-green-500 text-white rounded-2xl h-10 text-sm font-bold">
                      <CheckCircle className="h-4 w-4 mr-2" /> Mark as Resolved
                    </Button>
                  )}
                  {userRole === "admin" && selectedTicket.status === "Resolved" && (
                    <div className="text-center py-2 rounded-2xl bg-green-500/10 border border-green-500/20">
                      <p className="text-xs text-green-400 font-semibold">Ticket Resolved</p>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-slate-400">Select a ticket row to preview additional details.</p>
              )}
            </CardContent>
          </Card>

          {/* Notes / Comments Section */}
          {selectedTicket && (
            <Card className="border-white/5 bg-slate-900/40 backdrop-blur-md text-white shadow-xl">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-indigo-400" /> Internal Notes
                </CardTitle>
                <p className="text-[10px] text-slate-500">Messages between admin, expert & employee</p>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Notes List */}
                <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                  {notes.length === 0 ? (
                    <p className="text-xs text-slate-600 text-center py-3">No notes yet. Start the conversation!</p>
                  ) : (
                    notes.map(note => (
                      <div key={note.id} className={`p-2.5 rounded-xl text-xs border ${
                        note.author === userEmail
                          ? "bg-indigo-600/15 border-indigo-500/20 ml-4"
                          : "bg-slate-950/60 border-white/5 mr-4"
                      }`}>
                        <div className="flex items-center justify-between mb-1">
                          <span className={`font-bold text-[10px] uppercase tracking-wide ${
                            note.author_role === "admin" ? "text-red-400" : "text-indigo-300"
                          }`}>
                            {note.author_role === "admin" ? "Admin" : note.author.split("@")[0]}
                          </span>
                          <span className="text-[9px] text-slate-600">{note.created_at.split(" ")[1]?.slice(0,5)}</span>
                        </div>
                        <p className="text-slate-200 leading-relaxed">{note.message}</p>
                      </div>
                    ))
                  )}
                  <div ref={notesEndRef} />
                </div>

                {/* Note Input */}
                <div className="flex gap-2">
                  <Input
                    value={noteInput}
                    onChange={(e) => setNoteInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSendNote()}
                    placeholder="Write a note..."
                    className="h-8 text-xs bg-slate-950/50 border-white/10 text-white placeholder:text-slate-600 rounded-xl flex-1"
                  />
                  <Button
                    size="sm"
                    disabled={sendingNote || !noteInput.trim()}
                    onClick={handleSendNote}
                    className="h-8 w-8 p-0 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shrink-0"
                  >
                    <Send className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
