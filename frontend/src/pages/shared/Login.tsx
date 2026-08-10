import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useNavigate, Link } from "react-router-dom"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { ShieldCheck, Eye, EyeOff, AlertCircle } from "lucide-react"
import api from "@/lib/api"

const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
})

type LoginFormValues = z.infer<typeof loginSchema>

export default function Login() {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  useEffect(() => {
    const savedEmail = localStorage.getItem("rememberedEmail")
    if (savedEmail) {
      form.setValue("email", savedEmail)
      setRememberMe(true)
    }
  }, [])

  async function onSubmit(data: LoginFormValues) {
    setErrorMsg(null)
    try {
      const response = await api.post("/api/login", {
        email: data.email,
        password: data.password
      })
      
      const { token, role, email, name } = response.data
      
      localStorage.setItem("authToken", token)
      localStorage.setItem("userEmail", email)
      localStorage.setItem("userRole", role)
      localStorage.setItem("userName", name || email)

      if (rememberMe) {
        localStorage.setItem("rememberedEmail", data.email)
      } else {
        localStorage.removeItem("rememberedEmail")
      }

      if (role === "admin") {
        navigate("/admin")
      } else if (role === "expert") {
        navigate("/expert/dashboard")
      } else {
        navigate("/dashboard")
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.detail || "Invalid email or password.")
    }
  }

  const [showForgotModal, setShowForgotModal] = useState(false)
  const [forgotEmail, setForgotEmail] = useState("")
  const [forgotPhone, setForgotPhone] = useState("")
  const [forgotNewPass, setForgotNewPass] = useState("")
  const [forgotSuccess, setForgotSuccess] = useState("")
  const [forgotError, setForgotError] = useState("")

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setForgotSuccess("")
    setForgotError("")
    try {
      const resp = await api.post("/api/forget-password", {
        email: forgotEmail,
        phone: forgotPhone,
        new_password: forgotNewPass
      })
      if (resp.data.status === "success") {
        setForgotSuccess("Password reset successfully! Notification sent.")
        setTimeout(() => {
          setShowForgotModal(false)
          setForgotEmail("")
          setForgotPhone("")
          setForgotNewPass("")
          setForgotSuccess("")
        }, 2000)
      }
    } catch (err: any) {
      setForgotError(err.response?.data?.detail || "Failed to reset password. Check fields.")
    }
  }

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center bg-background overflow-y-auto text-foreground py-6 px-4">
      {/* Dynamic Animated Background Blobs */}
      <div className="absolute top-[-10%] left-[-10%] h-[500px] w-[500px] rounded-full bg-indigo-600/20 blur-[120px] animate-blob mix-blend-screen" />
      <div className="absolute top-[20%] right-[-10%] h-[400px] w-[400px] rounded-full bg-purple-600/20 blur-[100px] animate-blob animation-delay-2000 mix-blend-screen" />
      <div className="absolute bottom-[-20%] left-[20%] h-[600px] w-[600px] rounded-full bg-blue-600/20 blur-[130px] animate-blob animation-delay-4000 mix-blend-screen" />
      
      {/* Floating particles/noise overlay could go here */}

      <div className="relative z-10 w-full max-w-md animate-float">
        <Card className="glass-panel overflow-hidden rounded-[2rem]">
          <CardHeader className="space-y-4 text-center px-8 pt-12 pb-4">
            <div className="mx-auto flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-[2rem] bg-indigo-500/10 text-indigo-500 dark:text-indigo-400 border border-indigo-500/20 shadow-[0_0_40px_rgba(99,102,241,0.15)] relative group">
              <div className="absolute inset-0 rounded-[2rem] bg-indigo-400/20 blur-xl group-hover:bg-indigo-400/30 transition-all duration-500" />
              <ShieldCheck className="h-10 w-10 relative z-10" />
            </div>
            <div className="space-y-2">
              <CardTitle className="text-3xl sm:text-4xl font-extrabold tracking-tight bg-gradient-to-br from-slate-900 via-indigo-800 to-purple-600 dark:from-white dark:via-indigo-100 dark:to-purple-300 bg-clip-text text-transparent pb-1">
                AI Portal
              </CardTitle>
              <CardDescription className="text-muted-foreground font-medium">
                Sign in to your enterprise session.
              </CardDescription>
            </div>
          </CardHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 px-4 sm:px-8 pb-8 pt-2">
              {errorMsg && (
                <div className="flex items-center gap-3 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-300 text-sm shadow-inner shadow-red-500/10 animate-in fade-in slide-in-from-top-2">
                  <AlertCircle className="h-5 w-5 shrink-0" />
                  <span className="font-medium">{errorMsg}</span>
                </div>
              )}
              
              <div className="space-y-5">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel className="text-foreground font-semibold tracking-wide text-xs uppercase">Work Email</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="name@company.com"
                          {...field}
                          className="h-12 sm:h-14 bg-white/50 dark:bg-slate-900/50 border-black/10 dark:border-white/10 text-foreground placeholder:text-muted-foreground rounded-2xl focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:border-transparent transition-all duration-300 hover:bg-white/80 dark:hover:bg-slate-800/50"
                        />
                      </FormControl>
                      <FormMessage className="text-red-500 dark:text-red-400 text-xs font-medium" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel className="text-foreground font-semibold tracking-wide text-xs uppercase">Security Key</FormLabel>
                      <div className="relative group">
                        <FormControl>
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            {...field}
                            className="h-12 sm:h-14 bg-white/50 dark:bg-slate-900/50 border-black/10 dark:border-white/10 text-foreground placeholder:text-muted-foreground rounded-2xl pr-12 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:border-transparent transition-all duration-300 hover:bg-white/80 dark:hover:bg-slate-800/50"
                          />
                        </FormControl>
                        <button
                          type="button"
                          onClick={() => setShowPassword((current) => !current)}
                          className="absolute inset-y-0 right-4 inline-flex items-center text-muted-foreground hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                        >
                          {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      </div>
                      <FormMessage className="text-red-500 dark:text-red-400 text-xs font-medium" />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pt-2">
                <label className="inline-flex items-center gap-3 text-sm text-foreground cursor-pointer group">
                  <div className="relative flex items-center justify-center">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(event) => setRememberMe(event.target.checked)}
                      className="peer h-5 w-5 appearance-none rounded-lg border-2 border-black/20 dark:border-white/20 bg-white/50 dark:bg-slate-900/50 checked:border-indigo-600 checked:bg-indigo-600 dark:checked:border-indigo-500 dark:checked:bg-indigo-500 transition-all cursor-pointer focus:ring-2 focus:ring-indigo-500/50 focus:outline-none"
                    />
                    <svg className="absolute w-3 h-3 text-white opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="font-medium group-hover:text-indigo-600 dark:group-hover:text-white transition-colors">Remember me</span>
                </label>
                <button
                  type="button"
                  onClick={() => setShowForgotModal(true)}
                  className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors focus:outline-none"
                >
                  Forgot Password?
                </button>
              </div>

              <Button
                type="submit"
                className="group relative w-full overflow-hidden rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold h-12 sm:h-14 transition-all duration-300 shadow-[0_0_40px_rgba(79,70,229,0.3)] hover:shadow-[0_0_60px_rgba(79,70,229,0.5)] hover:-translate-y-0.5"
              >
                <span className="relative z-10 text-base">Initialize Session</span>
                <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:animate-[shimmer_1.5s_infinite]" />
              </Button>
            </form>
          </Form>

          <div className="border-t border-black/5 dark:border-white/10 px-4 sm:px-8 py-5 bg-black/5 dark:bg-slate-950/40">
            <p className="text-center text-sm font-medium text-muted-foreground">
              New employee?{" "}
              <Link to="/register" className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors hover:underline underline-offset-4">
                Request Access
              </Link>
            </p>
          </div>
        </Card>
      </div>

      {/* Forgot Password Modal Dialog */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-[2rem] border border-white/10 bg-[#0d1030] p-8 shadow-2xl text-white">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-black bg-gradient-to-r from-white to-indigo-300 bg-clip-text text-transparent">Reset Password</h3>
              <p className="text-xs text-slate-400 mt-1">Enter your registered email and phone number to set a new key.</p>
            </div>
            
            <form onSubmit={handleResetPassword} className="space-y-4">
              {forgotError && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium">
                  {forgotError}
                </div>
              )}
              {forgotSuccess && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
                  {forgotSuccess}
                </div>
              )}

              <div>
                <label className="text-[10px] uppercase font-bold tracking-widest text-slate-400 block mb-1.5">Work Email</label>
                <Input
                  required
                  type="email"
                  placeholder="name@company.com"
                  className="bg-slate-950/50 border-white/10 text-white rounded-2xl h-11"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                />
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold tracking-widest text-slate-400 block mb-1.5">Phone Number</label>
                <Input
                  required
                  type="text"
                  placeholder="+923001234567"
                  className="bg-slate-950/50 border-white/10 text-white rounded-2xl h-11"
                  value={forgotPhone}
                  onChange={(e) => setForgotPhone(e.target.value)}
                />
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold tracking-widest text-slate-400 block mb-1.5">New Password</label>
                <Input
                  required
                  type="password"
                  placeholder="••••••••"
                  className="bg-slate-950/50 border-white/10 text-white rounded-2xl h-11"
                  value={forgotNewPass}
                  onChange={(e) => setForgotNewPass(e.target.value)}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  className="flex-1 rounded-2xl h-11 border border-white/5 hover:bg-white/5 text-slate-400 hover:text-white"
                  onClick={() => {
                    setShowForgotModal(false)
                    setForgotError("")
                    setForgotSuccess("")
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl h-11 font-bold"
                >
                  Reset Key
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
