"use client"

import { useEffect } from "react"
import Link from "next/link"

export default function Navbar() {
  const scrollTo = (id: string) => {
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible")
          }
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
    )
    document.querySelectorAll(".reveal").forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  return (
    <nav className="fixed top-0 inset-x-0 z-50 flex justify-center pt-4 px-4 pointer-events-none">
      <div className="pointer-events-auto flex items-center gap-6 px-5 py-2.5 rounded-full bg-[#0a0a0a]/80 backdrop-blur-xl border border-white/[0.06] shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <span className="text-sm font-semibold tracking-tight text-[#f7f8f8]">
            Artispreneur
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-1">
          {[
            { label: "Features", id: "features" },
            { label: "How It Works", id: "how-it-works" },
            { label: "Pricing", id: "pricing" },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => scrollTo(item.id)}
              className="px-3 py-1.5 text-[13px] font-medium text-white/50 hover:text-white/90 transition-colors rounded-lg hover:bg-white/[0.04]"
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/login"
            className="hidden sm:inline-flex px-4 py-1.5 text-[13px] font-medium text-white/60 hover:text-white/90 transition-colors"
          >
            Sign In
          </Link>
          <Link
            href="/signup"
            className="inline-flex items-center gap-1.5 px-4 py-1.5 text-[13px] font-semibold bg-[#22d3ee] text-[#050505] rounded-full hover:bg-[#67e8f9] transition-all hover:scale-[1.03] active:scale-[0.98] shadow-[0_0_20px_rgba(34,211,238,0.18)]"
          >
            Get Started
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </Link>
        </div>
      </div>
    </nav>
  )
}
