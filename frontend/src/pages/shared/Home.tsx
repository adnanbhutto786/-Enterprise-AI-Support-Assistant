import { useEffect, useRef, useState } from "react"
import { Link } from "react-router-dom"
import {
  Bot,
  ScanLine,
  Ticket,
  ShieldCheck,
  BarChart3,
  BookOpen,
  ArrowRight,
  Sparkles,
  ChevronRight,
  Zap,
  Lock,
  Globe,
  CheckCircle2,
  Star,
} from "lucide-react"

const features = [
  {
    icon: Bot,
    title: "AI SAP Copilot",
    desc: "Ask any SAP question — FI, MM, SD, Basis. Get instant answers from company documents using RAG pipeline.",
    color: "from-indigo-500 to-violet-600",
    glow: "shadow-indigo-500/20",
    border: "border-indigo-500/20",
    bg: "bg-indigo-500/10",
    text: "text-indigo-400",
  },
  {
    icon: ScanLine,
    title: "OCR Error Scanner",
    desc: "Upload SAP error screenshots or PDFs. GPT-4o Vision automatically extracts error codes and identifies the module.",
    color: "from-purple-500 to-fuchsia-600",
    glow: "shadow-purple-500/20",
    border: "border-purple-500/20",
    bg: "bg-purple-500/10",
    text: "text-purple-400",
  },
  {
    icon: Ticket,
    title: "Smart Ticket Engine",
    desc: "Low-confidence AI answers auto-escalate to expert tickets. Priority routing ensures the right person gets it.",
    color: "from-orange-500 to-amber-600",
    glow: "shadow-orange-500/20",
    border: "border-orange-500/20",
    bg: "bg-orange-500/10",
    text: "text-orange-400",
  },
  {
    icon: BarChart3,
    title: "Admin Analytics",
    desc: "Track deflection rates, module-level performance, and AI confidence trends in a dedicated admin control hub.",
    color: "from-emerald-500 to-teal-600",
    glow: "shadow-emerald-500/20",
    border: "border-emerald-500/20",
    bg: "bg-emerald-500/10",
    text: "text-emerald-400",
  },
  {
    icon: BookOpen,
    title: "Knowledge Base",
    desc: "Centralized directory of SOPs, manuals, guides and FAQs. Search, filter by module and download instantly.",
    color: "from-sky-500 to-cyan-600",
    glow: "shadow-sky-500/20",
    border: "border-sky-500/20",
    bg: "bg-sky-500/10",
    text: "text-sky-400",
  },
  {
    icon: ShieldCheck,
    title: "Role-Based Security",
    desc: "Employees and admins get separate login portals with isolated dashboards. Audit every action automatically.",
    color: "from-rose-500 to-red-600",
    glow: "shadow-rose-500/20",
    border: "border-rose-500/20",
    bg: "bg-rose-500/10",
    text: "text-rose-400",
  },
]

const stats = [
  { value: "0.8s", label: "Avg. AI Response Time" },
  { value: "87%", label: "Ticket Deflection Rate" },
  { value: "4+", label: "SAP Modules Covered" },
  { value: "24/7", label: "AI Availability" },
]

const modules = ["FI — Finance", "MM — Materials", "SD — Sales", "HR — Human Resources", "Basis — Admin"]

// Animated counter hook
function useCounter(target: number, duration = 1800) {
  const [count, setCount] = useState(0)
  const ref = useRef(false)
  useEffect(() => {
    if (ref.current) return
    ref.current = true
    const step = target / (duration / 16)
    let current = 0
    const timer = setInterval(() => {
      current += step
      if (current >= target) { setCount(target); clearInterval(timer) }
      else setCount(Math.floor(current))
    }, 16)
    return () => clearInterval(timer)
  }, [target, duration])
  return count
}

