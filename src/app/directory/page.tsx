"use client"

import { useState, useMemo, useEffect, useRef, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import {
  Search, MapPin, Globe, Music, Radio, Building, Podcast, BookOpen,
  Star, Users, Newspaper, Truck, Book, Library, X, ArrowRight, Mail,
} from "lucide-react"
import Link from "next/link"

interface Contact {
  id: string
  name: string
  type: string
  location?: string
  description?: string
  website?: string
  email?: string
}

const ITEMS_PER_PAGE = 24

const DIRECTORY_TYPES = [
  { type: "all", label: "All", icon: Globe },
  { type: "radio", label: "Radio", icon: Radio },
  { type: "blog", label: "Blogs", icon: Globe },
  { type: "venue", label: "Venues", icon: Building },
  { type: "playlist", label: "Playlists", icon: Music },
  { type: "podcast", label: "Podcasts", icon: Podcast },
  { type: "record_label", label: "Labels", icon: Star },
  { type: "magazine", label: "Magazines", icon: BookOpen },
  { type: "press", label: "Press", icon: Users },
  { type: "newspaper", label: "Newspapers", icon: Newspaper },
  { type: "distributor", label: "Distributors", icon: Truck },
  { type: "publisher", label: "Publishers", icon: Book },
  { type: "licensing_library", label: "Sync Libraries", icon: Library },
]

const ICON_MAP: Record<string, React.ElementType> = {
  radio: Radio,
  blog: Globe,
  playlist: Music,
  podcast: Podcast,
  magazine: BookOpen,
  reviewer: Star,
  newspaper: Newspaper,
  press: Users,
  venue: Building,
  record_label: Star,
  distributor: Truck,
  publisher: Book,
  licensing_library: Library,
}

const TYPE_COLORS: Record<string, string> = {
  radio: "border-l-blue-400",
  blog: "border-l-violet-400",
  venue: "border-l-pink-400",
  playlist: "border-l-emerald-400",
  podcast: "border-l-teal-400",
  record_label: "border-l-brand-500",
  magazine: "border-l-amber-400",
  press: "border-l-cyan-400",
  newspaper: "border-l-indigo-400",
  distributor: "border-l-orange-400",
  publisher: "border-l-green-400",
  licensing_library: "border-l-lime-400",
}

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(t)
  }, [value, delay])
  return debounced
}

