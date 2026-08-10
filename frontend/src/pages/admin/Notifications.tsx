import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { 
  Bell, 
  CheckCheck, 
  Trash2, 
  AlertTriangle, 
  Ticket, 
  UserPlus, 
  ShieldAlert, 
  Info, 
  ArrowUpRight, 
  RefreshCw, 
  Search,
  Filter,
  CheckCircle2
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import api from "@/lib/api"

type NotificationItem = {
  id: number
  title: string
  message: string
  type: string
  link: string
  is_read: number
  created_at: string
}

export default function Notifications() {
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
    // Poll every 20s for real-time updates
    const interval = setInterval(fetchNotifications, 20000)
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
      fetchNotifications()
      showFeedback("Notification removed")
    } catch (err) {
      console.error("Failed to delete notification:", err)
    }
  }

  const clearAll = async () => {
    if (!window.confirm("Are you sure you want to clear all notifications?")) return
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
      case "escalation":
        return <AlertTriangle className="h-5 w-5 text-amber-400" />
      case "ticket":
        return <Ticket className="h-5 w-5 text-indigo-400" />
      case "user":
        return <UserPlus className="h-5 w-5 text-purple-400" />
      case "security":
        return <ShieldAlert className="h-5 w-5 text-red-400" />
      default:
        return <Info className="h-5 w-5 text-cyan-400" />
    }
  }

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "escalation":
        return "bg-amber-500/15 text-amber-300 border-amber-500/25"
      case "ticket":
        return "bg-indigo-500/15 text-indigo-300 border-indigo-500/25"
      case "user":
        return "bg-purple-500/15 text-purple-300 border-purple-500/25"
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
    <div className="space-y-6 max-w-6xl mx-auto text-white">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-red-500/10 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-red-600/30 to-indigo-600/30 border border-red-500/20 text-red-400 shadow-lg shadow-red-500/10">
              <Bell className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                Notification Center
                {unreadCount > 0 && (
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-red-500 text-white font-semibold shadow-md shadow-red-500/30 animate-pulse">
                    {unreadCount} New
                  </span>
                )}
              </h1>
              <p className="text-sm text-slate-400">
                Live alerts, low confidence AI escalations, ticket assignments & system activity
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchNotifications}
            className="rounded-xl border-white/10 bg-white/[0.03] hover:bg-white/10 text-slate-300 text-xs"
          >
            <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          {unreadCount > 0 && (
            <Button
              size="sm"
              onClick={markAllAsRead}
              className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs shadow-lg shadow-indigo-600/20"
            >
              <CheckCheck className="h-3.5 w-3.5 mr-1.5" />
              Mark All Read
            </Button>
          )}
          {notifications.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={clearAll}
              className="rounded-xl border-red-500/20 bg-red-500/10 hover:bg-red-500/20 text-red-300 text-xs"
            >
              <Trash2 className="h-3.5 w-3.5 mr-1.5" />
              Clear All
            </Button>
          )}
        </div>
      </div>

      {actionSuccess && (
        <div className="flex items-center gap-2 p-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/25 text-emerald-300 text-sm animate-in fade-in duration-200">
          <CheckCircle2 className="h-4 w-4" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-slate-900/40 border-white/5 backdrop-blur-xl">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400">Total Alerts</p>
              <p className="text-2xl font-bold text-white mt-1">{notifications.length}</p>
            </div>
            <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <Bell className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/40 border-white/5 backdrop-blur-xl">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400">Unread</p>
              <p className="text-2xl font-bold text-red-400 mt-1">{unreadCount}</p>
            </div>
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400">
              <AlertTriangle className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/40 border-white/5 backdrop-blur-xl">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400">AI Escalations</p>
              <p className="text-2xl font-bold text-amber-400 mt-1">
                {notifications.filter((n) => n.type === "escalation").length}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <AlertTriangle className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/40 border-white/5 backdrop-blur-xl">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400">Tickets</p>
              <p className="text-2xl font-bold text-emerald-400 mt-1">
                {notifications.filter((n) => n.type === "ticket").length}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <Ticket className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <Card className="bg-slate-900/40 border-white/5 backdrop-blur-xl">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Search */}
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <Input
                placeholder="Search notifications..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-10 rounded-xl bg-slate-950/60 border-white/10 text-white placeholder-slate-500"
              />
            </div>

            {/* Type Filters */}
            <div className="flex items-center gap-1.5 flex-wrap w-full md:w-auto">
              {[
                { id: "all", label: "All Types" },
                { id: "escalation", label: "AI Escalations" },
                { id: "ticket", label: "Tickets" },
                { id: "user", label: "Users" },
                { id: "security", label: "Security" },
                { id: "system", label: "System" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setFilterType(tab.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                    filterType === tab.id
                      ? "bg-red-600/20 text-red-300 border border-red-500/30"
                      : "text-slate-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Read/Unread Filters */}
            <div className="flex items-center bg-slate-950/60 p-1 rounded-xl border border-white/5">
              {(["all", "unread", "read"] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-3 py-1 text-xs rounded-lg capitalize transition-all ${
                    statusFilter === status
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notifications List */}
      <div className="space-y-3">
        {isLoading && notifications.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2 text-indigo-400" />
            <p className="text-sm">Loading notification alerts...</p>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <Card className="bg-slate-900/30 border-white/5 p-12 text-center">
            <div className="p-4 rounded-3xl bg-slate-950/60 border border-white/5 text-slate-500 w-16 h-16 mx-auto flex items-center justify-center mb-3">
              <Bell className="h-8 w-8 opacity-40" />
            </div>
            <p className="text-base font-semibold text-slate-300">No notifications found</p>
            <p className="text-xs text-slate-500 mt-1">
              {searchQuery || filterType !== "all" || statusFilter !== "all"
                ? "Try clearing your search or filters."
                : "You are all caught up! New events will appear here automatically."}
            </p>
          </Card>
        ) : (
          filteredNotifications.map((notif) => (
            <div
              key={notif.id}
              className={`p-4.5 rounded-2xl border transition-all duration-200 backdrop-blur-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
                notif.is_read === 0
                  ? "bg-gradient-to-r from-red-950/20 via-slate-900/60 to-indigo-950/20 border-red-500/20 shadow-lg shadow-red-950/20"
                  : "bg-slate-900/30 border-white/5 hover:border-white/10 opacity-80 hover:opacity-100"
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div className="p-2.5 rounded-xl bg-slate-950/80 border border-white/10 flex-shrink-0 mt-0.5">
                  {getIcon(notif.type)}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold text-white">{notif.title}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider font-semibold border ${getTypeBadge(notif.type)}`}>
                      {notif.type}
                    </span>
                    {notif.is_read === 0 && (
                      <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                    )}
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
                    {notif.message}
                  </p>
                  <p className="text-[11px] text-slate-500">{notif.created_at}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end md:self-center">
                {notif.link && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      markAsRead(notif.id)
                      navigate(notif.link)
                    }}
                    className="rounded-xl border-white/10 bg-white/[0.04] hover:bg-white/10 text-xs text-slate-200 h-8"
                  >
                    <span>View</span>
                    <ArrowUpRight className="h-3.5 w-3.5 ml-1" />
                  </Button>
                )}

                {notif.is_read === 0 ? (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => markAsRead(notif.id)}
                    className="text-xs text-slate-400 hover:text-white h-8"
                    title="Mark as read"
                  >
                    <CheckCheck className="h-4 w-4" />
                  </Button>
                ) : null}

                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => deleteNotification(notif.id)}
                  className="text-xs text-slate-500 hover:text-red-400 h-8"
                  title="Delete notification"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
