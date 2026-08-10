import { useEffect, useState } from "react"
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom"
import { ModeToggle } from "@/components/mode-toggle"
import { 
  LayoutDashboard, 
  BarChart, 
  Settings,
  LogOut,
  FileSpreadsheet,
  ShieldAlert,
  Menu,
  Ticket,
  BookOpen,
  Bell,
  CheckCheck,
  AlertTriangle,
  UserPlus,
  ArrowRight,
  Info
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import api, { isTokenExpired } from "@/lib/api"

type QuickNotification = {
  id: number
  title: string
  message: string
  type: string
  link: string
  is_read: number
  created_at: string
}

export default function AdminLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const [adminEmail, setAdminEmail] = useState<string>("admin@company.com")
  const [notifications, setNotifications] = useState<QuickNotification[]>([])
  const [unreadCount, setUnreadCount] = useState<number>(0)

  const fetchQuickNotifications = async () => {
    try {
      const res = await api.get("/api/notifications")
      setNotifications(res.data.notifications || [])
      setUnreadCount(res.data.unread_count || 0)
    } catch (err) {
      console.error("Failed to load header notifications:", err)
    }
  }

  useEffect(() => {
    const token = localStorage.getItem("authToken")
    const role = localStorage.getItem("userRole")
    const email = localStorage.getItem("userEmail") || "admin@company.com"
    
    if (!token || role !== "admin" || isTokenExpired()) {
      // Direct access protection
      localStorage.clear()
      navigate("/admin/login")
    } else {
      setAdminEmail(email)
      fetchQuickNotifications()
      const timer = setInterval(fetchQuickNotifications, 20000)
      return () => clearInterval(timer)
    }
  }, [navigate, location.pathname])

  const handleLogout = () => {
    localStorage.clear()
    navigate("/admin/login")
  }

  const markQuickRead = async (id: number, link?: string) => {
    try {
      await api.post(`/api/notifications/${id}/read`)
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: 1 } : n)))
      setUnreadCount((prev) => Math.max(0, prev - 1))
      if (link) navigate(link)
    } catch (err) {
      console.error("Error marking read:", err)
    }
  }

  const markAllQuickRead = async () => {
    try {
      await api.post("/api/notifications/read-all")
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: 1 })))
      setUnreadCount(0)
    } catch (err) {
      console.error("Error marking all read:", err)
    }
  }

  const getNotifIcon = (type: string) => {
    switch (type) {
      case "escalation":
        return <AlertTriangle className="h-4 w-4 text-amber-400" />
      case "ticket":
        return <Ticket className="h-4 w-4 text-indigo-400" />
      case "user":
        return <UserPlus className="h-4 w-4 text-purple-400" />
      case "security":
        return <ShieldAlert className="h-4 w-4 text-red-400" />
      default:
        return <Info className="h-4 w-4 text-cyan-400" />
    }
  }

  const adminNavItems = [
    { name: "Admin Dashboard", href: "/admin", icon: LayoutDashboard },
    { name: "Notifications", href: "/admin/notifications", icon: Bell, badge: unreadCount },
    { name: "Ticket Management", href: "/admin/tickets", icon: Ticket },
    { name: "Knowledge Base", href: "/admin/kb", icon: BookOpen },
    { name: "Analytics Logs", href: "/admin/analytics", icon: BarChart },
    { name: "Reports & Audits", href: "/admin/reports", icon: FileSpreadsheet },
    { name: "Server Configuration", href: "/admin/config", icon: Settings },
  ]

  const SidebarContent = () => (
    <>
      <div className="flex h-20 items-center px-6 border-b border-red-500/10 gap-3">
        <div className="p-2 rounded-lg bg-gradient-to-tr from-red-600 to-indigo-600 shadow-md shadow-red-500/20">
          <ShieldAlert className="h-5 w-5 text-white" />
        </div>
        <div>
          <span className="text-md font-bold tracking-tight text-white">
            Security Admin
          </span>
          <p className="text-[9px] text-red-400 font-semibold tracking-wider uppercase">
            Control Panel
          </p>
        </div>
      </div>
      <div className="py-6">
        <nav className="grid gap-1.5 px-3">
          {adminNavItems.map((item) => {
            const isActive = location.pathname === item.href
            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "flex items-center justify-between rounded-xl px-4 py-3 text-sm font-medium transition-all duration-300 group relative",
                  isActive 
                    ? "bg-red-600/20 text-red-300 border-l-2 border-red-500" 
                    : "text-slate-400 hover:bg-white/5 hover:text-white"
                )}
              >
                <div className="flex items-center gap-3">
                  <item.icon className={cn(
                    "h-4.5 w-4.5 transition-transform duration-300 group-hover:scale-110",
                    isActive ? "text-red-500 dark:text-red-400" : "text-muted-foreground group-hover:text-foreground"
                  )} />
                  <span>{item.name}</span>
                </div>

                {typeof item.badge === "number" && item.badge > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-500 text-white shadow-sm shadow-red-500/50">
                    {item.badge}
                  </span>
                )}
              </Link>
            )
          })}
        </nav>
      </div>
    </>
  )

  return (
    <div className="dark flex flex-1 min-h-0 w-full bg-[#06091a] text-white font-sans relative overflow-hidden">
      {/* Dark deep indigo/red security background glows */}
      <div className="absolute -top-40 -left-40 h-[600px] w-[600px] rounded-full bg-red-600/10 blur-[160px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-0 -right-40 h-[500px] w-[500px] rounded-full bg-rose-900/10 blur-[140px] pointer-events-none animate-pulse" />
      {/* Subtle grid overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.025]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(239,68,68,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(239,68,68,0.6) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      {/* Desktop Sidebar */}
      <div className="hidden w-56 lg:w-64 md:flex flex-col h-full shrink-0 relative z-10 rounded-none border-r border-red-500/10 bg-white/[0.03] backdrop-blur-xl shadow-[4px_0_30px_rgba(0,0,0,0.5)]">
        <SidebarContent />
      </div>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col min-w-0 min-h-0 overflow-hidden relative z-10">
        {/* Admin Header */}
        <header className="sticky top-0 z-50 flex h-14 sm:h-16 shrink-0 items-center justify-between border-b border-red-500/10 bg-[#06091a]/90 backdrop-blur-xl px-3 sm:px-4 md:px-8">
          <div className="flex items-center gap-3">
            {/* Mobile Sidebar Toggle */}
            <div className="md:hidden">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="hover:bg-black/5 dark:hover:bg-white/5">
                    <Menu className="h-6 w-6 text-foreground" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-64 p-0 bg-[#06091a] border-r border-red-500/15">
                  <SidebarContent />
                </SheetContent>
              </Sheet>
            </div>
            <div className="flex items-center md:hidden gap-3">
              <div className="p-2 rounded-lg bg-red-600">
                <ShieldAlert className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-bold tracking-tight text-white">Shield Admin</span>
            </div>
          </div>
          
          <div className="hidden md:flex items-center gap-2">
            <span className="text-sm text-red-400 font-bold uppercase tracking-wider">Admin Control Center</span>
          </div>

          <div className="flex items-center gap-3">
            {/* Notifications Bell Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="relative p-2.5 rounded-xl border border-white/10 bg-white/[0.04] hover:bg-white/10 text-slate-300 hover:text-white transition-all focus:outline-none">
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white shadow-lg shadow-red-500/50 animate-pulse">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-[calc(100vw-2rem)] max-w-sm sm:w-80 md:w-96 rounded-2xl border-white/10 shadow-2xl bg-[#0d1030]/95 backdrop-blur-xl p-0 z-[100] text-white overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-white/10 bg-slate-950/60">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm">Notifications</span>
                    {unreadCount > 0 && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-500/20 text-red-300 border border-red-500/30">
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllQuickRead}
                      className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-medium transition-colors"
                    >
                      <CheckCheck className="h-3.5 w-3.5" />
                      Mark all read
                    </button>
                  )}
                </div>

                {/* Notifications List */}
                <div className="max-h-80 overflow-y-auto divide-y divide-white/5">
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center text-slate-500 text-xs">
                      <Bell className="h-6 w-6 mx-auto mb-2 opacity-30" />
                      No notifications yet
                    </div>
                  ) : (
                    notifications.slice(0, 6).map((notif) => (
                      <div
                        key={notif.id}
                        onClick={() => markQuickRead(notif.id, notif.link)}
                        className={`p-3.5 transition-colors cursor-pointer flex items-start gap-3 ${
                          notif.is_read === 0
                            ? "bg-red-950/20 hover:bg-red-950/30"
                            : "hover:bg-white/[0.03] opacity-75 hover:opacity-100"
                        }`}
                      >
                        <div className="p-2 rounded-xl bg-slate-950/80 border border-white/10 flex-shrink-0 mt-0.5">
                          {getNotifIcon(notif.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <p className="text-xs font-semibold text-white truncate">{notif.title}</p>
                            {notif.is_read === 0 && (
                              <span className="h-2 w-2 rounded-full bg-red-500 flex-shrink-0" />
                            )}
                          </div>
                          <p className="text-[11px] text-slate-400 line-clamp-2 mt-0.5 leading-relaxed">
                            {notif.message}
                          </p>
                          <p className="text-[10px] text-slate-500 mt-1">{notif.created_at}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Footer */}
                <div className="p-2.5 border-t border-white/10 bg-slate-950/60 text-center">
                  <Link
                    to="/admin/notifications"
                    className="text-xs text-slate-300 hover:text-white font-medium flex items-center justify-center gap-1 py-1 transition-colors"
                  >
                    View all notifications
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Profile Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 hover:opacity-80 transition-opacity focus:outline-none">
                  <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-red-600 to-indigo-600 flex items-center justify-center font-bold text-sm shadow-md shadow-red-500/10 border border-white/10 text-white">
                    AD
                  </div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 rounded-xl border-white/10 shadow-xl bg-[#0d1030]/95 backdrop-blur-xl p-2 z-[100] text-white">
                <DropdownMenuLabel className="font-normal mb-1">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none text-white">{adminEmail}</p>
                    <p className="text-xs leading-none text-slate-400 uppercase tracking-wider mt-1">Administrator</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-white/10" />
                <DropdownMenuItem 
                  onClick={() => navigate("/admin/notifications")}
                  className="text-slate-300 hover:text-white focus:bg-white/10 cursor-pointer py-2 px-3 rounded-lg"
                >
                  <Bell className="mr-2 h-4 w-4 text-indigo-400" />
                  <span>Notifications</span>
                  {unreadCount > 0 && (
                    <span className="ml-auto px-1.5 py-0.5 rounded-full text-[10px] bg-red-500 text-white font-bold">
                      {unreadCount}
                    </span>
                  )}
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-white/10" />
                <div className="px-2 py-1.5 flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-400">Theme</span>
                  <ModeToggle />
                </div>
                <DropdownMenuSeparator className="bg-white/10" />
                <DropdownMenuItem 
                  onClick={handleLogout}
                  className="text-red-400 hover:text-red-300 focus:bg-red-500/10 focus:text-red-300 cursor-pointer py-2 px-3 rounded-lg"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sign out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 min-h-0 overflow-y-auto p-3 sm:p-4 md:p-6 lg:p-8 bg-transparent relative">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
