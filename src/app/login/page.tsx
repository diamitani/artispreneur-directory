"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Eye, EyeOff, Music, ArrowRight, AlertCircle, Loader2 } from "lucide-react"
import { login } from "@/lib/auth"
import { cn } from "@/lib/cn"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setIsLoading(true)
    try {
      const result = await login({ email, password })
      if (result.isSignedIn) {
        router.push("/directory")
      } else if (result.nextStep?.signInStep === "CONFIRM_SIGN_UP") {
        router.push(`/verify?email=${encodeURIComponent(email)}`)
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Sign in failed"
      if (msg.includes("User does not exist") || msg.includes("Incorrect username or password")) {
        setError("Incorrect email or password.")
      } else if (msg.includes("User is not confirmed")) {
        router.push(`/verify?email=${encodeURIComponent(email)}`)
      } else {
        setError(msg)
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-navy-500 px-4">
      <div className="absolute inset-0 bg-gradient-to-b from-navy-600 via-navy-500 to-navy-500" />
      <div
        className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full opacity-10 pointer-events-none"
        style={{ background: "oklch(0.72 0.19 85)", filter: "blur(120px)" }}
      />

      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3 mb-6">
            <img src="/artispreneur-logo.png" alt="Artispreneur" className="h-10 w-10 rounded-xl" />
            <span className="text-2xl font-heading font-bold text-white">Artispreneur</span>
          </Link>
          <h1 className="text-3xl font-heading font-bold text-white mb-2">Welcome back</h1>
          <p className="text-warm-400 text-sm">Sign in to access 78,000+ music industry contacts</p>
        </div>

        <div className="listing-card rounded-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="flex items-start gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-400">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-warm-300 mb-2">Email address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full h-11 px-4 rounded-xl bg-navy-400/60 border border-warm-700/30 text-white placeholder:text-warm-500 text-sm outline-none focus:border-brand-500/50 focus:ring-2 focus:ring-brand-500/20 transition-all"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-warm-300">Password</label>
                <Link href="/forgot-password" className="text-xs text-brand-500 hover:text-brand-400 transition-colors">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-11 pl-4 pr-11 rounded-xl bg-navy-400/60 border border-warm-700/30 text-white placeholder:text-warm-500 text-sm outline-none focus:border-brand-500/50 focus:ring-2 focus:ring-brand-500/20 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-warm-500 hover:text-warm-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={cn(
                "w-full h-12 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all",
                "bg-brand-500 text-navy-900 hover:bg-brand-400 disabled:opacity-60 disabled:cursor-not-allowed"
              )}
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  Sign In <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-warm-700/30 text-center">
            <p className="text-sm text-warm-400">
              Don&apos;t have an account?{" "}
              <Link href="/signup" className="text-brand-500 hover:text-brand-400 font-medium transition-colors">
                Create one free
              </Link>
            </p>
          </div>
        </div>

        <p className="text-center text-xs text-warm-600 mt-6">
          By signing in you agree to our{" "}
          <Link href="/terms" className="text-warm-400 hover:text-white transition-colors">Terms</Link>
          {" "}and{" "}
          <Link href="/privacy" className="text-warm-400 hover:text-white transition-colors">Privacy Policy</Link>.
        </p>
      </div>
    </div>
  )
}
