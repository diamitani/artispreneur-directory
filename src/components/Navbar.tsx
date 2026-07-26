"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Menu, X, Search, LogIn, LogOut, User, ChevronDown, Loader2 } from "lucide-react"
import { cn } from "@/lib/cn"
import { useAuth } from "@/lib/AuthProvider"
import { logout } from "@/lib/auth"

const navLinks = [
  { href: "/directory", label: "Browse" },
  { href: "/categories", label: "Categories" },
  { href: "/pricing", label: "Pricing" },
]

export default function Navbar() {
  const router = useRouter()
  const { user, isLoading } = useAuth()
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [isSigningOut, setIsSigningOut] = useState(false)
  const userMenuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  // Close user menu on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  async function handleSignOut() {
    setIsSigningOut(true)
    try {
      await logout()
      setUserMenuOpen(false)
      router.push("/")
    } finally {
      setIsSigningOut(false)
    }
  }

  const displayName = user?.name || user?.email?.split("@")[0] || "Account"

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

          {/* Logo */}
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

          {/* Desktop nav */}
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

          {/* Right actions */}
          <div className="flex items-center gap-3">
            {/* Search DB button */}
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

            {/* Auth area */}
            {isLoading ? (
              <div className="p-2">
                <Loader2 className="w-4 h-4 animate-spin text-warm-500" />
              </div>
            ) : user ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all",
                    scrolled
                      ? "text-warm-300 hover:text-white hover:bg-white/5"
                      : "text-white/80 hover:text-white hover:bg-white/10"
                  )}
                >
                  <div className="w-7 h-7 rounded-full bg-brand-500/20 border border-brand-500/30 flex items-center justify-center">
                    <span className="text-xs font-bold text-brand-400">
                      {displayName[0].toUpperCase()}
                    </span>
                  </div>
                  <span className="hidden lg:block max-w-[100px] truncate">{displayName}</span>
                  <ChevronDown className={cn("w-3.5 h-3.5 transition-transform", userMenuOpen && "rotate-180")} />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-navy-400 border border-warm-700/30 rounded-xl shadow-xl overflow-hidden">
                    <div className="px-4 py-3 border-b border-warm-700/20">
                      <p className="text-xs text-warm-500 truncate">{user.email}</p>
                    </div>
                    <div className="p-2">
                      <Link
                        href="/account"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-warm-300 hover:text-white hover:bg-white/5 transition-colors"
                      >
                        <User className="w-4 h-4" /> My Account
                      </Link>
                      <button
                        onClick={handleSignOut}
                        disabled={isSigningOut}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                      >
                        {isSigningOut ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogOut className="w-4 h-4" />}
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className={cn(
                  "hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all",
                  scrolled
                    ? "text-warm-400 hover:text-white hover:bg-white/5"
                    : "text-white/80 hover:text-white hover:bg-white/10"
                )}
              >
                <LogIn className="w-4 h-4" /> Sign In
              </Link>
            )}

            {/* Mobile menu toggle */}
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

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-navy-600 border-b border-warm-700/20 shadow-lg">
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
            {user ? (
              <button
                onClick={() => { handleSignOut(); setMobileOpen(false) }}
                className="w-full flex items-center gap-2 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 font-medium text-left"
              >
                <LogOut className="w-4 h-4" /> Sign Out
              </button>
            ) : (
              <Link
                href="/login"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2 px-4 py-3 rounded-xl text-warm-300 hover:text-white hover:bg-white/5 font-medium"
              >
                <LogIn className="w-4 h-4" /> Sign In
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
