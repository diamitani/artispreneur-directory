"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { ArrowRight, AlertCircle, Loader2, CheckCircle, RefreshCw } from "lucide-react"
import { confirmEmail, login } from "@/lib/auth"
import { cn } from "@/lib/cn"

function VerifyContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams.get("email") || ""
  const [code, setCode] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setIsLoading(true)
    try {
      await confirmEmail({ email, code })
      setSuccess(true)
      setTimeout(() => router.push("/login"), 2000)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Verification failed"
      if (msg.includes("CodeMismatchException") || msg.includes("Invalid verification code")) {
        setError("Invalid code. Please check your email and try again.")
      } else if (msg.includes("ExpiredCodeException")) {
        setError("Code expired. Please request a new one.")
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
          {success ? (
            <>
              <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-400" />
              </div>
              <h1 className="text-3xl font-heading font-bold text-white mb-2">Email verified!</h1>
              <p className="text-warm-400 text-sm">Redirecting you to sign in...</p>
            </>
          ) : (
            <>
              <h1 className="text-3xl font-heading font-bold text-white mb-2">Verify your email</h1>
              <p className="text-warm-400 text-sm">
                We sent a 6-digit code to{" "}
                <span className="text-white font-medium">{email}</span>
              </p>
            </>
          )}
        </div>

        {!success && (
          <div className="listing-card rounded-2xl p-8">
            <form onSubmit={handleVerify} className="space-y-5">
              {error && (
                <div className="flex items-start gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-400">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-warm-300 mb-2">Verification code</label>
                <input
                  type="text"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="000000"
                  maxLength={6}
                  className="w-full h-14 px-4 rounded-xl bg-navy-400/60 border border-warm-700/30 text-white placeholder:text-warm-500 text-2xl text-center font-mono tracking-widest outline-none focus:border-brand-500/50 focus:ring-2 focus:ring-brand-500/20 transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading || code.length < 6}
                className={cn(
                  "w-full h-12 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all",
                  "bg-brand-500 text-navy-900 hover:bg-brand-400 disabled:opacity-60 disabled:cursor-not-allowed"
                )}
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Verify Email <ArrowRight className="w-4 h-4" /></>}
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-warm-700/30 text-center">
              <p className="text-sm text-warm-400 mb-2">Didn&apos;t receive the code?</p>
              <Link href="/signup" className="text-xs text-brand-500 hover:text-brand-400 transition-colors">
                Go back and try again
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function VerifyPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-navy-500" />}>
      <VerifyContent />
    </Suspense>
  )
}
