"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Menu, X, Search, Music, User } from "lucide-react"
import { cn } from "@/lib/cn"

const navLinks = [
  { href: "/directory", label: "Browse" },
  { href: "/categories", label: "Categories" },
  { href: "/pricing", label: "Pricing" },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
        scrolled
          ? "bg-navy-500/80 backdrop-blur-xl border-b border-warm-700/20 shadow-sm"
          : "bg-transparent"
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          <Link href="/" className="flex items-center gap-3 shrink-0">
            <img src="/artispreneur-logo.png" alt="Artispreneur" className="h-9 w-9 rounded-lg" />
            <div>
              <span className="text-xl font-heading font-bold tracking-tight text-white">
                Artispreneur
              </span>
              <div className="text-[9px] font-semibold uppercase tracking-[0.15em] text-brand-500">
                Music Industry Database
              </div>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                  scrolled
                    ? "text-warm-300 hover:text-white hover:bg-white/5"
                    : "text-white/80 hover:text-white hover:bg-white/10"
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/directory"
              className={cn(
                "hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
                scrolled
                  ? "bg-brand-500 text-navy-900 hover:bg-brand-400"
                  : "bg-brand-500/90 text-navy-900 hover:bg-brand-400 backdrop-blur-sm"
              )}
            >
              <Search className="w-4 h-4" />
              <span>Search Database</span>
            </Link>

            <Link
              href="/login"
              className={cn(
                "p-2 rounded-lg transition-all",
                scrolled
                  ? "text-warm-400 hover:text-white hover:bg-white/5"
                  : "text-white/80 hover:text-white hover:bg-white/10"
              )}
            >
              <User className="w-5 h-5" />
            </Link>

            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className={cn(
                "md:hidden p-2 rounded-lg transition-all",
                scrolled
                  ? "text-white hover:bg-white/5"
                  : "text-white hover:bg-white/10"
              )}
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden bg-navy-600 border-b border-warm-700/20 shadow-lg animate-in slide-in-from-top-2">
          <div className="px-4 py-4 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="block px-4 py-3 rounded-xl text-warm-300 hover:text-white hover:bg-white/5 font-medium transition-colors"
              >
                {link.label}
              </Link>
            ))}
            <hr className="my-2 border-warm-700/30" />
            <Link
              href="/directory"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-2 px-4 py-3 rounded-xl bg-brand-500 text-navy-900 font-medium"
            >
              <Search className="w-4 h-4" />
              Search Database
            </Link>
            <Link
              href="/login"
              onClick={() => setMobileOpen(false)}
              className="block px-4 py-3 rounded-xl text-warm-300 hover:text-white hover:bg-white/5 font-medium"
            >
              Sign In
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