function DirectoryContent() {
  const searchParams = useSearchParams()
  const initialType = searchParams.get("type") || "all"
  const initialQuery = searchParams.get("q") || ""

  const [searchQuery, setSearchQuery] = useState(initialQuery)
  const [activeType, setActiveType] = useState(initialType)
  const [currentPage, setCurrentPage] = useState(1)
  const [allContacts, setAllContacts] = useState<Contact[]>([])
  const [stats, setStats] = useState<Record<string, number>>({})
  const [isLoading, setIsLoading] = useState(true)
  const browseRef = useRef<HTMLDivElement>(null)

  const debouncedSearch = useDebounce(searchQuery, 300)

  useEffect(() => {
    async function loadData() {
      try {
        const [contactsRes, statsRes] = await Promise.all([
          fetch("/data/featured.json"),
          fetch("/data/stats.json"),
        ])
        const contacts = await contactsRes.json()
        const statsData = await statsRes.json()
        setAllContacts(contacts)
        setStats(statsData.byType || {})
      } catch {
        setAllContacts([])
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [])

  useEffect(() => {
    setCurrentPage(1)
  }, [debouncedSearch, activeType])

  const filteredContacts = useMemo(() => {
    return allContacts.filter((c) => {
      const q = debouncedSearch.toLowerCase()
      const matchSearch = !q || Object.values(c).some((v) => String(v).toLowerCase().includes(q))
      return matchSearch && (activeType === "all" || c.type === activeType)
    })
  }, [allContacts, debouncedSearch, activeType])

  const totalPages = Math.ceil(filteredContacts.length / ITEMS_PER_PAGE)
  const paginatedContacts = filteredContacts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  return (
    <div className="min-h-screen bg-navy-500 pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-10">
          <div>
            <h1 className="text-3xl lg:text-4xl font-heading font-bold text-white">
              {activeType === "all"
                ? "Browse All Contacts"
                : DIRECTORY_TYPES.find((d) => d.type === activeType)?.label || "Resources"}
            </h1>
            <p className="text-sm mt-1 text-warm-400">
              {isLoading ? "Loading..." : `${filteredContacts.length.toLocaleString()} results`}
            </p>
          </div>
          <Link href="/categories">
            <button className="h-10 px-4 rounded-xl text-sm font-semibold border border-warm-700/30 text-warm-400 hover:text-white hover:border-brand-500/30 transition-all flex items-center gap-1.5">
              All Categories
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </Link>
        </div>

        <div ref={browseRef} className="sticky z-30 top-20 pb-6 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 bg-navy-500/95 backdrop-blur-md border-b border-warm-700/20">
          <div className="flex items-center gap-2 overflow-x-auto pb-3 hide-scrollbar">
            {DIRECTORY_TYPES.map((cat) => {
              const count = cat.type !== "all" ? stats[cat.type] : Object.values(stats).reduce((a, b) => a + b, 0)
              return (
                <button
                  key={cat.type}
                  onClick={() => setActiveType(cat.type)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap border transition-all shrink-0 ${
                    activeType === cat.type
                      ? "bg-brand-500 text-navy-900 border-brand-500"
                      : "border-warm-700/30 text-warm-400 hover:text-white hover:border-brand-500/30"
                  }`}
                >
                  <cat.icon className="h-3.5 w-3.5" />
                  {cat.label}
                  {count != null && count > 0 && (
                    <span className="text-[10px] font-bold tabular-nums opacity-60">
                      {count.toLocaleString()}
                    </span>
                  )}
                </button>
              )
            })}
          </div>

          <div className="relative search-glow rounded-xl mt-3">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-warm-500" />
            <input
              type="text"
              placeholder={`Search ${
                activeType === "all" ? "all contacts" : DIRECTORY_TYPES.find((d) => d.type === activeType)?.label?.toLowerCase() || ""
              }...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-11 pl-11 pr-10 text-sm rounded-xl border border-warm-700/30 bg-navy-400/50 text-white placeholder:text-warm-500 outline-none transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-warm-500 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pt-6">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="h-52 rounded-2xl animate-pulse bg-navy-400/50" />
            ))}
          </div>
        ) : paginatedContacts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pt-6">
            {paginatedContacts.map((contact, idx) => {
              const TypeIcon = ICON_MAP[contact.type] || Globe
              const borderColor = TYPE_COLORS[contact.type] || "border-l-brand-500"
              return (
                <div
                  key={contact.id || idx}
                  className={`listing-card rounded-2xl p-5 border-l-2 ${borderColor} flex flex-col`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-sm text-white truncate">{contact.name}</h3>
                      {contact.location && (
                        <div className="flex items-center gap-1 mt-1 text-xs text-warm-400">
                          <MapPin className="h-3 w-3 shrink-0" />
                          <span className="truncate">{contact.location}</span>
                        </div>
                      )}
                    </div>
                    <span className="shrink-0 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border border-warm-700/30 text-warm-400 ml-2">
                      {contact.type?.replace(/_/g, " ") || "contact"}
                    </span>
                  </div>
                  {contact.description && (
                    <p className="text-xs text-warm-400 line-clamp-2 mb-3 leading-relaxed flex-1">
                      {contact.description}
                    </p>
                  )}
                  <div className="flex items-center gap-2 mt-auto pt-3 border-t border-warm-700/30">
                    {contact.website && (
                      <a
                        href={contact.website.startsWith("http") ? contact.website : `https://${contact.website}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-xs font-semibold text-brand-500 hover:text-brand-400"
                      >
                        <Globe className="h-3 w-3" /> Visit
                      </a>
                    )}
                    {contact.email && (
                      <a
                        href={`mailto:${contact.email}`}
                        className="flex items-center gap-1 text-xs font-semibold text-warm-400 hover:text-white ml-auto"
                      >
                        <Mail className="h-3 w-3" /> Email
                      </a>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-20">
            <Search className="h-12 w-12 text-warm-500 mx-auto mb-4 opacity-30" />
            <p className="text-warm-400">No results found. Try a different search or filter.</p>
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-10">
            {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
              const page = i + 1
              return (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`h-10 w-10 rounded-lg text-sm font-bold transition-all ${
                    page === currentPage
                      ? "bg-brand-500 text-navy-900"
                      : "border border-warm-700/30 text-warm-400 hover:text-white hover:border-brand-500/30"
                  }`}
                >
                  {page}
                </button>
              )
            })}
            {totalPages > 7 && <span className="text-warm-500 px-2">...</span>}
          </div>
        )}
      </div>
    </div>
  )
}

export default function DirectoryPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-navy-500 pt-24 pb-20" />}>
      <DirectoryContent />
    </Suspense>
  )
}