export default function Home() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 100)
    return () => clearTimeout(t)
  }, [])

  return (
    <div className="relative h-screen w-full overflow-y-auto overflow-x-hidden bg-[#06091a] text-white font-sans">
      {/* ─── Background Orbs ─── */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 h-[700px] w-[700px] rounded-full bg-indigo-600/15 blur-[160px] animate-pulse" />
        <div className="absolute top-1/3 -right-40 h-[600px] w-[600px] rounded-full bg-violet-700/10 blur-[140px] animate-pulse animation-delay-2000" />
        <div className="absolute bottom-0 left-1/3 h-[500px] w-[500px] rounded-full bg-purple-600/10 blur-[120px] animate-pulse animation-delay-4000" />
        {/* Grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(99,102,241,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.8) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      {/* ─── Navbar ─── */}
      <nav className="relative z-20 flex items-center justify-between px-6 md:px-16 py-5 border-b border-white/5 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/30">
            <Bot className="h-5 w-5 text-white" />
          </div>
          <div>
            <span className="text-base font-extrabold tracking-tight text-white">
              Enterprise AI
            </span>
            <span className="ml-1.5 hidden sm:inline text-xs font-semibold text-indigo-400 uppercase tracking-widest">
              SAP Assistant
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/login"
            className="hidden sm:inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-semibold text-slate-300 hover:text-white hover:bg-white/5 transition-all duration-200"
          >
            Employee Login
          </Link>
          <Link
            to="/admin/login"
            className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 px-4 py-2 text-sm font-bold text-white transition-all duration-200 shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40"
          >
            <Lock className="h-3.5 w-3.5" />
            Admin Portal
          </Link>
        </div>
      </nav>

      {/* ─── Hero Section ─── */}
      <section className="relative z-10 flex flex-col items-center justify-center px-6 py-24 md:py-36 text-center">
        {/* Badge */}
        <div
          className={`inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-indigo-300 mb-8 transition-all duration-700 ${
            visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          <Sparkles className="h-3 w-3 animate-pulse" />
          Powered by GPT-4o Vision + LangChain RAG
          <Sparkles className="h-3 w-3 animate-pulse" />
        </div>

        {/* Headline */}
        <h1
          className={`max-w-4xl text-5xl md:text-7xl font-black tracking-tight leading-[1.05] transition-all duration-700 delay-100 ${
            visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
        >
          <span className="bg-gradient-to-br from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
            SAP Support,{" "}
          </span>
          <br />
          <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-purple-400 bg-clip-text text-transparent">
            Reimagined with AI
          </span>
        </h1>

        {/* Subheading */}
        <p
          className={`mt-6 max-w-2xl text-lg md:text-xl text-slate-400 leading-relaxed transition-all duration-700 delay-200 ${
            visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
        >
          FFC's intelligent enterprise assistant — instant SAP error resolution,
          OCR-powered screenshot analysis, and automatic expert escalation — all in one place.
        </p>

        {/* CTA Buttons */}
        <div
          className={`mt-10 flex flex-col sm:flex-row gap-4 justify-center transition-all duration-700 delay-300 ${
            visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
        >
          <Link
            to="/login"
            id="hero-employee-cta"
            className="group relative inline-flex items-center gap-2 rounded-2xl bg-indigo-600 hover:bg-indigo-500 px-8 py-4 text-base font-bold text-white transition-all duration-300 shadow-[0_0_40px_rgba(99,102,241,0.3)] hover:shadow-[0_0_60px_rgba(99,102,241,0.5)] hover:-translate-y-0.5 overflow-hidden"
          >
            <span className="relative z-10 flex items-center gap-2">
              <Bot className="h-5 w-5" />
              Employee Dashboard
              <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </span>
            <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/15 to-transparent group-hover:animate-[shimmer_1.5s_infinite]" />
          </Link>

          <Link
            to="/admin/login"
            id="hero-admin-cta"
            className="group inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 px-8 py-4 text-base font-bold text-white transition-all duration-300 hover:-translate-y-0.5 backdrop-blur-sm"
          >
            <Lock className="h-5 w-5 text-red-400" />
            Admin Control Panel
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Module Chips */}
        <div
          className={`mt-12 flex flex-wrap gap-2 justify-center transition-all duration-700 delay-500 ${
            visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
        >
          <span className="text-xs text-slate-500 font-medium mr-1 self-center">Covers:</span>
          {modules.map((m) => (
            <span
              key={m}
              className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-slate-300 backdrop-blur-sm"
            >
              {m}
            </span>
          ))}
        </div>
      </section>

      {/* ─── Stats Strip ─── */}
      <section className="relative z-10 border-y border-white/5 bg-white/[0.02] backdrop-blur-sm py-10 px-6">
        <div className="mx-auto max-w-5xl grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-3xl md:text-4xl font-black bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
                {stat.value}
              </p>
              <p className="mt-1.5 text-xs text-slate-500 font-medium uppercase tracking-wider">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Features Grid ─── */}
      <section className="relative z-10 px-6 py-24 md:py-32">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/20 bg-violet-500/10 px-3 py-1 text-xs font-bold uppercase tracking-widest text-violet-400 mb-4">
              <Zap className="h-3 w-3" /> Features
            </div>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight">
              <span className="bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                Everything You Need, One Platform
              </span>
            </h2>
            <p className="mt-4 text-slate-400 max-w-xl mx-auto text-base leading-relaxed">
              A complete SAP support ecosystem — from front-line employees to system administrators,
              from AI-powered instant answers to human expert escalation.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feat) => (
              <div
                key={feat.title}
                className={`group relative rounded-3xl border ${feat.border} bg-white/[0.03] p-6 backdrop-blur-sm hover:bg-white/[0.06] transition-all duration-300 hover:-translate-y-1 hover:${feat.glow} hover:shadow-xl`}
              >
                {/* Corner glow */}
                <div className={`absolute top-0 right-0 h-24 w-24 rounded-full ${feat.bg} blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

                <div className={`relative inline-flex h-12 w-12 items-center justify-center rounded-2xl ${feat.bg} border ${feat.border} mb-5 shadow-lg`}>
                  <feat.icon className={`h-6 w-6 ${feat.text}`} />
                </div>

                <h3 className="relative text-lg font-bold text-white mb-2">
                  {feat.title}
                </h3>
                <p className="relative text-sm text-slate-400 leading-relaxed">
                  {feat.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── How It Works ─── */}
      <section className="relative z-10 px-6 py-20 border-t border-white/5">
        <div className="mx-auto max-w-4xl">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-black text-white">
              How It Works
            </h2>
            <p className="mt-3 text-slate-400 text-base">Resolve any SAP issue in three simple steps</p>
          </div>

          <div className="relative grid gap-6 md:grid-cols-3">
            {/* Line connector */}
            <div className="hidden md:block absolute top-8 left-[25%] right-[25%] h-px bg-gradient-to-r from-indigo-500/50 via-violet-500/50 to-purple-500/50" />

            {[
              {
                step: "01",
                title: "Ask a Question or Upload a Screenshot",
                desc: "Type your SAP question in the AI chat, or drag and drop an error screenshot to the OCR upload page.",
                icon: ScanLine,
                color: "bg-indigo-500/20 border-indigo-500/30 text-indigo-300",
              },
              {
                step: "02",
                title: "AI Processes Your Query",
                desc: "The RAG pipeline searches company documents and GPT-4o Vision analyzes your uploaded image instantly.",
                icon: Bot,
                color: "bg-violet-500/20 border-violet-500/30 text-violet-300",
              },
              {
                step: "03",
                title: "Get an Answer or Expert Ticket",
                desc: "High confidence → direct answer with source citations. Low confidence → automatically escalated to an expert.",
                icon: CheckCircle2,
                color: "bg-emerald-500/20 border-emerald-500/30 text-emerald-300",
              },
            ].map((s) => (
              <div key={s.step} className="relative text-center">
                <div className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl border ${s.color} bg-opacity-20 shadow-lg`}>
                  <s.icon className="h-7 w-7" />
                </div>
                <div className="text-xs font-black text-slate-600 mb-2 tracking-widest">STEP {s.step}</div>
                <h3 className="text-base font-bold text-white mb-2">{s.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA Section ─── */}
      <section className="relative z-10 px-6 py-24 border-t border-white/5">
        <div className="mx-auto max-w-3xl text-center">
          <div className="relative rounded-3xl border border-white/10 bg-gradient-to-br from-indigo-950/60 via-slate-900/80 to-violet-950/60 p-10 md:p-14 overflow-hidden backdrop-blur-xl shadow-2xl">
            {/* Inner glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 h-40 w-80 rounded-full bg-indigo-500/20 blur-3xl" />

            <div className="relative">
              <div className="flex justify-center mb-6">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-amber-400 fill-amber-400" />
                ))}
              </div>
              <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
                Get Started Today
              </h2>
              <p className="text-slate-400 text-base leading-relaxed mb-8">
                Complete AI-powered SAP support for FFC employees and administrators.
                No training required — simply log in and start asking questions.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/login"
                  id="final-employee-cta"
                  className="group relative inline-flex items-center justify-center gap-2 rounded-2xl bg-indigo-600 hover:bg-indigo-500 px-8 py-4 text-base font-bold text-white transition-all duration-300 shadow-[0_0_40px_rgba(99,102,241,0.4)] hover:shadow-[0_0_60px_rgba(99,102,241,0.6)] hover:-translate-y-0.5 overflow-hidden"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    <Globe className="h-5 w-5" />
                    Employee Login
                    <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </span>
                  <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/15 to-transparent group-hover:animate-[shimmer_1.5s_infinite]" />
                </Link>

                <Link
                  to="/register"
                  id="final-register-cta"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 px-8 py-4 text-base font-semibold text-slate-300 hover:text-white transition-all duration-300 hover:-translate-y-0.5 backdrop-blur-sm"
                >
                  <ShieldCheck className="h-5 w-5 text-indigo-400" />
                  Request Access
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="relative z-10 border-t border-white/5 px-6 py-8 text-center">
        <div className="flex items-center justify-center gap-3 mb-3">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-tr from-indigo-500 to-violet-600">
            <Bot className="h-4 w-4 text-white" />
          </div>
          <span className="text-sm font-bold text-slate-300">Enterprise AI SAP Support Assistant</span>
        </div>
        <p className="text-xs text-slate-600">
          © 2026 FFC Internship Project · Built with React, FastAPI, LangChain & GPT-4o
        </p>
        <div className="mt-4 flex justify-center gap-6">
          <Link to="/login" className="text-xs text-slate-500 hover:text-indigo-400 transition-colors">Employee Login</Link>
          <Link to="/admin/login" className="text-xs text-slate-500 hover:text-red-400 transition-colors">Admin Portal</Link>
          <Link to="/register" className="text-xs text-slate-500 hover:text-emerald-400 transition-colors">Register</Link>
        </div>
      </footer>
    </div>
  )
}
