"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useAuth } from "@/lib/AuthProvider"

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000"

interface Workspace {
  id: string
  name: string
  description: string
  chat_count: number
  created_at: string
}

export default function DashboardPage() {
  const { user } = useAuth()
  const [workspaces, setWorkspaces] = useState<Workspace[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) return
    fetch(`${BACKEND}/api/v1/workspaces`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        setWorkspaces(Array.isArray(data) ? data : [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  return (
    <div className="p-6 lg:p-10 max-w-5xl">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-2xl font-semibold text-[#f7f8f8] tracking-[-0.03em]">
          Welcome back{user?.name ? `, ${user.name.split(" ")[0]}` : ""}
        </h1>
        <p className="mt-1 text-[15px] text-white/50">
          Your music career command center.
        </p>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {[
          { label: "Workspaces", value: loading ? "—" : workspaces.length.toString(), icon: "📁" },
          { label: "Contacts", value: "79K+", icon: "👥" },
          { label: "AI Messages", value: "∞", icon: "💬" },
          { label: "Plan", value: "Free", icon: "💎" },
        ].map((stat) => (
          <div key={stat.label} className="glass-card p-4">
            <div className="text-lg mb-1">{stat.icon}</div>
            <div className="stat-number text-xl font-semibold text-[#f7f8f8] tracking-tight">
              {stat.value}
            </div>
            <div className="text-[13px] text-white/40 mt-0.5">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Workspaces */}
      <div>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-[#f7f8f8]">Your Workspaces</h2>
          <Link
            href="/app/workspace/new"
            className="px-4 py-1.5 rounded-full bg-[#22d3ee]/10 border border-[#22d3ee]/15 text-[13px] font-medium text-[#22d3ee] hover:bg-[#22d3ee]/15 transition-colors"
          >
            + New Workspace
          </Link>
        </div>

        {loading ? (
          <div className="glass-card p-8 text-center text-white/40 text-[14px]">
            Loading workspaces...
          </div>
        ) : workspaces.length === 0 ? (
          <Link href="/app/workspace/default">
            <div className="double-bezel">
              <div className="double-bezel-inner p-6 text-center hover:border-[#22d3ee]/20 transition-colors cursor-pointer">
                <div className="text-3xl mb-3">🚀</div>
                <h3 className="text-[15px] font-semibold text-[#f7f8f8]">
                  Start your first workspace
                </h3>
                <p className="mt-1 text-[14px] text-white/40">
                  Chat with the AI agent, plan releases, find contacts.
                </p>
              </div>
            </div>
          </Link>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {workspaces.map((ws) => (
              <Link key={ws.id} href={`/app/workspace/${ws.id}`}>
                <div className="glass-card p-5 hover:border-[#22d3ee]/20 transition-colors">
                  <h3 className="text-[15px] font-semibold text-[#f7f8f8]">{ws.name}</h3>
                  <p className="text-[13px] text-white/40 mt-1 line-clamp-2">
                    {ws.description || "No description"}
                  </p>
                  <div className="flex items-center gap-3 mt-4 text-[12px] text-white/30">
                    <span>💬 {ws.chat_count} messages</span>
                    <span>
                      {new Date(ws.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
