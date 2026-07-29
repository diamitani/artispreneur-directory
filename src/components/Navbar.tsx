"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Menu, X, Search, LogIn, LogOut, User, ChevronDown, Loader2, Music } from "lucide-react"
import { cn } from "@/lib/cn"
import { useAuth } from "@/lib/AuthProvider"
import { logout } from "@/lib/auth"

const navLinks = [
  { href: "/directory", label: "Browse" },
  { href: "/playlists", label: "Playlists" },
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
    <header className={cn(
      "fixed top-0 left-0 right-0 z-50 transition-all duration-400",
      scrolled
        ? "bg-white/95 backdrop-blur-xl shadow-sm border-b border-[#E8E3D9]"
        : "bg-transparent"
    )}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 shrink-0 group">
            <img
              src="/artispreneur-logo.png"
              alt="Artispreneur"
              className="h-10 w-10 object-contain"
            />
            <div>
              <span className={cn(
                "text-xl font-bold tracking-tight transition-colors",
                "font-heading",
                scrolled ? "text-[#1A1A1A]" : "text-[#1A1A1A]"
              )}>
                Artispreneur
              </span>
              <div className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#C0272D]">
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
                className="px-4 py-2 rounded-lg text-sm font-medium text-[#4A4A4A] hover:text-[#C0272D] hover:bg-[#F5E5E6] transition-all duration-200"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-3">
            {/* Search DB */}
            <Link
              href="/directory"
              className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold bg-[#C0272D] text-white hover:bg-[#A12024] transition-all shadow-sm hover:shadow-md"
            >
              <Search className="w-4 h-4" />
              <span>Search Database</span>
            </Link>

            {/* Auth */}
            {isLoading ? (
              <div className="p-2"><Loader2 className="w-4 h-4 animate-spin text-[#8a8070]" /></div>
            ) : user ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-[#4A4A4A] hover:text-[#C0272D] hover:bg-[#F5E5E6] transition-all"
                >
                  <div className="w-7 h-7 rounded-full bg-[#FFF8D6] border border-[#F5C100] flex items-center justify-center">
                    <span className="text-xs font-bold text-[#B8910A]">
                      {displayName[0].toUpperCase()}
                    </span>
                  </div>
                  <span className="hidden lg:block max-w-[100px] truncate">{displayName}</span>
                  <ChevronDown className={cn("w-3.5 h-3.5 transition-transform", userMenuOpen && "rotate-180")} />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-[#E8E3D9] rounded-xl shadow-lg overflow-hidden">
                    <div className="px-4 py-3 border-b border-[#E8E3D9]">
                      <p className="text-xs text-[#8a8070] truncate">{user.email}</p>
                    </div>
                    <div className="p-2">
                      <Link href="/account" onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-[#4A4A4A] hover:text-[#C0272D] hover:bg-[#F5E5E6] transition-colors">
                        <User className="w-4 h-4" /> My Account
                      </Link>
                      <button onClick={handleSignOut} disabled={isSigningOut}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-red-500 hover:bg-red-50 transition-colors">
                        {isSigningOut ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogOut className="w-4 h-4" />}
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link href="/login"
                className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-[#4A4A4A] hover:text-[#C0272D] hover:bg-[#F5E5E6] transition-all">
                <LogIn className="w-4 h-4" /> Sign In
              </Link>
            )}

            {/* Mobile toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 rounded-lg text-[#4A4A4A] hover:text-[#C0272D] hover:bg-[#F5E5E6] transition-all"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-b border-[#E8E3D9] shadow-lg">
          <div className="px-4 py-4 space-y-1">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href}
                onClick={() => setMobileOpen(false)}
                className="block px-4 py-3 rounded-xl text-[#4A4A4A] hover:text-[#C0272D] hover:bg-[#F5E5E6] font-medium transition-colors">
                {link.label}
              </Link>
            ))}
            <hr className="my-2 border-[#E8E3D9]" />
            <Link href="/directory" onClick={() => setMobileOpen(false)}
              className="flex items-center gap-2 px-4 py-3 rounded-xl bg-[#C0272D] text-white font-bold">
              <Search className="w-4 h-4" /> Search Database
            </Link>
            {user ? (
              <button onClick={() => { handleSignOut(); setMobileOpen(false) }}
                className="w-full flex items-center gap-2 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 font-medium text-left">
                <LogOut className="w-4 h-4" /> Sign Out
              </button>
            ) : (
              <Link href="/login" onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2 px-4 py-3 rounded-xl text-[#4A4A4A] hover:bg-[#F5E5E6] font-medium">
                <LogIn className="w-4 h-4" /> Sign In
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
