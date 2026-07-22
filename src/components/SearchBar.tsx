"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Search, Radio, Globe, Building, Music, Podcast, Star, BookOpen, Users } from "lucide-react"
import { cn } from "@/lib/cn"

interface SearchBarProps {
  variant?: "hero" | "compact"
}

const CATEGORIES = [
  { type: "radio", label: "Radio", icon: Radio },
  { type: "blog", label: "Blogs", icon: Globe },
  { type: "venue", label: "Venues", icon: Building },
  { type: "playlist", label: "Playlists", icon: Music },
  { type: "podcast", label: "Podcasts", icon: Podcast },
  { type: "record_label", label: "Labels", icon: Star },
  { type: "magazine", label: "Magazines", icon: BookOpen },
  { type: "press", label: "Press", icon: Users },
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

  const handleCategoryClick = (type: string) => {
    router.push(`/directory?type=${type}`)
  }

  if (variant === "compact") {
    return (
      <form onSubmit={handleSearch} className="relative">
        <div className="flex items-center gap-2 bg-navy-400/50 rounded-xl px-4 py-2.5 border border-warm-700/30 focus-within:border-brand-500/50 focus-within:ring-2 focus-within:ring-brand-500/20 transition-all">
          <Search className="w-4 h-4 text-warm-500 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search contacts..."
            className="flex-1 bg-transparent text-sm text-white placeholder:text-warm-500 outline-none"
          />
        </div>
      </form>
    )
  }

  return (
    <form onSubmit={handleSearch} className="w-full max-w-2xl mx-auto">
      <div className="relative">
        <div className="search-glow flex items-center bg-navy-400/50 backdrop-blur-sm rounded-2xl border border-warm-700/30 p-1.5 transition-all">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-warm-500" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search radio stations, venues, blogs..."
              className="w-full h-14 pl-12 pr-4 text-base bg-transparent focus:outline-none text-white placeholder:text-warm-500"
            />
          </div>
          <button
            type="submit"
            className="h-12 px-6 rounded-xl bg-brand-500 text-navy-900 font-bold text-sm hover:bg-brand-400 transition-all flex items-center gap-2"
          >
            <Search className="h-4 w-4" />
            Search
          </button>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2 mt-6">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.type}
              type="button"
              onClick={() => handleCategoryClick(cat.type)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold transition-all border border-warm-700/30 text-warm-400 hover:border-brand-500/40 hover:text-brand-400"
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
