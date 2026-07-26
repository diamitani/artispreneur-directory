"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Search, Radio, Globe, Building, Music, Podcast, Star, BookOpen, Users, Layers } from "lucide-react"
import { cn } from "@/lib/cn"

interface SearchBarProps { variant?: "hero" | "compact" }

const CATEGORIES = [
  { type: "radio", label: "Radio", icon: Radio },
  { type: "blog", label: "Blogs", icon: Globe },
  { type: "venue", label: "Venues", icon: Building },
  { type: "playlist", label: "Playlists", icon: Music },
  { type: "podcast", label: "Podcasts", icon: Podcast },
  { type: "record_label", label: "Labels", icon: Star },
  { type: "magazine", label: "Magazines", icon: BookOpen },
  { type: "press", label: "Press", icon: Users },
  { type: "resource", label: "Resources", icon: Layers },
]

export default function SearchBar({ variant = "hero" }: SearchBarProps) {
  const router = useRouter()
  const [query, setQuery] = useState("")

  const handleSearch = (e?: React.FormEvent) => {
    e?.preventDefault()
    const params = new URLSearchParams()
    if (query) params.set("q", query)
    router.push(`/directory?${params.toString()}`)
  }

  if (variant === "compact") {
    return (
      <form onSubmit={handleSearch} className="relative">
        <div className="flex items-center gap-2 bg-white rounded-xl px-4 py-2.5 border border-[#E8E3D9] focus-within:border-[#C0272D]/40 focus-within:ring-2 focus-within:ring-[#C0272D]/10 transition-all shadow-sm">
          <Search className="w-4 h-4 text-[#8a8070] shrink-0" />
          <input
            type="text" value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search contacts..."
            className="flex-1 bg-transparent text-sm text-[#1A1A1A] placeholder:text-[#8a8070] outline-none"
          />
        </div>
      </form>
    )
  }

  return (
    <form onSubmit={handleSearch} className="w-full max-w-2xl">
      <div className="relative">
        <div className="search-glow flex items-center bg-white/95 backdrop-blur-sm rounded-2xl border border-white/50 p-1.5 transition-all shadow-xl">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#8a8070]" />
            <input
              type="text" value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search radio stations, venues, blogs..."
              className="w-full h-14 pl-12 pr-4 text-base bg-transparent focus:outline-none text-[#1A1A1A] placeholder:text-[#8a8070]"
            />
          </div>
          <button
            type="submit"
            className="h-12 px-6 rounded-xl bg-[#C0272D] text-white font-bold text-sm hover:bg-[#A12024] transition-all flex items-center gap-2 shadow-md"
          >
            <Search className="h-4 w-4" />
            Search
          </button>
        </div>

        <div className="flex flex-wrap items-center justify-start gap-2 mt-5">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.type} type="button"
              onClick={() => router.push(`/directory?type=${cat.type}`)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all bg-white/20 backdrop-blur-sm border border-white/30 text-white hover:bg-white/30"
            >
              <cat.icon className="h-3 w-3" />
              {cat.label}
            </button>
          ))}
        </div>
      </div>
    </form>
  )
}
