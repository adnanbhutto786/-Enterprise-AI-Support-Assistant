import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { 
  Bell, 
  CheckCheck, 
  Trash2, 
  AlertTriangle, 
  Ticket, 
  UserCheck, 
  ShieldAlert, 
  Info, 
  ArrowUpRight, 
  RefreshCw, 
  Search, 
  CheckCircle2, 
  Sparkles, 
  Clock, 
  MessageSquare 
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import api from "@/lib/api"
import { Skeleton } from "@/components/ui/skeleton"

type NotificationItem = {
  id: number
  title: string
  message: string
  type: string
  link: string
  is_read: number
  created_at: string
}

export default function EmployeeNotifications() {
  const navigate = useNavigate()
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [unreadCount, setUnreadCount] = useState<number>(0)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [filterType, setFilterType] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<"all" | "unread" | "read">("all")
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [actionSuccess, setActionSuccess] = useState<string | null>(null)

  const fetchNotifications = async () => {
    try {
      setIsLoading(true)
      const res = await api.get("/api/notifications")
      setNotifications(res.data.notifications || [])
      setUnreadCount(res.data.unread_count || 0)
    } catch (err) {
      console.error("Failed to fetch notifications:", err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchNotifications()
    // Poll every 15s for real-time updates
    const interval = setInterval(fetchNotifications, 15000)
    return () => clearInterval(interval)
  }, [])

  const markAsRead = async (id: number) => {
    try {
      await api.post(`/api/notifications/${id}/read`)
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: 1 } : n))
      )
      setUnreadCount((prev) => Math.max(0, prev - 1))
    } catch (err) {
      console.error("Failed to mark as read:", err)
    }
  }

  const markAllAsRead = async () => {
    try {
      await api.post("/api/notifications/read-all")
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: 1 })))
      setUnreadCount(0)
      showFeedback("All notifications marked as read")
    } catch (err) {
      console.error("Failed to mark all as read:", err)
    }
  }

  const deleteNotification = async (id: number) => {
    try {
      await api.delete(`/api/notifications/${id}`)
      setNotifications((prev) => prev.filter((n) => n.id !== id))
      showFeedback("Notification removed")
    } catch (err) {
      console.error("Failed to delete notification:", err)
    }
  }

  const clearAll = async () => {
    if (!window.confirm("Are you sure you want to clear your notifications?")) return
    try {
      await api.delete("/api/notifications/clear-all")
      setNotifications([])
      setUnreadCount(0)
      showFeedback("All notifications cleared")
    } catch (err) {
      console.error("Failed to clear all notifications:", err)
    }
  }

  const showFeedback = (msg: string) => {
    setActionSuccess(msg)
    setTimeout(() => setActionSuccess(null), 3000)
  }

  const getIcon = (type: string) => {
    switch (type) {
      case "ticket":
        return <UserCheck className="h-5 w-5 text-indigo-400" />
      case "escalation":
        return <AlertTriangle className="h-5 w-5 text-amber-400" />
      case "security":
        return <ShieldAlert className="h-5 w-5 text-red-400" />
      default:
        return <Info className="h-5 w-5 text-cyan-400" />
    }
  }

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "ticket":
        return "bg-indigo-500/15 text-indigo-300 border-indigo-500/25"
      case "escalation":
        return "bg-amber-500/15 text-amber-300 border-amber-500/25"
      case "security":
        return "bg-red-500/15 text-red-300 border-red-500/25"
      default:
        return "bg-cyan-500/15 text-cyan-300 border-cyan-500/25"
    }
  }

  // Filtered notifications
  const filteredNotifications = notifications.filter((n) => {
    const matchesType = filterType === "all" || n.type === filterType
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "unread" && n.is_read === 0) ||
      (statusFilter === "read" && n.is_read === 1)
    const matchesSearch =
      searchQuery === "" ||
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.message.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesType && matchesStatus && matchesSearch
  })

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10 relative z-10 text-white">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-indigo-500/20 bg-gradient-to-r from-slate-900/90 via-indigo-950/50 to-slate-900/90 p-6 md:p-8 backdrop-blur-xl shadow-2xl">
        <div className="absolute top-0 right-0 h-48 w-48 rounded-full bg-indigo-500/10 blur-[80px] pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-400 border border-indigo-500/20 mb-3">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Employee Notifications</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white via-indigo-200 to-indigo-100 bg-clip-text text-transparent">
              Activity & Ticket Updates
            </h1>
            <p className="mt-2 text-slate-400 text-sm max-w-xl leading-relaxed">
              Get notified instantly when administrators assign functional SAP experts to your tickets, when experts post collaboration notes, or when status updates occur.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchNotifications}
              className="border-white/10 bg-white/5 hover:bg-white/10 text-slate-200 text-xs rounded-xl"
            >
              <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${isLoading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            {unreadCount > 0 && (
              <Button
                size="sm"
                onClick={markAllAsRead}
                className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs rounded-xl shadow-md shadow-indigo-600/30"
              >
                <CheckCheck className="h-3.5 w-3.5 mr-1.5" />
                Mark all read ({unreadCount})
              </Button>
            )}
            {notifications.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAll}
                className="hover:bg-red-500/10 text-slate-400 hover:text-red-400 text-xs rounded-xl"
              >
                <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                Clear all
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Success Toast */}
      {actionSuccess && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 text-xs shadow-lg animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="glass-panel border-white/5 bg-slate-900/40 rounded-2xl p-4 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total</span>
            <Bell className="h-4 w-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-black text-white mt-2">{notifications.length}</div>
          <p className="text-[10px] text-slate-500 mt-0.5">All received updates</p>
        </Card>

        <Card className="glass-panel border-white/5 bg-slate-900/40 rounded-2xl p-4 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Unread</span>
            <div className="h-2 w-2 rounded-full bg-indigo-500 animate-ping" />
          </div>
          <div className="text-2xl font-black text-indigo-400 mt-2">{unreadCount}</div>
          <p className="text-[10px] text-slate-500 mt-0.5">Pending your review</p>
        </Card>

        <Card className="glass-panel border-white/5 bg-slate-900/40 rounded-2xl p-4 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Expert Assignments</span>
            <UserCheck className="h-4 w-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-black text-indigo-300 mt-2">
            {notifications.filter((n) => n.title.toLowerCase().includes("expert") || n.type === "ticket").length}
          </div>
          <p className="text-[10px] text-slate-500 mt-0.5">Assigned SAP experts</p>
        </Card>

        <Card className="glass-panel border-white/5 bg-slate-900/40 rounded-2xl p-4 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">System Alerts</span>
            <Info className="h-4 w-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-black text-cyan-400 mt-2">
            {notifications.filter((n) => n.type !== "ticket").length}
          </div>
          <p className="text-[10px] text-slate-500 mt-0.5">System notices</p>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <Card className="glass-panel border-white/5 bg-slate-900/40 rounded-2xl p-4 shadow-xl">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          {/* Search Input */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search notifications..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 bg-slate-950/60 border-white/10 text-white rounded-xl placeholder:text-slate-500 text-xs focus-visible:ring-1 focus-visible:ring-indigo-500"
            />
          </div>

          {/* Type & Status Filter Buttons */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {/* Status Pills */}
            <div className="flex rounded-xl bg-slate-950/70 p-1 border border-white/10">
              {(["all", "unread", "read"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`px-3 py-1 text-xs font-semibold rounded-lg capitalize transition-all ${
                    statusFilter === s
                      ? "bg-indigo-600 text-white shadow"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>

            {/* Type Dropdown / Pills */}
            <div className="flex rounded-xl bg-slate-950/70 p-1 border border-white/10">
              {[
                { label: "All Types", val: "all" },
                { label: "Tickets & Experts", val: "ticket" },
                { label: "System", val: "system" },
              ].map((t) => (
                <button
                  key={t.val}
                  onClick={() => setFilterType(t.val)}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                    filterType === t.val
                      ? "bg-white/15 text-white"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Notifications List */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-20 w-full bg-white/5 rounded-2xl" />
            ))}
          </div>
        ) : filteredNotifications.length === 0 ? (
          <Card className="glass-panel border-white/5 bg-slate-900/40 rounded-3xl p-12 text-center">
            <div className="h-16 w-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="h-8 w-8 opacity-60" />
            </div>
            <h3 className="text-base font-bold text-white">No Notifications</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              When an expert is assigned to your ticket or sends a collaboration message, it will show up here.
            </p>
          </Card>
        ) : (
          filteredNotifications.map((notif) => (
            <div
              key={notif.id}
              className={`group relative flex items-start justify-between gap-4 p-4 rounded-2xl border transition-all duration-300 ${
                notif.is_read === 0
                  ? "bg-indigo-950/25 border-indigo-500/30 hover:border-indigo-500/50 shadow-md shadow-indigo-950/50"
                  : "bg-slate-900/30 border-white/5 hover:border-white/10 opacity-80 hover:opacity-100"
              }`}
            >
              {/* Left Indicator & Icon */}
              <div className="flex items-start gap-3.5 flex-1 min-w-0">
                <div className="p-2.5 rounded-xl bg-slate-950/80 border border-white/10 flex-shrink-0 mt-0.5 shadow-sm">
                  {getIcon(notif.type)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider ${getTypeBadge(notif.type)}`}>
                      {notif.type}
                    </span>
                    <h4 className="text-sm font-semibold text-white tracking-tight truncate">
                      {notif.title}
                    </h4>
                    {notif.is_read === 0 && (
                      <span className="h-2 w-2 rounded-full bg-indigo-500 flex-shrink-0" />
                    )}
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed font-normal">
                    {notif.message}
                  </p>

                  <div className="flex items-center gap-3 mt-2 text-[11px] text-slate-500">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {notif.created_at}
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Action Buttons */}
              <div className="flex items-center gap-2 flex-shrink-0 self-center">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    markAsRead(notif.id)
                    navigate(notif.link || "/tickets")
                  }}
                  className="h-8 px-3 rounded-xl bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-300 text-xs font-semibold border border-indigo-500/20 flex items-center gap-1 transition-all"
                >
                  <span>View Ticket</span>
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </Button>

                {notif.is_read === 0 && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => markAsRead(notif.id)}
                    className="h-8 w-8 p-0 rounded-xl hover:bg-white/10 text-slate-400 hover:text-emerald-400 transition-colors"
                    title="Mark as read"
                  >
                    <CheckCheck className="h-4 w-4" />
                  </Button>
                )}

                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => deleteNotification(notif.id)}
                  className="h-8 w-8 p-0 rounded-xl hover:bg-red-500/10 text-slate-500 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                  title="Remove notification"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
