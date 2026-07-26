"use client"

import { useState } from "react"
import Link from "next/link"
import { Mail, ArrowRight } from "lucide-react"

export default function NewsletterSection() {
  const [email, setEmail] = useState("")
  const [submitted, setSubmitted] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (email) setSubmitted(true)
  }

  return (
    <section className="py-20 sm:py-28 bg-[#1A1A1A] text-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="eyebrow mb-4 flex items-center justify-center gap-2 text-[#F5C100]">
          <div className="h-px w-6 bg-[#F5C100]" />
          STAY IN THE LOOP
          <div className="h-px w-6 bg-[#F5C100]" />
        </div>
        <h2 className="text-3xl sm:text-4xl font-heading font-bold text-white mb-4">
          Get Weekly Music Industry <span className="text-[#F5C100]">Insights</span>
        </h2>
        <p className="text-white/60 text-lg leading-relaxed mb-8">
          New contacts, promotion tips, and industry news — straight to your inbox. Free forever.
        </p>

        {submitted ? (
          <div className="inline-flex items-center gap-3 px-6 py-4 rounded-2xl bg-white/10 border border-[#F5C100]/30">
            <span className="w-2 h-2 rounded-full bg-[#F5C100] animate-pulse" />
            <span className="text-[#F5C100] font-bold">You're on the list. Art Means Business.</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <div className="relative flex-1">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <input
                type="email" required value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full h-12 pl-11 pr-4 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-white/40 text-sm outline-none focus:border-[#F5C100]/50 focus:bg-white/15 transition-all"
              />
            </div>
            <button type="submit"
              className="h-12 px-6 rounded-xl bg-[#C0272D] text-white font-bold text-sm hover:bg-[#A12024] transition-all flex items-center gap-2 justify-center shrink-0">
              Subscribe <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        <p className="text-xs text-white/30 mt-4">
          No spam. Unsubscribe anytime.
        </p>
      </div>
    </section>
  )
}
