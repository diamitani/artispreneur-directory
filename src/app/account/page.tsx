"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { User, Mail, LogOut, Database, ArrowRight, Loader2, Shield } from "lucide-react"
import { useAuth } from "@/lib/AuthProvider"
import { logout } from "@/lib/auth"

export default function AccountPage() {
  const router = useRouter()
  const { user, isLoading } = useAuth()

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login")
    }
  }, [user, isLoading, router])

  async function handleSignOut() {
    await logout()
    router.push("/")
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-navy-500 pt-24 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
      </div>
    )
  }

  if (!user) return null

  const displayName = user.name || user.email?.split("@")[0] || "Artist"
  const initials = displayName[0].toUpperCase()

  return (
    <div className="min-h-screen bg-navy-500 pt-24 pb-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="flex items-center gap-5 mb-10">
          <div className="w-16 h-16 rounded-2xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-2xl font-heading font-bold text-brand-400">
            {initials}
          </div>
          <div>
            <h1 className="text-2xl font-heading font-bold text-white">{displayName}</h1>
            <p className="text-sm text-warm-400">{user.email}</p>
          </div>
        </div>

        {/* Profile card */}
        <div className="listing-card rounded-2xl p-6 mb-6">
          <h2 className="font-heading font-semibold text-white mb-5 flex items-center gap-2">
            <User className="w-4 h-4 text-brand-500" /> Account Details
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-warm-500 uppercase tracking-wider mb-1">Name</label>
              <p className="text-white text-sm">{user.name || "—"}</p>
            </div>
            <div>
              <label className="block text-xs font-semibold text-warm-500 uppercase tracking-wider mb-1">Email</label>
              <p className="text-white text-sm flex items-center gap-2">
                {user.email}
                <span className="text-[10px] font-bold text-green-400 bg-green-400/10 px-2 py-0.5 rounded-full border border-green-400/20">VERIFIED</span>
              </p>
            </div>
            <div>
              <label className="block text-xs font-semibold text-warm-500 uppercase tracking-wider mb-1">User ID</label>
              <p className="text-warm-500 text-xs font-mono">{user.userId}</p>
            </div>
          </div>
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <Link
            href="/directory"
            className="listing-card rounded-2xl p-5 flex items-center gap-4 hover:border-brand-500/30 transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center">
              <Database className="w-5 h-5 text-brand-500" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-white text-sm group-hover:text-brand-400 transition-colors">Browse Database</p>
              <p className="text-xs text-warm-500">78,000+ contacts</p>
            </div>
            <ArrowRight className="w-4 h-4 text-warm-600 group-hover:text-brand-500 group-hover:translate-x-1 transition-all" />
          </Link>

          <Link
            href="/pricing"
            className="listing-card rounded-2xl p-5 flex items-center gap-4 hover:border-brand-500/30 transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center">
              <Shield className="w-5 h-5 text-brand-500" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-white text-sm group-hover:text-brand-400 transition-colors">Upgrade to Pro</p>
              <p className="text-xs text-warm-500">Unlock emails & exports</p>
            </div>
            <ArrowRight className="w-4 h-4 text-warm-600 group-hover:text-brand-500 group-hover:translate-x-1 transition-all" />
          </Link>
        </div>

        {/* Sign out */}
        <div className="listing-card rounded-2xl p-6">
          <h2 className="font-heading font-semibold text-white mb-4 text-sm">Danger Zone</h2>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-red-500/20 text-red-400 text-sm font-semibold hover:bg-red-500/10 hover:border-red-500/30 transition-all"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </div>
    </div>
  )
}
