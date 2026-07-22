"use client"

import { useState } from "react"
import { Send, Sparkles, ArrowRight } from "lucide-react"
import Link from "next/link"

export default function NewsletterSection() {
  const [email, setEmail] = useState("")
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (email) {
      setSubmitted(true)
      setEmail("")
    }
  }

  return (
    <section className="py-20 sm:py-28 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-brand-500/5 via-brand-500/10 to-brand-500/5" />
      <div
        className="absolute inset-0"
        style={{
          background: "radial-gradient(ellipse 50% 50% at 50% 50%, oklch(0.72 0.19 85 / 0.08), transparent)",
        }}
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-brand-500/20 text-xs font-bold uppercase tracking-[0.15em] mb-6 text-brand-500" style={{ background: "oklch(0.72 0.19 85 / 0.06)" }}>
            <Sparkles className="h-3.5 w-3.5" />
            Start for Free
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-heading font-bold text-white mb-4">
            Ready to <span className="text-gradient-gold">Build Your Network?</span>
          </h2>

          <p className="text-lg text-warm-400 max-w-xl mx-auto leading-relaxed mb-8">
            Join thousands of independent artists using the largest free music industry database. No credit card required.
          </p>

          <div className="flex flex-wrap gap-4 justify-center mb-12">
            <Link href="/auth/register">
              <button className="h-12 px-8 rounded-xl bg-brand-500 text-navy-900 font-bold text-sm hover:bg-brand-400 transition-all flex items-center gap-2">
                Get Started Free <ArrowRight className="h-4 w-4" />
              </button>
            </Link>
            <Link href="/directory">
              <button className="h-12 px-8 rounded-xl border border-warm-700/30 text-white font-bold text-sm hover:border-brand-500/30 transition-all">
                Browse Database
              </button>
            </Link>
          </div>

          <div className="border-t border-warm-700/20 pt-10">
            <p className="text-sm text-warm-500 mb-4">Get weekly industry insights & new contacts delivered to your inbox</p>
            {submitted ? (
              <div className="inline-flex items-center gap-3 px-6 py-4 rounded-2xl bg-brand-500/10 border border-brand-500/20">
                <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                  <Send className="w-4 h-4 text-green-400" />
                </div>
                <p className="text-white font-medium">You&#39;re in! Check your inbox for a welcome email.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  className="flex-1 px-5 py-3 rounded-xl bg-navy-400/50 border border-warm-700/30 text-white placeholder:text-warm-500 text-sm outline-none focus:border-brand-500/50 focus:ring-2 focus:ring-brand-500/20 transition-all"
                />
                <button
                  type="submit"
                  className="px-6 py-3 rounded-xl bg-brand-500 text-navy-900 font-semibold text-sm hover:bg-brand-400 transition-all whitespace-nowrap flex items-center justify-center gap-2"
                >
                  Subscribe <Send className="w-4 h-4" />
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
