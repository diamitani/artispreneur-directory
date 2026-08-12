"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/AuthProvider"

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !user) router.push("/login")
  }, [user, isLoading, router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050505]">
        <div className="w-6 h-6 rounded-full border-2 border-[#22d3ee] border-t-transparent animate-spin" />
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="flex min-h-screen bg-[#050505] pt-16">
      {/* Sidebar */}
      <aside className="hidden md:flex w-56 shrink-0 flex-col border-r border-white/[0.06] bg-[#0a0a0a] p-4">
        <nav className="flex flex-col gap-0.5">
          {[
            { label: "Dashboard", href: "/app", icon: "⌂" },
            { label: "Chat", href: "/app/workspace/default", icon: "💬" },
            { label: "Contacts", href: "/directory", icon: "👥" },
            { label: "Playlists", href: "/playlists", icon: "🎵" },
            { label: "Settings", href: "/account", icon: "⚙" },
          ].map((item) => {
            const isActive =
              typeof window !== "undefined" && window.location.pathname === item.href
            return (
              <a
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] transition-colors ${
                  isActive
                    ? "bg-[#22d3ee]/10 text-[#22d3ee] font-medium"
                    : "text-white/40 hover:text-white/70 hover:bg-white/[0.03]"
                }`}
              >
                <span className="text-sm">{item.icon}</span>
                {item.label}
              </a>
            )
          })}
        </nav>

        <div className="mt-auto pt-4 border-t border-white/[0.06]">
          <div className="flex items-center gap-2.5 px-3 py-2">
            <div className="w-6 h-6 rounded-full bg-[#22d3ee]/20 flex items-center justify-center text-[10px] text-[#22d3ee] font-bold">
              {user.name?.[0]?.toUpperCase() || "U"}
            </div>
            <div className="min-w-0">
              <div className="text-[13px] font-medium text-[#f7f8f8] truncate">
                {user.name || "User"}
              </div>
              <div className="text-[11px] text-white/30 truncate">{user.email}</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile nav */}
      <div className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-[#0a0a0a]/95 backdrop-blur-xl border-t border-white/[0.06] px-4 py-2">
        <div className="flex items-center justify-around">
          {[
            { label: "Home", href: "/app", icon: "⌂" },
            { label: "Chat", href: "/app/workspace/default", icon: "💬" },
            { label: "Contacts", href: "/directory", icon: "👥" },
            { label: "More", href: "/account", icon: "⚙" },
          ].map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="flex flex-col items-center gap-0.5 px-3 py-1.5 text-[10px] text-white/40 hover:text-white/70 transition-colors"
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </a>
          ))}
        </div>
      </div>

      {/* Content */}
      <main className="flex-1 min-w-0 pb-16 md:pb-0">{children}</main>
    </div>
  )
}
