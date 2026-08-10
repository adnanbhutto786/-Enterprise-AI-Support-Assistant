import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  BarChart as RechartBarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer
} from "recharts"
import { 
  Ticket, 
  CheckCircle2, 
  Clock, 
  Percent, 
  ArrowUpRight, 
  AlertCircle,
  FileText,
  BookOpen,
  MessageSquare,
  Sparkles,
  ChevronRight,
  Bell,
  User,
  ClipboardList
} from "lucide-react"
import { Link } from "react-router-dom"
import api from "@/lib/api"
import { Skeleton } from "@/components/ui/skeleton"

const ticketData = [
  { name: "Mon", tickets: 12, resolved: 8 },
  { name: "Tue", tickets: 19, resolved: 15 },
  { name: "Wed", tickets: 15, resolved: 12 },
  { name: "Thu", tickets: 22, resolved: 18 },
  { name: "Fri", tickets: 9, resolved: 7 },
  { name: "Sat", tickets: 4, resolved: 4 },
  { name: "Sun", tickets: 6, resolved: 5 },
]

type ActivityLog = {
  id: number
  user: string
  action: string
  time: string
  type: string
}

export default function Dashboard() {
  const [userRole, setUserRole] = useState<string>("employee")
  const [userName, setUserName] = useState<string>("User")
  const [stats, setStats] = useState({
    active_tickets: 0,
    resolved_tickets: 0,
    confidence_threshold: 1.1,
    recent_activities: [] as ActivityLog[]
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const role = localStorage.getItem("userRole") || "employee"
    const name = localStorage.getItem("userName") || "Enterprise User"
    setUserRole(role)
    setUserName(name)

    api.get("/api/dashboard/stats")
      .then(res => {
        setStats(res.data)
        setLoading(false)
      })
      .catch(err => {
        console.error("Failed to load dashboard statistics:", err)
        setLoading(false)
      })
  }, [])

  return (
    <div className="space-y-8 relative z-10 text-white">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-white/5 bg-gradient-to-r from-slate-900/80 via-indigo-950/40 to-slate-900/80 p-4 sm:p-6 md:p-8 backdrop-blur-xl shadow-2xl">
        <div className="absolute top-0 right-0 h-48 w-48 rounded-full bg-indigo-500/10 blur-[80px] pointer-events-none" />
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-400 border border-indigo-500/20 mb-3 sm:mb-4 animate-pulse">
            <Sparkles className="h-3 w-3" /> SAP AI Engine Active
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white via-indigo-200 to-indigo-100 bg-clip-text text-transparent">
            Welcome, {userName}
          </h1>
          <p className="mt-2 sm:mt-3 text-slate-400 leading-relaxed text-xs sm:text-sm">
            {userRole === "admin" 
              ? "Optimize configurations, track deflection metrics, manage escalations, and audit system performance globally from this central Admin Hub."
              : "Ask questions from SAP modules, upload images/PDFs for automated OCR verification, and resolve issues instantly."
            }
          </p>
        </div>
      </div>

      {/* User Snapshot */}
      <div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
        <Card className="border-white/5 bg-slate-900/40 backdrop-blur-md shadow-xl hover:border-white/10 transition-all duration-300">
          <CardHeader className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Profile Summary</p>
              <h2 className="mt-3 text-xl font-semibold text-white">{userName}</h2>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-indigo-500/10 text-indigo-300 border border-indigo-500/15">
              <User className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent className="space-y-3 pt-4">
            <div className="rounded-3xl bg-slate-950/60 p-4 border border-white/5">
              <p className="text-sm text-slate-400">Account Role</p>
              <p className="text-base font-semibold text-white capitalize">{userRole}</p>
            </div>
            <div className="rounded-3xl bg-slate-950/60 p-4 border border-white/5">
              <p className="text-sm text-slate-400">Weekly AI interactions</p>
              <p className="text-base font-semibold text-white">32 requests</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-white/5 bg-slate-900/40 backdrop-blur-md shadow-xl hover:border-white/10 transition-all duration-300">
          <CardHeader className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Notifications</p>
              <h2 className="mt-3 text-xl font-semibold text-white">Recent Alerts</h2>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-violet-500/10 text-violet-300 border border-violet-500/15">
              <Bell className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent className="space-y-3 pt-4">
            <div className="grid gap-3">
              <div className="rounded-3xl bg-slate-950/60 p-4 border border-white/5">
                <p className="text-sm text-slate-400">AI response delivered</p>
                <p className="text-sm font-semibold text-white">SAP billing issue resolved</p>
              </div>
              <div className="rounded-3xl bg-slate-950/60 p-4 border border-white/5">
                <p className="text-sm text-slate-400">Ticket assigned</p>
                <p className="text-sm font-semibold text-white">#TS-312 created for Basis error</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-white/5 bg-slate-900/40 backdrop-blur-md shadow-xl hover:border-white/10 transition-all duration-300">
          <CardHeader className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Quick Actions</p>
              <h2 className="mt-3 text-xl font-semibold text-white">Get started</h2>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-emerald-500/10 text-emerald-300 border border-emerald-500/15">
              <ClipboardList className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent className="space-y-3 pt-4">
            <div className="space-y-3 text-sm text-slate-300">
              <p className="rounded-3xl bg-slate-950/60 p-4 border border-white/5">• Start a new AI support query</p>
              <p className="rounded-3xl bg-slate-950/60 p-4 border border-white/5">• Upload an SAP error screenshot</p>
              <p className="rounded-3xl bg-slate-950/60 p-4 border border-white/5">• Review knowledge base articles</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Metrics Row */}
      <div className="grid gap-4 md:gap-5 grid-cols-2 lg:grid-cols-4">
        {/* Active Tickets */}
        <Card className="border-white/5 bg-slate-900/40 backdrop-blur-md shadow-lg text-white hover:border-white/10 transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Active Escalations</CardTitle>
            <div className="p-2 rounded-lg bg-orange-500/10 text-orange-400 border border-orange-500/15">
              <Ticket className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            {loading ? (
              <Skeleton className="h-9 w-20 bg-slate-800" />
            ) : (
              <div className="text-3xl font-black">{stats.active_tickets}</div>
            )}
            <p className="text-xs text-slate-500 flex items-center gap-1 mt-2">
              <span className="text-green-500 font-semibold flex items-center">
                -12% <ArrowUpRight className="h-3 w-3 rotate-90" />
              </span>
              since last week
            </p>
          </CardContent>
        </Card>

        {/* Resolved by AI */}
        <Card className="border-white/5 bg-slate-900/40 backdrop-blur-md shadow-lg text-white hover:border-white/10 transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Deflected by AI</CardTitle>
            <div className="p-2 rounded-lg bg-green-500/10 text-green-400 border border-green-500/15">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            {loading ? (
              <Skeleton className="h-9 w-20 bg-slate-800" />
            ) : (
              <div className="text-3xl font-black">{stats.resolved_tickets}</div>
            )}
            <p className="text-xs text-slate-500 flex items-center gap-1 mt-2">
              <span className="text-green-500 font-semibold flex items-center">
                +18% <ArrowUpRight className="h-3 w-3" />
              </span>
              since last week
            </p>
          </CardContent>
        </Card>

        {/* Avg Response Time */}
        <Card className="border-white/5 bg-slate-900/40 backdrop-blur-md shadow-lg text-white hover:border-white/10 transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Avg. Response Time</CardTitle>
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/15">
              <Clock className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="text-3xl font-black">0.8s</div>
            <p className="text-xs text-slate-500 flex items-center gap-1 mt-2">
              <span className="text-green-500 font-semibold flex items-center">
                -30% <ArrowUpRight className="h-3 w-3 rotate-90" />
              </span>
              since last week
            </p>
          </CardContent>
        </Card>

        {/* AI Confidence Threshold */}
        <Card className="border-white/5 bg-slate-900/40 backdrop-blur-md shadow-lg text-white hover:border-white/10 transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Confidence Threshold</CardTitle>
            <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/15">
              <Percent className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            {loading ? (
              <Skeleton className="h-9 w-20 bg-slate-800" />
            ) : (
              <div className="text-3xl font-black">{stats.confidence_threshold}</div>
            )}
            <p className="text-xs text-slate-500 flex items-center gap-1 mt-2">
              <span className="text-indigo-400 font-semibold">Active setting</span>
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Sections Grid */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-7">
        {/* Dynamic Left Panel */}
        <div className="col-span-1 md:col-span-2 lg:col-span-4 space-y-6">
          {userRole === "admin" ? (
            <Card className="border-white/5 bg-slate-900/30 backdrop-blur-md text-white shadow-xl">
              <CardHeader>
                <CardTitle className="text-lg font-bold">System Performance Trends</CardTitle>
                <CardDescription className="text-slate-400">Daily creation volume vs resolved cases.</CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
                <div className="h-[280px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartBarChart data={ticketData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                      <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} />
                      <YAxis stroke="#64748b" fontSize={12} tickLine={false} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: "#0b0f19", border: "1px solid rgba(255,255,255,0.1)", color: "#fff" }}
                      />
                      <Bar dataKey="tickets" fill="#6366f1" name="Tickets Raised" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="resolved" fill="#a855f7" name="AI Resolved" radius={[4, 4, 0, 0]} />
                    </RechartBarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          ) : (
            // Employee Interactive Quick Actions
            <div className="grid gap-4 sm:grid-cols-2">
              <Link to="/chat" className="group">
                <Card className="h-full border-white/5 bg-gradient-to-tr from-indigo-950/40 to-slate-900/60 hover:border-indigo-500/40 hover:bg-slate-900/80 transition-all duration-300 hover:shadow-indigo-500/5 hover:-translate-y-1 p-6 text-white cursor-pointer relative overflow-hidden rounded-2xl">
                  <div className="absolute top-0 right-0 h-24 w-24 rounded-full bg-indigo-500/5 blur-[30px]" />
                  <div className="mb-4 inline-block p-3 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 group-hover:scale-110 transition-transform">
                    <MessageSquare className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-bold flex items-center gap-1 group-hover:text-indigo-300">
                    Ask SAP Copilot <ChevronRight className="h-4 w-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                  </h3>
                  <p className="text-sm text-slate-400 mt-2">Get instant resolutions to FI, MM, SD module errors and questions.</p>
                </Card>
              </Link>

              <Link to="/ocr" className="group">
                <Card className="h-full border-white/5 bg-gradient-to-tr from-purple-950/40 to-slate-900/60 hover:border-purple-500/40 hover:bg-slate-900/80 transition-all duration-300 hover:shadow-purple-500/5 hover:-translate-y-1 p-6 text-white cursor-pointer relative overflow-hidden rounded-2xl">
                  <div className="absolute top-0 right-0 h-24 w-24 rounded-full bg-purple-500/5 blur-[30px]" />
                  <div className="mb-4 inline-block p-3 rounded-2xl bg-purple-500/10 text-purple-400 border border-purple-500/20 group-hover:scale-110 transition-transform">
                    <FileText className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-bold flex items-center gap-1 group-hover:text-purple-300">
                    OCR Error Upload <ChevronRight className="h-4 w-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                  </h3>
                  <p className="text-sm text-slate-400 mt-2">Upload screenshot or PDF files to automatically decode module and error details.</p>
                </Card>
              </Link>

              <Link to="/kb" className="group sm:col-span-2">
                <Card className="border-white/5 bg-slate-900/40 hover:bg-slate-900/60 hover:border-white/10 transition-all duration-300 p-5 text-white flex items-center justify-between cursor-pointer rounded-2xl">
                  <div className="flex items-center gap-4">
                    <div className="p-2.5 rounded-xl bg-slate-800 text-slate-400">
                      <BookOpen className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-bold">Browse SAP Knowledge Directory</h4>
                      <p className="text-xs text-slate-400 mt-0.5">Access user manuals, config guidelines, and support SOP documents.</p>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-slate-500" />
                </Card>
              </Link>
            </div>
          )}
        </div>

        {/* Right Panel: Live Activity Monitor */}
        <Card className="col-span-1 md:col-span-2 lg:col-span-3 border-white/5 bg-slate-900/30 backdrop-blur-md text-white shadow-xl rounded-3xl">
          <CardHeader>
            <CardTitle className="text-lg font-bold">System Activity Feed</CardTitle>
            <CardDescription className="text-slate-400">Real-time status updates and event log.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-5">
              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex items-center gap-4">
                      <Skeleton className="h-8 w-8 rounded-xl bg-slate-800" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-3 w-20 bg-slate-800" />
                        <Skeleton className="h-3 w-40 bg-slate-800" />
                      </div>
                      <Skeleton className="h-3 w-12 bg-slate-800" />
                    </div>
                  ))}
                </div>
              ) : stats.recent_activities.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-8">No recent activities found.</p>
              ) : (
                stats.recent_activities.map((act) => (
                  <div key={act.id} className="flex items-start gap-4 text-sm group">
                    <div className="mt-0.5 rounded-xl p-2 bg-slate-950/80 border border-white/5 group-hover:bg-slate-900 transition-colors">
                      {act.type === "ocr" && <FileText className="h-4 w-4 text-blue-400" />}
                      {act.type === "ai" && <Sparkles className="h-4 w-4 text-indigo-400" />}
                      {act.type === "ticket" && <AlertCircle className="h-4 w-4 text-orange-400 animate-pulse" />}
                      {act.type === "system" && <Clock className="h-4 w-4 text-purple-400" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-slate-200 text-xs truncate">{act.user}</p>
                      <p className="text-slate-400 text-xs mt-0.5 leading-snug">{act.action}</p>
                    </div>
                    <div className="text-[10px] text-slate-500 whitespace-nowrap mt-1">{act.time.split(" ")[1] || act.time}</div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
