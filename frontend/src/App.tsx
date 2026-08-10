import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from "react-router-dom"
import { ThemeProvider } from "@/components/theme-provider"
import DashboardLayout from "@/layouts/DashboardLayout"
import AdminLayout from "@/layouts/AdminLayout"
import ExpertLayout from "@/layouts/ExpertLayout"
import Home from "@/pages/shared/Home"
import Dashboard from "@/pages/shared/Dashboard"
import AIChat from "@/pages/employee/AIChat"
import OCRUpload from "@/pages/employee/OCRUpload"
import KnowledgeBase from "@/pages/shared/KnowledgeBase"
import TicketManagement from "@/pages/shared/TicketManagement"
import Analytics from "@/pages/admin/Analytics"
import Reports from "@/pages/admin/Reports"
import AdminPanel from "@/pages/admin/AdminPanel"
import Notifications from "@/pages/admin/Notifications"
import EmployeeNotifications from "@/pages/employee/EmployeeNotifications"
import ExpertDashboard from "@/pages/expert/ExpertDashboard"
import ExpertTickets from "@/pages/expert/ExpertTickets"
import ExpertNotifications from "@/pages/expert/ExpertNotifications"
import Login from "@/pages/shared/Login"
import AdminLogin from "@/pages/admin/AdminLogin"
import Register from "@/pages/shared/Register"

// Protected Route for Employees only
function EmployeeProtectedRoute() {
  const token = localStorage.getItem("authToken")
  const role = localStorage.getItem("userRole") || "employee"

  if (!token) {
    return <Navigate to="/login" replace />
  }

  if (role !== "employee") {
    // If admin attempts to visit employee pages, redirect to admin; if expert, to expert dashboard
    if (role === "admin") return <Navigate to="/admin" replace />
    if (role === "expert") return <Navigate to="/expert/dashboard" replace />
  }

  return <Outlet />
}

// Protected Route for Experts only
function ExpertProtectedRoute() {
  const token = localStorage.getItem("authToken")
  const role = localStorage.getItem("userRole")

  if (!token) {
    return <Navigate to="/login" replace />
  }

  if (role !== "expert") {
    if (role === "admin") return <Navigate to="/admin" replace />
    return <Navigate to="/dashboard" replace />
  }

  return <Outlet />
}

// Protected Route for Admins only
function AdminProtectedRoute() {
  const token = localStorage.getItem("authToken")
  const role = localStorage.getItem("userRole")

  if (!token || role !== "admin") {
    return <Navigate to="/admin/login" replace />
  }

  return <Outlet />
}

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <Router>
        <Routes>
          {/* Auth Pages */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          
          {/* Public Landing Page */}
          <Route path="/" element={<Home />} />

          {/* Employee Workspace */}
          <Route element={<EmployeeProtectedRoute />}>
            <Route element={<DashboardLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/notifications" element={<EmployeeNotifications />} />
              <Route path="/chat" element={<AIChat />} />
              <Route path="/ocr" element={<OCRUpload />} />
              <Route path="/tickets" element={<TicketManagement />} />
              <Route path="/kb" element={<KnowledgeBase />} />
            </Route>
          </Route>

          {/* Expert Workspace */}
          <Route element={<ExpertProtectedRoute />}>
            <Route element={<ExpertLayout />}>
              <Route path="/expert/dashboard" element={<ExpertDashboard />} />
              <Route path="/expert/notifications" element={<ExpertNotifications />} />
              <Route path="/expert/tickets" element={<ExpertTickets />} />
              <Route path="/expert/kb" element={<KnowledgeBase />} />
            </Route>
          </Route>

          {/* Admin Workspace */}
          <Route element={<AdminProtectedRoute />}>
            <Route element={<AdminLayout />}>
              <Route path="/admin" element={<Dashboard />} />
              <Route path="/admin/notifications" element={<Notifications />} />
              <Route path="/admin/tickets" element={<TicketManagement />} />
              <Route path="/admin/kb" element={<KnowledgeBase />} />
              <Route path="/admin/analytics" element={<Analytics />} />
              <Route path="/admin/reports" element={<Reports />} />
              <Route path="/admin/config" element={<AdminPanel />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </ThemeProvider>
  )
}

export default App

