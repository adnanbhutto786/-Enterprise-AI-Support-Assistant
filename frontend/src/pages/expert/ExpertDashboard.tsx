import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Ticket, 
  CheckCircle2, 
  Clock, 
  Sparkles,
  ChevronRight,
  ClipboardList,
  AlertCircle
} from "lucide-react"
import { Link } from "react-router-dom"
import api from "@/lib/api"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"

type TicketType = {
  id: number
  title: string
  description: string
  category: string
  priority: string
  status: string
  user_email: string
  created_at: string
}

export default function ExpertDashboard() {
  const [userName, setUserName] = useState<string>("SAP Expert")
  const [tickets, setTickets] = useState<TicketType[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const name = localStorage.getItem("userName") || "SAP Consultant"
    setUserName(name)

    api.get("/api/tickets")
      .then(res => {
        setTickets(res.data)
        setLoading(false)
      })
      .catch(err => {
        console.error("Failed to load expert tickets:", err)
        setLoading(false)
      })
  }, [])

  const totalAssigned = tickets.length
  const resolved = tickets.filter(t => t.status === "Resolved").length
  const pending = tickets.filter(t => t.status === "Open" || t.status === "In Progress").length

  return (
    <div className="space-y-8 relative z-10 text-white">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-white/5 bg-gradient-to-r from-slate-900/80 via-indigo-950/40 to-slate-900/80 p-8 backdrop-blur-xl shadow-2xl">
        <div className="absolute top-0 right-0 h-48 w-48 rounded-full bg-indigo-500/10 blur-[80px] pointer-events-none" />
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-400 border border-indigo-500/20 mb-4 animate-pulse">
            <Sparkles className="h-3 w-3" /> SAP Expert Module Active
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white via-indigo-200 to-indigo-100 bg-clip-text text-transparent">
            Welcome, {userName}
          </h1>
          <p className="mt-3 text-slate-400 leading-relaxed text-sm">
            View tickets escalated by users or automatically routed by the AI system. Update status, resolve queries, and write collaboration notes.
          </p>
        </div>
      </div>

      {/* Snapshot Cards */}
      {loading ? (
        <div className="grid gap-6 md:grid-cols-3">
          {[1, 2, 3].map(i => (
            <Card key={i} className="glass-panel border-white/5 bg-white/5 rounded-2xl p-6">
              <Skeleton className="h-4 w-28 bg-white/10 rounded" />
              <Skeleton className="h-8 w-12 bg-white/10 rounded mt-3" />
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="glass-panel border-white/5 bg-white/5 dark:bg-slate-900/40 backdrop-blur-lg hover:border-indigo-500/20 hover:bg-white/10 transition-all duration-300 rounded-2xl group shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-400 group-hover:text-indigo-400 transition-colors">
                Total Assigned
              </CardTitle>
              <div className="h-10 w-10 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center">
                <Ticket className="h-5 w-5" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-extrabold tracking-tight mt-1">{totalAssigned}</div>
              <p className="text-[10px] text-muted-foreground mt-1.5 font-medium">SAP issues routed to you</p>
            </CardContent>
          </Card>

          <Card className="glass-panel border-white/5 bg-white/5 dark:bg-slate-900/40 backdrop-blur-lg hover:border-emerald-500/20 hover:bg-white/10 transition-all duration-300 rounded-2xl group shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-400 group-hover:text-emerald-400 transition-colors">
                Resolved Issues
              </CardTitle>
              <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
                <CheckCircle2 className="h-5 w-5" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-extrabold tracking-tight mt-1">{resolved}</div>
              <p className="text-[10px] text-muted-foreground mt-1.5 font-medium">Successfully resolved tickets</p>
            </CardContent>
          </Card>

          <Card className="glass-panel border-white/5 bg-white/5 dark:bg-slate-900/40 backdrop-blur-lg hover:border-amber-500/20 hover:bg-white/10 transition-all duration-300 rounded-2xl group shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-400 group-hover:text-amber-400 transition-colors">
                Pending Actions
              </CardTitle>
              <div className="h-10 w-10 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center">
                <Clock className="h-5 w-5" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-extrabold tracking-tight mt-1">{pending}</div>
              <p className="text-[10px] text-muted-foreground mt-1.5 font-medium">Open or In Progress status</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Visual Analytics & Resolution Progress */}
      {!loading && totalAssigned > 0 && (
        <Card className="glass-panel border-white/5 bg-slate-900/40 backdrop-blur-xl rounded-3xl p-6 shadow-xl text-white">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex-1 space-y-2">
              <div className="flex items-center justify-between text-sm font-semibold">
                <span className="text-slate-400">Resolution Rate Status</span>
                <span className="text-indigo-400 font-extrabold text-base">
                  {totalAssigned > 0 ? Math.round((resolved / totalAssigned) * 100) : 0}%
                </span>
              </div>
              <div className="h-3 w-full bg-slate-950/60 rounded-full overflow-hidden border border-white/5 relative">
                <div 
                  className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500 rounded-full transition-all duration-1000 ease-out" 
                  style={{ width: `${totalAssigned > 0 ? (resolved / totalAssigned) * 100 : 0}%` }} 
                />
              </div>
              <div className="flex justify-between text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                <span>0% Started</span>
                <span>50% Midpoint</span>
                <span>100% Resolved</span>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4 min-w-[280px]">
              <div className="p-3 bg-slate-950/30 rounded-2xl border border-white/5 text-center">
                <p className="text-slate-500 uppercase tracking-widest font-bold text-[9px]">Resolved</p>
                <p className="text-emerald-400 font-black text-xl mt-1">{resolved}</p>
              </div>
              <div className="p-3 bg-slate-950/30 rounded-2xl border border-white/5 text-center">
                <p className="text-slate-500 uppercase tracking-widest font-bold text-[9px]">Pending</p>
                <p className="text-amber-400 font-black text-xl mt-1">{pending}</p>
              </div>
              <div className="p-3 bg-slate-950/30 rounded-2xl border border-white/5 text-center">
                <p className="text-slate-500 uppercase tracking-widest font-bold text-[9px]">Total</p>
                <p className="text-indigo-400 font-black text-xl mt-1">{totalAssigned}</p>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Main Grid split */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Active Workload List */}
        <Card className="glass-panel border-white/5 bg-slate-900/40 backdrop-blur-xl md:col-span-2 rounded-3xl p-6 shadow-xl">
          <CardHeader className="flex flex-row items-center justify-between px-0 pt-0 pb-4">
            <div>
              <CardTitle className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                <ClipboardList className="h-5 w-5 text-indigo-400" /> Active Tickets Workload
              </CardTitle>
              <CardDescription className="text-slate-400 mt-1 text-xs">
                Your highest-priority pending tickets.
              </CardDescription>
            </div>
            <Link to="/expert/tickets" className="text-xs font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-0.5">
              Manage All <ChevronRight className="h-4 w-4" />
            </Link>
          </CardHeader>
          <CardContent className="px-0 pb-0 pt-2">
            {loading ? (
              <div className="space-y-4">
                {[1, 2].map(i => (
                  <Skeleton key={i} className="h-16 w-full bg-white/5 rounded-xl" />
                ))}
              </div>
            ) : tickets.filter(t => t.status !== "Resolved").length === 0 ? (
              <div className="text-center py-10">
                <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-400/30 mb-3" />
                <p className="text-sm font-semibold text-slate-300">All caught up!</p>
                <p className="text-xs text-slate-500 mt-1">No pending tickets assigned to you.</p>
              </div>
            ) : (
              <div className="divide-y divide-white/5 space-y-3">
                {tickets
                  .filter(t => t.status !== "Resolved")
                  .slice(0, 3)
                  .map(t => (
                    <div key={t.id} className="pt-3 first:pt-0 flex items-center justify-between hover:bg-white/5 p-2 rounded-xl transition-all">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-white">#{t.id} - {t.title}</span>
                          <span className={`text-[10px] px-2 py-0.5 font-bold rounded-full border ${
                            t.priority === "High" ? "bg-red-500/10 text-red-300 border-red-500/20" :
                            t.priority === "Medium" ? "bg-amber-500/10 text-amber-300 border-amber-500/20" :
                            "bg-blue-500/10 text-blue-300 border-blue-500/20"
                          }`}>
                            {t.priority}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 line-clamp-1">{t.description}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`text-[10px] px-2 py-1 font-bold rounded-full ${
                          t.status === "Open" ? "bg-red-500/10 text-red-300" : "bg-amber-500/10 text-amber-300"
                        }`}>
                          {t.status}
                        </span>
                        <Link to="/expert/tickets" className="text-slate-400 hover:text-white">
                          <ChevronRight className="h-5 w-5" />
                        </Link>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Help / Info */}
        <Card className="glass-panel border-white/5 bg-slate-900/40 backdrop-blur-xl rounded-3xl p-6 shadow-xl flex flex-col justify-between">
          <div className="space-y-4">
            <CardHeader className="px-0 pt-0 pb-2">
              <CardTitle className="text-md font-bold text-white flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-indigo-400" /> Resolution Guidelines
              </CardTitle>
            </CardHeader>
            <div className="space-y-3 text-xs text-slate-300">
              <p>1. <strong>Confirm Assignment</strong>: Keep your ticket status updated to <em>In Progress</em> when researching issues.</p>
              <p>2. <strong>Collaboration Notes</strong>: Add detailed logs of troubleshooting steps inside the ticket comments section.</p>
              <p>3. <strong>KB Contribution</strong>: Upload SOPs or fixes in the Knowledge Base to aid AI-deflection.</p>
            </div>
          </div>
          <div className="pt-6">
            <Link to="/expert/kb">
              <Button className="w-full bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold py-2">
                Browse Knowledge Base
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  )
}
