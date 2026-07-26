"use client"

import { useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { ArrowRight, AlertCircle, Loader2, CheckCircle } from "lucide-react"
import { forgotPassword, confirmForgotPassword } from "@/lib/auth"
import { cn } from "@/lib/cn"

function ForgotPasswordContent() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [code, setCode] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [step, setStep] = useState<"request" | "reset" | "done">("request")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  async function handleRequest(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setIsLoading(true)
    try {
      await forgotPassword(email)
      setStep("reset")
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to send reset email")
    } finally {
      setIsLoading(false)
    }
  }

  async function handleReset(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setIsLoading(true)
    try {
      await confirmForgotPassword({ email, code, password: newPassword })
      setStep("done")
      setTimeout(() => router.push("/login"), 2000)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to reset password")
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
          {step === "done" ? (
            <>
              <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-400" />
              </div>
              <h1 className="text-3xl font-heading font-bold text-white mb-2">Password reset!</h1>
              <p className="text-warm-400 text-sm">Redirecting to sign in...</p>
            </>
          ) : step === "reset" ? (
            <>
              <h1 className="text-3xl font-heading font-bold text-white mb-2">Reset password</h1>
              <p className="text-warm-400 text-sm">Enter the code sent to <span className="text-white">{email}</span></p>
            </>
          ) : (
            <>
              <h1 className="text-3xl font-heading font-bold text-white mb-2">Forgot password?</h1>
              <p className="text-warm-400 text-sm">Enter your email and we&apos;ll send a reset code</p>
            </>
          )}
        </div>

        {step !== "done" && (
          <div className="listing-card rounded-2xl p-8">
            {error && (
              <div className="flex items-start gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-400 mb-5">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {step === "request" ? (
              <form onSubmit={handleRequest} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-warm-300 mb-2">Email address</label>
                  <input
                    type="email" required value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full h-11 px-4 rounded-xl bg-navy-400/60 border border-warm-700/30 text-white placeholder:text-warm-500 text-sm outline-none focus:border-brand-500/50 focus:ring-2 focus:ring-brand-500/20 transition-all"
                  />
                </div>
                <button type="submit" disabled={isLoading} className="w-full h-12 rounded-xl font-bold text-sm flex items-center justify-center gap-2 bg-brand-500 text-navy-900 hover:bg-brand-400 disabled:opacity-60 transition-all">
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Send Reset Code <ArrowRight className="w-4 h-4" /></>}
                </button>
              </form>
            ) : (
              <form onSubmit={handleReset} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-warm-300 mb-2">Reset code</label>
                  <input type="text" required value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))} placeholder="000000" maxLength={6}
                    className="w-full h-11 px-4 rounded-xl bg-navy-400/60 border border-warm-700/30 text-white placeholder:text-warm-500 text-sm text-center font-mono tracking-widest outline-none focus:border-brand-500/50 transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-warm-300 mb-2">New password</label>
                  <input type="password" required value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="••••••••" minLength={8}
                    className="w-full h-11 px-4 rounded-xl bg-navy-400/60 border border-warm-700/30 text-white placeholder:text-warm-500 text-sm outline-none focus:border-brand-500/50 transition-all" />
                </div>
                <button type="submit" disabled={isLoading} className="w-full h-12 rounded-xl font-bold text-sm flex items-center justify-center gap-2 bg-brand-500 text-navy-900 hover:bg-brand-400 disabled:opacity-60 transition-all">
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Reset Password <ArrowRight className="w-4 h-4" /></>}
                </button>
              </form>
            )}

            <div className="mt-6 pt-6 border-t border-warm-700/30 text-center">
              <Link href="/login" className="text-sm text-brand-500 hover:text-brand-400 transition-colors">
                Back to sign in
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-navy-500" />}>
      <ForgotPasswordContent />
    </Suspense>
  )
}
