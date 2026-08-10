import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useNavigate, Link } from "react-router-dom"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { ShieldCheck, Eye, EyeOff, AlertCircle, CheckCircle2, Loader2, Sparkles } from "lucide-react"
import api from "@/lib/api"
import { cn } from "@/lib/utils"

const registerSchema = z.object({
  name: z.string().min(2, { message: "Full Name must be at least 2 characters" }),
  email: z.string().email({ message: "Invalid email address" }),
  phone: z.string().min(10, { message: "Phone number must be at least 10 digits" }),
  role: z.enum(["employee", "expert"]),
  password: z.string()
    .min(8, { message: "Password must be at least 8 characters" })
    .regex(/[a-z]/, { message: "Must contain at least one lowercase letter" })
    .regex(/[A-Z]/, { message: "Must contain at least one uppercase letter" })
    .regex(/[0-9]/, { message: "Must contain at least one number" })
    .regex(/[^a-zA-Z0-9]/, { message: "Must contain at least one special character" }),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
})

type RegisterFormValues = z.infer<typeof registerSchema>

export default function Register() {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", email: "", phone: "", role: "employee", password: "", confirmPassword: "" },
  })

  const pwdValue = form.watch("password") || ""

  const pwdChecks = {
    length: pwdValue.length >= 8,
    lowercase: /[a-z]/.test(pwdValue),
    uppercase: /[A-Z]/.test(pwdValue),
    number: /[0-9]/.test(pwdValue),
    special: /[^a-zA-Z0-9]/.test(pwdValue),
  }

  const suggestPassword = () => {
    const lowercase = "abcdefghijklmnopqrstuvwxyz"
    const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
    const numbers = "0123456789"
    const special = "@#$!%*?&"
    const all = lowercase + uppercase + numbers + special
    
    let generated = ""
    generated += lowercase[Math.floor(Math.random() * lowercase.length)]
    generated += uppercase[Math.floor(Math.random() * uppercase.length)]
    generated += numbers[Math.floor(Math.random() * numbers.length)]
    generated += special[Math.floor(Math.random() * special.length)]
    
    for (let i = 4; i < 12; i++) {
      generated += all[Math.floor(Math.random() * all.length)]
    }
    
    // Shuffle
    generated = generated.split('').sort(() => 0.5 - Math.random()).join('')
    
    form.setValue("password", generated, { shouldValidate: true })
    form.setValue("confirmPassword", generated, { shouldValidate: true })
    
    navigator.clipboard.writeText(generated)
    setErrorMsg(null)
    setSuccessMsg(`Suggested password: ${generated} (Copied to Clipboard!)`)
  }

  async function onSubmit(data: RegisterFormValues) {
    setErrorMsg(null)
    setSuccessMsg(null)
    setLoading(true)
    try {
      const response = await api.post("/api/register", {
        name: data.name,
        email: data.email,
        phone: data.phone,
        password: data.password,
        role: data.role
      })
      if (response.data.status === "success") {
        setSuccessMsg(`Account created successfully! Redirecting to login...`)
        setTimeout(() => navigate("/login"), 1800)
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.detail || "Registration failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen w-full bg-background text-foreground overflow-y-auto">
      {/* Background blobs — fixed, no float animation */}
      <div className="fixed top-[10%] left-[10%] h-[500px] w-[500px] rounded-full bg-indigo-600/20 blur-[120px] pointer-events-none" />
      <div className="fixed bottom-[20%] right-[10%] h-[400px] w-[400px] rounded-full bg-purple-600/20 blur-[100px] pointer-events-none" />

      {/* Center content — scrollable, no float */}
      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">

          {/* Header */}
          <div className="text-center mb-6">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shadow-[0_0_30px_rgba(99,102,241,0.2)]">
              <ShieldCheck className="h-8 w-8" />
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight bg-gradient-to-br from-white to-indigo-300 bg-clip-text text-transparent">
              Request Access
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Register as an employee or expert to access the portal.
            </p>
          </div>

          {/* Card */}
          <div className="rounded-2xl border border-white/10 bg-white/5 dark:bg-slate-900/50 backdrop-blur-xl shadow-2xl p-6">

            {/* Messages */}
            {errorMsg && (
              <div className="flex items-center gap-3 mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-sm animate-in fade-in">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}
            {successMsg && (
              <div className="flex items-center gap-3 mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-sm animate-in fade-in">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">

                {/* Full Name */}
                <FormField control={form.control} name="name" render={({ field }) => (
                  <FormItem className="space-y-1">
                    <FormLabel className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Full Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="John Doe"
                        {...field}
                        className="h-10 bg-slate-950/50 border-white/10 text-white placeholder:text-slate-500 rounded-xl focus-visible:ring-1 focus-visible:ring-indigo-500"
                      />
                    </FormControl>
                    <FormMessage className="text-red-400 text-xs" />
                  </FormItem>
                )} />

                {/* Email */}
                <FormField control={form.control} name="email" render={({ field }) => (
                  <FormItem className="space-y-1">
                    <FormLabel className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Work Email</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="name@company.com"
                        {...field}
                        className="h-10 bg-slate-950/50 border-white/10 text-white placeholder:text-slate-500 rounded-xl focus-visible:ring-1 focus-visible:ring-indigo-500"
                      />
                    </FormControl>
                    <FormMessage className="text-red-400 text-xs" />
                  </FormItem>
                )} />

                {/* Phone */}
                <FormField control={form.control} name="phone" render={({ field }) => (
                  <FormItem className="space-y-1">
                    <FormLabel className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Phone Number</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="03001234567"
                        {...field}
                        className="h-10 bg-slate-950/50 border-white/10 text-white placeholder:text-slate-500 rounded-xl focus-visible:ring-1 focus-visible:ring-indigo-500"
                      />
                    </FormControl>
                    <FormMessage className="text-red-400 text-xs" />
                  </FormItem>
                )} />

                {/* Role dropdown */}
                <FormField control={form.control} name="role" render={({ field }) => (
                  <FormItem className="space-y-1">
                    <FormLabel className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Registration Role</FormLabel>
                    <FormControl>
                      <select
                        {...field}
                        className="flex h-10 w-full bg-slate-950/50 border border-white/10 text-white rounded-xl px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-indigo-500"
                      >
                        <option value="employee" className="bg-slate-950 text-white">Employee (SAP User)</option>
                        <option value="expert" className="bg-slate-950 text-white">Expert (SAP Consultant)</option>
                      </select>
                    </FormControl>
                    <FormMessage className="text-red-400 text-xs" />
                  </FormItem>
                )} />

                {/* Password with suggest option */}
                <FormField control={form.control} name="password" render={({ field }) => (
                  <FormItem className="space-y-1">
                    <div className="flex items-center justify-between">
                      <FormLabel className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Password</FormLabel>
                      <button
                        type="button"
                        onClick={suggestPassword}
                        className="text-[10px] font-bold text-indigo-400 hover:text-indigo-300 hover:underline flex items-center gap-1 focus:outline-none"
                      >
                        <Sparkles className="h-3 w-3" /> Suggest Strong Password
                      </button>
                    </div>
                    <div className="relative">
                      <FormControl>
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          {...field}
                          className="h-10 bg-slate-950/50 border-white/10 text-white placeholder:text-slate-500 rounded-xl pr-10 focus-visible:ring-1 focus-visible:ring-indigo-500"
                        />
                      </FormControl>
                      <button type="button" onClick={() => setShowPassword(v => !v)}
                        className="absolute inset-y-0 right-3 flex items-center text-slate-500 hover:text-indigo-400">
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    
                    {/* Live Strength Checklist */}
                    {pwdValue && (
                      <div className="mt-2 p-2 bg-slate-950/40 rounded-xl border border-white/5 space-y-1 text-[11px]">
                        <div className="flex items-center gap-1.5">
                          <span className={cn("h-1.5 w-1.5 rounded-full", pwdChecks.length ? "bg-emerald-500" : "bg-slate-600")} />
                          <span className={pwdChecks.length ? "text-emerald-400" : "text-slate-400"}>At least 8 characters</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className={cn("h-1.5 w-1.5 rounded-full", pwdChecks.lowercase ? "bg-emerald-500" : "bg-slate-600")} />
                          <span className={pwdChecks.lowercase ? "text-emerald-400" : "text-slate-400"}>Lowercase letter (a-z)</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className={cn("h-1.5 w-1.5 rounded-full", pwdChecks.uppercase ? "bg-emerald-500" : "bg-slate-600")} />
                          <span className={pwdChecks.uppercase ? "text-emerald-400" : "text-slate-400"}>Uppercase letter (A-Z)</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className={cn("h-1.5 w-1.5 rounded-full", pwdChecks.number ? "bg-emerald-500" : "bg-slate-600")} />
                          <span className={pwdChecks.number ? "text-emerald-400" : "text-slate-400"}>Number (0-9)</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className={cn("h-1.5 w-1.5 rounded-full", pwdChecks.special ? "bg-emerald-500" : "bg-slate-600")} />
                          <span className={pwdChecks.special ? "text-emerald-400" : "text-slate-400"}>Special character (@, #, $, %, etc.)</span>
                        </div>
                      </div>
                    )}
                    <FormMessage className="text-red-400 text-xs" />
                  </FormItem>
                )} />

                {/* Confirm Password */}
                <FormField control={form.control} name="confirmPassword" render={({ field }) => (
                  <FormItem className="space-y-1">
                    <FormLabel className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Confirm Password</FormLabel>
                    <div className="relative">
                      <FormControl>
                        <Input
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="••••••••"
                          {...field}
                          className="h-10 bg-slate-950/50 border-white/10 text-white placeholder:text-slate-500 rounded-xl pr-10 focus-visible:ring-1 focus-visible:ring-indigo-500"
                        />
                      </FormControl>
                      <button type="button" onClick={() => setShowConfirmPassword(v => !v)}
                        className="absolute inset-y-0 right-3 flex items-center text-slate-500 hover:text-indigo-400">
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    <FormMessage className="text-red-400 text-xs" />
                  </FormItem>
                )} />

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-11 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold mt-2 disabled:opacity-60 transition-all"
                >
                  {loading ? (
                    <span className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Creating Account...</span>
                  ) : "Create Account"}
                </Button>

                <p className="text-center text-sm text-slate-500 pt-1">
                  Already have access?{" "}
                  <Link to="/login" className="text-indigo-400 hover:text-indigo-300 hover:underline underline-offset-4 transition-colors">
                    Login here
                  </Link>
                </p>
              </form>
            </Form>
          </div>
        </div>
      </div>
    </div>
  )
}
