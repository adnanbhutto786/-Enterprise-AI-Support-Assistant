import { useEffect, useState } from "react"
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom"
import { ModeToggle } from "@/components/mode-toggle"
import { 
  LayoutDashboard, 
  BookOpen, 
  Ticket, 
  LogOut,
  Sparkles,
  Menu,
  Bell,
  CheckCheck,
  AlertTriangle,
  UserPlus,
  ShieldAlert,
  Info,
  ArrowRight
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

export default function ExpertLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const [expertEmail, setExpertEmail] = useState<string>("")
  const [notifications, setNotifications] = useState<QuickNotification[]>([])
  const [unreadCount, setUnreadCount] = useState<number>(0)

  const fetchQuickNotifications = async () => {
    try {
      const res = await api.get("/api/notifications")
      setNotifications(res.data.notifications || [])
      setUnreadCount(res.data.unread_count || 0)
    } catch (err) {
      console.error("Failed to load expert header notifications:", err)
    }
  }

  useEffect(() => {
    const token = localStorage.getItem("authToken")
    const role = localStorage.getItem("userRole") || "expert"
    const email = localStorage.getItem("userEmail") || "expert@company.com"
    if (!token || role !== "expert" || isTokenExpired()) {
      localStorage.clear()
      navigate("/login")
    } else {
      setExpertEmail(email)
      fetchQuickNotifications()
      const timer = setInterval(fetchQuickNotifications, 15000)
      return () => clearInterval(timer)
    }
  }, [navigate, location.pathname])

  const handleLogout = () => {
    localStorage.clear()
    navigate("/login")
  }

  const markQuickRead = async (id: number, link?: string) => {
    try {
      await api.post(`/api/notifications/${id}/read`)
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: 1 } : n)))
      setUnreadCount((prev) => Math.max(0, prev - 1))
      if (link) navigate(link)
      else navigate("/expert/tickets")
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

  const expertNavItems = [
    { name: "Expert Dashboard", href: "/expert/dashboard", icon: LayoutDashboard },
    { name: "Notifications", href: "/expert/notifications", icon: Bell, badge: unreadCount },
    { name: "Assigned Tickets", href: "/expert/tickets", icon: Ticket },
    { name: "Knowledge Base", href: "/expert/kb", icon: BookOpen },
  ]

  const SidebarContent = () => (
    <>
      <div className="flex h-20 items-center px-6 border-b border-indigo-500/10 gap-3">
        <div className="p-2 rounded-lg bg-gradient-to-tr from-indigo-500 to-indigo-700 shadow-md shadow-indigo-500/20">
          <Sparkles className="h-5 w-5 text-white" />
        </div>
        <div>
          <span className="text-md font-bold tracking-tight bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
            Enterprise Support
          </span>
          <p className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold tracking-wider uppercase">
            Expert Workspace
          </p>
        </div>
      </div>
      <div className="py-6">
        <nav className="grid gap-1.5 px-3">
          {expertNavItems.map((item) => {
            const isActive = location.pathname === item.href
            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "flex items-center justify-between rounded-xl px-4 py-3 text-sm font-medium transition-all duration-300 group relative",
                  isActive 
                    ? "bg-indigo-600/15 text-indigo-600 dark:text-indigo-300 border-l-2 border-indigo-500" 
                    : "text-muted-foreground hover:bg-black/5 dark:hover:bg-white/5 hover:text-foreground"
                )}
              >
                <div className="flex items-center gap-3">
                  <item.icon className={cn(
                    "h-4.5 w-4.5 transition-transform duration-300 group-hover:scale-110",
                    isActive ? "text-indigo-600 dark:text-indigo-400" : "text-muted-foreground group-hover:text-foreground"
                  )} />
                  <span>{item.name}</span>
                </div>

                {typeof item.badge === "number" && item.badge > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-600 text-white shadow-sm shadow-indigo-600/50 animate-pulse">
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
    <div className="flex flex-1 min-h-0 w-full bg-background text-foreground font-sans relative overflow-hidden">
      {/* Dynamic Background Gradients */}
      <div className="absolute top-[-10%] left-[-10%] h-[500px] w-[500px] rounded-full bg-indigo-600/10 blur-[120px] pointer-events-none animate-blob mix-blend-screen" />
      <div className="absolute bottom-[-10%] right-[-10%] h-[500px] w-[500px] rounded-full bg-purple-600/10 blur-[120px] pointer-events-none animate-blob animation-delay-2000 mix-blend-screen" />

      {/* Desktop Sidebar */}
      <div className="hidden w-56 lg:w-64 glass-panel md:flex flex-col h-full shrink-0 relative z-10 border-t-0 border-b-0 border-l-0 border-r-white/10 rounded-none shadow-[4px_0_24px_rgba(0,0,0,0.5)] bg-white/80 dark:bg-slate-950/80">
        <SidebarContent />
      </div>

      {/* Main Content */}
      <div className="flex flex-1 flex-col min-w-0 min-h-0 overflow-hidden relative z-10">
        {/* Header */}
        <header className="sticky top-0 z-50 flex h-14 sm:h-16 shrink-0 items-center justify-between border-b border-black/5 dark:border-white/10 bg-white/80 dark:bg-slate-950/90 backdrop-blur-xl px-2.5 sm:px-4 md:px-8">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            {/* Mobile Sidebar Toggle */}
            <div className="md:hidden shrink-0">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-black/5 dark:hover:bg-white/5">
                    <Menu className="h-5 w-5 text-foreground" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-64 p-0 bg-white dark:bg-slate-950 border-r border-indigo-500/20">
                  <SidebarContent />
                </SheetContent>
              </Sheet>
            </div>
            <div className="flex items-center md:hidden gap-2 min-w-0">
              <div className="p-1.5 sm:p-2 rounded-lg bg-indigo-600 shrink-0">
                <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
              </div>
              <div className="min-w-0 truncate">
                <span className="text-xs sm:text-base font-bold tracking-tight text-foreground truncate block max-w-[130px] min-[380px]:max-w-none">Expert Portal</span>
                <p className="text-[8px] text-indigo-500 dark:text-indigo-400 font-bold uppercase tracking-wider">Workspace</p>
              </div>
            </div>
          </div>
          
          <div className="hidden md:flex items-center gap-2">
            <span className="text-sm text-muted-foreground font-medium">Welcome back, Expert</span>
            <span className="text-sm text-indigo-600 dark:text-indigo-300 font-semibold">{expertEmail}</span>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            {/* Notifications Bell Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="relative p-2.5 rounded-xl border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/[0.04] hover:bg-black/10 dark:hover:bg-white/10 text-foreground transition-all focus:outline-none">
                  <Bell className="h-5 w-5 text-indigo-400" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-indigo-600 px-1 text-[10px] font-bold text-white shadow-lg shadow-indigo-600/50 animate-pulse">
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
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
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
                      <Bell className="h-6 w-6 mx-auto mb-2 opacity-30 text-indigo-400" />
                      No notifications yet
                    </div>
                  ) : (
                    notifications.slice(0, 6).map((notif) => (
                      <div
                        key={notif.id}
                        onClick={() => markQuickRead(notif.id, notif.link)}
                        className={`p-3.5 transition-colors cursor-pointer flex items-start gap-3 ${
                          notif.is_read === 0
                            ? "bg-indigo-950/30 hover:bg-indigo-950/40"
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
                              <span className="h-2 w-2 rounded-full bg-indigo-500 flex-shrink-0" />
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
                    to="/expert/notifications"
                    className="text-xs text-indigo-300 hover:text-indigo-200 font-medium flex items-center justify-center gap-1 py-1 transition-colors"
                  >
                    View all notifications
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Profile Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 hover:opacity-80 transition-opacity focus:outline-none">
                  <div className="h-9 w-9 md:h-10 md:w-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-indigo-700 flex items-center justify-center font-bold text-sm shadow-md shadow-indigo-500/10 border border-white/20 text-white">
                    {expertEmail.substring(0, 2).toUpperCase()}
                  </div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 rounded-xl border-black/10 dark:border-white/10 shadow-xl bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl p-2 z-[100]">
                <DropdownMenuLabel className="font-normal mb-1">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none text-foreground">{expertEmail}</p>
                    <p className="text-xs leading-none text-muted-foreground uppercase tracking-wider mt-1">SAP Expert</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-black/5 dark:bg-white/10" />
                <DropdownMenuItem 
                  onClick={() => navigate("/expert/notifications")}
                  className="text-slate-300 hover:text-white focus:bg-white/10 cursor-pointer py-2 px-3 rounded-lg flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <Bell className="h-4 w-4 text-indigo-400" />
                    <span>Notifications</span>
                  </div>
                  {unreadCount > 0 && (
                    <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-indigo-600 text-white font-bold">
                      {unreadCount}
                    </span>
                  )}
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-black/5 dark:bg-white/10" />
                <div className="px-2 py-1.5 flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">Theme</span>
                  <ModeToggle />
                </div>
                <DropdownMenuSeparator className="bg-black/5 dark:bg-white/10" />
                <DropdownMenuItem 
                  onClick={handleLogout}
                  className="text-red-600 dark:text-red-400 focus:bg-red-500/10 focus:text-red-600 dark:focus:text-red-400 cursor-pointer py-2 px-3 rounded-lg"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sign out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 min-h-0 overflow-y-auto p-3 sm:p-4 md:p-6 lg:p-8 bg-slate-50 dark:bg-[#090e24]/40 relative">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
