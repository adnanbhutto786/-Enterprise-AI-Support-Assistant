import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useNavigate } from "react-router-dom"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { ShieldAlert, Eye, EyeOff, Lock } from "lucide-react"
import api from "@/lib/api"

const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
})

type LoginFormValues = z.infer<typeof loginSchema>

export default function AdminLogin() {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  async function onSubmit(data: LoginFormValues) {
    setErrorMessage(null)
    
    try {
      const response = await api.post("/api/login", {
        email: data.email,
        password: data.password
      })
      
      const { token, role, email, name } = response.data
      
      if (role !== "admin") {
        setErrorMessage("Access Denied: Only administrators can access this portal.")
        return
      }

      localStorage.setItem("authToken", token)
      localStorage.setItem("userEmail", email)
      localStorage.setItem("userRole", role)
      localStorage.setItem("userName", name || email)
      
      navigate("/admin")
    } catch (err: any) {
      setErrorMessage(err.response?.data?.detail || "Invalid email or password.")
    }
  }

  return (
    <div className="relative flex h-screen w-full items-center justify-center bg-background overflow-y-auto text-foreground p-4">
      {/* Deep dark red/indigo security glow - animated */}
      <div className="absolute top-[10%] left-[20%] h-[500px] w-[500px] rounded-full bg-red-600/10 blur-[130px] animate-blob mix-blend-screen" />
      <div className="absolute bottom-[10%] right-[20%] h-[600px] w-[600px] rounded-full bg-rose-900/20 blur-[150px] animate-blob animation-delay-2000 mix-blend-screen" />

      <div className="relative z-10 w-full max-w-md px-4 animate-float">
        <Card className="glass-panel overflow-hidden border-t-red-500/20 border-l-red-500/20 rounded-[2rem] bg-white/80 dark:bg-slate-950/80">
          <CardHeader className="space-y-4 text-center px-8 pt-12 pb-4">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[2rem] bg-red-500/10 text-red-600 dark:text-red-500 border border-red-500/20 shadow-[0_0_40px_rgba(239,68,68,0.15)] relative group">
              <div className="absolute inset-0 rounded-[2rem] bg-red-500/20 blur-xl group-hover:bg-red-500/30 transition-all duration-500" />
              <Lock className="h-10 w-10 relative z-10" />
            </div>
            <div className="space-y-2">
              <CardTitle className="text-4xl font-extrabold tracking-tight bg-gradient-to-br from-slate-900 via-red-800 to-rose-600 dark:from-white dark:via-red-100 dark:to-rose-400 bg-clip-text text-transparent pb-1">
                Admin Shield
              </CardTitle>
              <CardDescription className="text-muted-foreground font-medium">
                Restricted Area: Authorized personnel only.
              </CardDescription>
            </div>
          </CardHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 px-8 pb-10">
              {errorMessage && (
                <div className="flex items-center gap-3 p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-sm shadow-inner shadow-red-500/10 animate-in fade-in slide-in-from-top-2">
                  <ShieldAlert className="h-5 w-5 shrink-0" />
                  <span className="font-semibold">{errorMessage}</span>
                </div>
              )}

              <div className="space-y-5">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel className="text-foreground font-semibold tracking-wide text-xs uppercase">Admin Identity</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="admin@company.com"
                          {...field}
                          className="h-14 bg-white/50 dark:bg-slate-900/50 border-black/10 dark:border-white/10 text-foreground placeholder:text-muted-foreground rounded-2xl focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:border-transparent transition-all duration-300 hover:bg-white/80 dark:hover:bg-slate-800/50"
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
                      <FormLabel className="text-foreground font-semibold tracking-wide text-xs uppercase">Passphrase</FormLabel>
                      <div className="relative group">
                        <FormControl>
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            {...field}
                            className="h-14 bg-white/50 dark:bg-slate-900/50 border-black/10 dark:border-white/10 text-foreground placeholder:text-muted-foreground rounded-2xl pr-12 focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:border-transparent transition-all duration-300 hover:bg-white/80 dark:hover:bg-slate-800/50"
                          />
                        </FormControl>
                        <button
                          type="button"
                          onClick={() => setShowPassword((current) => !current)}
                          className="absolute inset-y-0 right-4 inline-flex items-center text-muted-foreground hover:text-red-600 dark:hover:text-red-400 transition-colors"
                        >
                          {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      </div>
                      <FormMessage className="text-red-500 dark:text-red-400 text-xs font-medium" />
                    </FormItem>
                  )}
                />
              </div>

              <Button
                type="submit"
                className="group relative w-full overflow-hidden rounded-2xl bg-red-600 hover:bg-red-500 text-white font-bold h-14 transition-all duration-300 shadow-[0_0_40px_rgba(220,38,38,0.2)] hover:shadow-[0_0_60px_rgba(220,38,38,0.4)] hover:-translate-y-0.5 mt-4"
              >
                <span className="relative z-10 text-base tracking-wide">Authenticate Admin</span>
                <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:animate-[shimmer_1.5s_infinite]" />
              </Button>
            </form>
          </Form>
        </Card>
      </div>
    </div>
  )
}
