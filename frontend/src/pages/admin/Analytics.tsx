import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  Legend
} from "recharts"
import { TrendingUp, Users, CheckCircle, Printer, FileSpreadsheet, Download, FileText } from "lucide-react"

const monthlyPerformance = [
  { name: "Jan", aiResolved: 80, manualResolved: 45 },
  { name: "Feb", aiResolved: 95, manualResolved: 42 },
  { name: "Mar", aiResolved: 110, manualResolved: 55 },
  { name: "Apr", aiResolved: 130, manualResolved: 38 },
  { name: "May", aiResolved: 125, manualResolved: 50 },
  { name: "Jun", aiResolved: 142, manualResolved: 48 },
]

const sapModuleStats = [
  { module: "Basis", count: 48 },
  { module: "FI (Finance)", count: 32 },
  { module: "MM (Materials)", count: 28 },
  { module: "SD (Sales)", count: 25 },
  { module: "HR (Human Resources)", count: 18 },
]

export default function Analytics() {
  const navigate = useNavigate()

  return (
    <div className="space-y-6 text-white relative z-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">Analytics Dashboard</h1>
          <p className="text-slate-400 mt-1 text-sm">
            Historical analysis of AI resolution efficiency and SAP support team performance.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <Button
            onClick={() => navigate("/admin/reports")}
            className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold h-9 shadow-md shadow-indigo-600/25 transition-all"
          >
            <Printer className="h-4 w-4 mr-1.5" />
            <span>Export Executive PDF</span>
          </Button>

          <Button
            onClick={() => navigate("/admin/reports")}
            variant="outline"
            className="rounded-xl border-white/10 bg-white/[0.04] hover:bg-white/10 text-white text-xs font-semibold h-9 transition-all"
          >
            <FileSpreadsheet className="h-4 w-4 mr-1.5 text-emerald-400" />
            <span>Export CSV Data</span>
          </Button>
        </div>
      </div>

      {/* Analytics stats */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="border-white/5 bg-slate-900/40 backdrop-blur-md text-white shadow-xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Monthly Active Users</CardTitle>
            <Users className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent className="pt-2">
            <div className="text-3xl font-black">1,280</div>
            <p className="text-xs text-green-400 mt-2 font-medium">
              +5% active since last month
            </p>
          </CardContent>
        </Card>

        <Card className="border-white/5 bg-slate-900/40 backdrop-blur-md text-white shadow-xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">AI Deflection Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent className="pt-2">
            <div className="text-3xl font-black">74.2%</div>
            <p className="text-xs text-slate-400 mt-2">
              Resolved automatically by RAG system
            </p>
          </CardContent>
        </Card>

        <Card className="border-white/5 bg-slate-900/40 backdrop-blur-md text-white shadow-xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">First Contact Resolution</CardTitle>
            <CheckCircle className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent className="pt-2">
            <div className="text-3xl font-black">88.5%</div>
            <p className="text-xs text-slate-400 mt-2">
              Solved on the very first query session
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 border-white/5 bg-slate-900/30 backdrop-blur-md text-white shadow-xl">
          <CardHeader>
            <CardTitle>Resolution Performance (AI vs Manual)</CardTitle>
            <CardDescription className="text-slate-400">Comparison of cases handled by AI deflection vs escalated to support agents.</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyPerformance}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={12} tickLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: "#0b0f19", border: "1px solid rgba(255,255,255,0.1)", color: "#fff" }} />
                  <Legend />
                  <Line type="monotone" dataKey="aiResolved" stroke="#6366f1" activeDot={{ r: 8 }} name="AI Auto-Resolved" strokeWidth={2.5} />
                  <Line type="monotone" dataKey="manualResolved" stroke="#a855f7" name="Escalated to Agent" strokeWidth={2.5} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3 border-white/5 bg-slate-900/30 backdrop-blur-md text-white shadow-xl">
          <CardHeader>
            <CardTitle>Queries by SAP Module</CardTitle>
            <CardDescription className="text-slate-400">Frequency of issues logged per SAP Module.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-5">
              {sapModuleStats.map((item) => {
                const max = sapModuleStats[0].count
                const percentage = (item.count / max) * 100
                return (
                  <div key={item.module} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-300">{item.module}</span>
                      <span className="text-slate-400">{item.count} queries</span>
                    </div>
                    <div className="h-2 bg-slate-950 rounded-full overflow-hidden border border-white/5">
                      <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full" style={{ width: `${percentage}%` }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
