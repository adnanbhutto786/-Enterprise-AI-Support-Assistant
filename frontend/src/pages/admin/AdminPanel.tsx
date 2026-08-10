import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Users, Server, Sliders, Check, Ban, Trash2 } from "lucide-react"
import api from "@/lib/api"
import { Skeleton } from "@/components/ui/skeleton"

type UserItem = {
  id: number
  email: string
  role: string
  status: "Active" | "Suspended"
  name?: string
  phone?: string
}

type HealthStatus = {
  fastapi: string
  database: string
  chromadb: string
  openai: string
  latency_ms: number
}

export default function AdminPanel() {
  const [users, setUsers] = useState<UserItem[]>([])
  const [confidenceThreshold, setConfidenceThreshold] = useState(1.1)
  const [loading, setLoading] = useState(true)
  const [health, setHealth] = useState<HealthStatus | null>(null)

  useEffect(() => {
    // Load users
    api.get("/api/users")
      .then(res => {
        setUsers(res.data)
      })
      .catch(err => console.error("Error loading users:", err))

    // Load settings
    api.get("/api/settings")
      .then(res => {
        if (res.data.confidence_threshold) {
          setConfidenceThreshold(parseFloat(res.data.confidence_threshold))
        }
        setLoading(false)
      })
      .catch(err => {
        console.error("Error loading settings:", err)
        setLoading(false)
      })

    // Load real health status
    api.get("/api/health")
      .then(res => setHealth(res.data))
      .catch(() => setHealth(null))
  }, [])

  const toggleStatus = (id: number) => {
    const userToToggle = users.find(u => u.id === id)
    if (!userToToggle) return

    const newStatus = userToToggle.status === "Active" ? "Suspended" : "Active"

    api.post(`/api/users/${id}/status`, { status: newStatus })
      .then(() => {
        setUsers(users.map(u => 
          u.id === id ? { ...u, status: newStatus } : u
        ))
      })
      .catch(err => console.error("Failed to toggle status:", err))
  }

  const handleDeleteUser = (id: number, email: string) => {
    if (email === "admin@company.com") {
      window.alert("Cannot delete main system admin account.")
      return
    }
    if (!window.confirm(`Are you sure you want to permanently delete user account ${email}?`)) {
      return
    }

    api.post(`/api/users/${id}/delete`)
      .then(() => {
        setUsers(users.filter(u => u.id !== id))
      })
      .catch(err => console.error("Failed to delete user account:", err))
  }

  const handleSaveThreshold = (val: number) => {
    setConfidenceThreshold(val)
    api.post("/api/settings", { confidence_threshold: val })
      .then(() => console.log("Settings updated successfully"))
      .catch(err => console.error("Failed to update threshold settings:", err))
  }

  return (
    <div className="space-y-6 text-white relative z-10">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">Admin Control Panel</h1>
        <p className="text-slate-400 mt-2 text-sm">
          Manage system configurations, user permissions, and monitor server status.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Users Management */}
        <Card className="md:col-span-2 border-white/5 bg-slate-900/40 backdrop-blur-md text-white shadow-xl">
          <CardHeader className="flex flex-row items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/15">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <CardTitle>User Accounts</CardTitle>
              <CardDescription className="text-slate-400">Manage user roles and authorization status.</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <Table className="text-white">
              <TableHeader>
                <TableRow className="border-white/5">
                  <TableHead className="text-slate-400">Name</TableHead>
                  <TableHead className="text-slate-400">Email</TableHead>
                  <TableHead className="text-slate-400">Phone</TableHead>
                  <TableHead className="text-slate-400">Role</TableHead>
                  <TableHead className="text-slate-400">Status</TableHead>
                  <TableHead className="text-right text-slate-400">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 4 }).map((_, index) => (
                    <TableRow key={index} className="border-white/5">
                      <TableCell><Skeleton className="h-4 w-24 bg-slate-800" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-32 bg-slate-800" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-28 bg-slate-800" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-16 bg-slate-800" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-16 bg-slate-800" /></TableCell>
                      <TableCell className="text-right flex items-center justify-end gap-1"><Skeleton className="h-8 w-20 rounded-xl bg-slate-800" /></TableCell>
                    </TableRow>
                  ))
                ) : users.length === 0 ? (
                  <TableRow><TableCell colSpan={6} className="text-center py-6 text-slate-500">No users found.</TableCell></TableRow>
                ) : (
                  users.map((user) => (
                    <TableRow key={user.id} className="border-white/5">
                      <TableCell className="font-semibold text-slate-200">{user.name || "—"}</TableCell>
                      <TableCell className="font-mono text-xs text-slate-300">{user.email}</TableCell>
                      <TableCell className="text-xs text-slate-300">{user.phone || "—"}</TableCell>
                      <TableCell className="capitalize text-slate-300">{user.role}</TableCell>
                      <TableCell>
                        <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded font-bold ${
                          user.status === "Active" ? "bg-green-500/15 text-green-400 border border-green-500/20" : "bg-red-500/15 text-red-400 border border-red-500/20"
                        }`}>
                          {user.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-right flex items-center justify-end gap-1">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => toggleStatus(user.id)}
                          className="text-xs hover:bg-white/5 h-8 px-2"
                        >
                          {user.status === "Active" ? (
                            <span className="flex items-center gap-1 text-red-400"><Ban className="h-3.5 w-3.5" /> Suspend</span>
                          ) : (
                            <span className="flex items-center gap-1 text-green-400"><Check className="h-3.5 w-3.5" /> Activate</span>
                          )}
                        </Button>
                        {user.email !== "admin@company.com" && (
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleDeleteUser(user.id, user.email)}
                            className="text-xs text-rose-500 hover:text-rose-400 hover:bg-rose-500/10 h-8 w-8 p-0"
                            title="Delete User permanently"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Server & AI Configs */}
        <div className="space-y-6">
          <Card className="border-white/5 bg-slate-900/40 backdrop-blur-md text-white shadow-xl">
            <CardHeader className="flex flex-row items-center gap-3">
              <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/15">
                <Sliders className="h-5 w-5" />
              </div>
              <div>
                <CardTitle>AI Settings</CardTitle>
                <CardDescription className="text-slate-400">Configure RAG pipeline properties.</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-slate-300">Confidence Score Threshold</span>
                  <span className="text-indigo-400 font-bold">{confidenceThreshold}</span>
                </div>
                <input 
                  type="range" 
                  min="0.5" 
                  max="1.5" 
                  step="0.05"
                  value={confidenceThreshold}
                  onChange={(e) => handleSaveThreshold(parseFloat(e.target.value))}
                  className="w-full h-1 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
                <p className="text-[11px] text-slate-500 leading-normal">
                  Lower values make the AI more conservative, triggering human support tickets more frequently.
                </p>
              </div>

              <div className="space-y-2 pt-2 border-t border-white/5">
                <label className="text-sm font-medium text-slate-300">Chunk Size (Words)</label>
                <Input type="number" defaultValue={1000} className="bg-slate-950/40 border-white/10 text-white" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Chunk Overlap</label>
                <Input type="number" defaultValue={200} className="bg-slate-950/40 border-white/10 text-white" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-white/5 bg-slate-900/40 backdrop-blur-md text-white shadow-xl">
            <CardHeader className="flex flex-row items-center gap-3">
              <div className="p-2.5 rounded-xl bg-green-500/10 text-green-400 border border-green-500/15">
                <Server className="h-5 w-5" />
              </div>
              <div>
                <CardTitle>System Status</CardTitle>
                <CardDescription className="text-slate-400">Real-time backend service diagnostics.</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-3.5 text-sm">
              {[
                { label: "FastAPI Engine", value: health?.fastapi ?? "checking..." },
                { label: "SQLite Database", value: health?.database ?? "checking..." },
                { label: "ChromaDB Vector Store", value: health?.chromadb ?? "checking..." },
                { label: "OpenAI Integration", value: health?.openai ?? "checking..." },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between items-center">
                  <span className="text-slate-400">{label}</span>
                  <span className={`font-bold text-xs px-2 py-0.5 rounded border ${
                    value === "online" || value === "connected"
                      ? "bg-green-500/15 text-green-400 border-green-500/20"
                      : value === "mock_mode"
                        ? "bg-yellow-500/15 text-yellow-400 border-yellow-500/20"
                        : value === "error"
                          ? "bg-red-500/15 text-red-400 border-red-500/20"
                          : "bg-slate-500/15 text-slate-400 border-slate-500/20"
                  }`}>
                    {value.toUpperCase()}
                  </span>
                </div>
              ))}
              {health && (
                <div className="flex justify-between items-center pt-2 border-t border-white/5">
                  <span className="text-slate-400">API Latency</span>
                  <span className="font-semibold text-slate-300">{health.latency_ms}ms</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
