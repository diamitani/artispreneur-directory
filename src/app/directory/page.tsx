"use client"

import { useState, useEffect, useRef, Suspense, useCallback } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import {
  Search, MapPin, Globe, Music, Radio, Building, Podcast, BookOpen,
  Star, Users, Newspaper, Truck, Book, Library, X, ArrowRight, Mail,
  ChevronLeft, ChevronRight, Lock, Loader2,
} from "lucide-react"
import Link from "next/link"
import { fetchContacts, fetchStats, type Contact } from "@/lib/api"
import { useAuth } from "@/lib/AuthProvider"

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
  radio: Radio, blog: Globe, playlist: Music, podcast: Podcast,
  magazine: BookOpen, reviewer: Star, newspaper: Newspaper,
  press: Users, venue: Building, record_label: Star,
  distributor: Truck, publisher: Book, licensing_library: Library,
}

const TYPE_COLORS: Record<string, string> = {
  radio: "border-l-blue-400", blog: "border-l-violet-400",
  venue: "border-l-pink-400", playlist: "border-l-emerald-400",
  podcast: "border-l-teal-400", record_label: "border-l-brand-500",
  magazine: "border-l-amber-400", press: "border-l-cyan-400",
  newspaper: "border-l-indigo-400", distributor: "border-l-orange-400",
  publisher: "border-l-green-400", licensing_library: "border-l-lime-400",
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
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useAuth()

  const initialType = searchParams.get("type") || "all"
  const initialQuery = searchParams.get("q") || ""

  const [searchQuery, setSearchQuery] = useState(initialQuery)
  const [activeType, setActiveType] = useState(initialType)
  const [contacts, setContacts] = useState<Contact[]>([])
  const [typeCounts, setTypeCounts] = useState<Record<string, number>>({})
  const [totalContacts, setTotalContacts] = useState(78000)
  const [isLoading, setIsLoading] = useState(true)
  const [nextCursor, setNextCursor] = useState<string | null>(null)
  const [prevCursors, setPrevCursors] = useState<(string | null)[]>([null])
  const [pageIndex, setPageIndex] = useState(0)
  const browseRef = useRef<HTMLDivElement>(null)

  const debouncedSearch = useDebounce(searchQuery, 400)
  const typeLabel = DIRECTORY_TYPES.find((d) => d.type === activeType)?.label || "Resources"

  // Load stats once
  useEffect(() => {
    fetchStats().then((s) => {
      setTypeCounts(s.byType)
      setTotalContacts(s.totalContacts)
    })
  }, [])

  // Load contacts when filter/search changes
  const loadPage = useCallback(async (cursor: string | null = null) => {
    setIsLoading(true)
    try {
      const result = await fetchContacts({
        type: activeType,
        q: debouncedSearch,
        cursor,
      })
      setContacts(result.items)
      setNextCursor(result.nextCursor)
    } catch {
      setContacts([])
    } finally {
      setIsLoading(false)
    }
  }, [activeType, debouncedSearch])

  // Reset to page 1 on filter/search change
  useEffect(() => {
    setPrevCursors([null])
    setPageIndex(0)
    loadPage(null)
  }, [activeType, debouncedSearch])

  // Sync URL
  useEffect(() => {
    const params = new URLSearchParams()
    if (activeType !== "all") params.set("type", activeType)
    if (debouncedSearch) params.set("q", debouncedSearch)
    router.replace(`/directory?${params.toString()}`, { scroll: false })
  }, [activeType, debouncedSearch, router])

  function goNext() {
    if (!nextCursor) return
    const newPrev = [...prevCursors, nextCursor]
    setPrevCursors(newPrev)
    setPageIndex(pageIndex + 1)
    loadPage(nextCursor)
    browseRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  function goPrev() {
    if (pageIndex === 0) return
    const newPrev = prevCursors.slice(0, -1)
    const cursor = newPrev[newPrev.length - 1] ?? null
    setPrevCursors(newPrev)
    setPageIndex(pageIndex - 1)
    loadPage(cursor)
    browseRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  return (
    <div className="min-h-screen bg-navy-500 pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-10">
          <div>
            <h1 className="text-3xl lg:text-4xl font-heading font-bold text-white">
              {activeType === "all" ? "Browse All Contacts" : typeLabel}
            </h1>
            <p className="text-sm mt-1 text-warm-400">
              {isLoading ? "Loading..." : `${totalContacts.toLocaleString()}+ verified contacts`}
              {debouncedSearch && ` matching "${debouncedSearch}"`}
            </p>
          </div>
          <Link href="/categories">
            <button className="h-10 px-4 rounded-xl text-sm font-semibold border border-warm-700/30 text-warm-400 hover:text-white hover:border-brand-500/30 transition-all flex items-center gap-1.5">
              All Categories <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </Link>
        </div>

        {/* Sticky filters */}
        <div
          ref={browseRef}
          className="sticky z-30 top-20 pb-6 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 bg-navy-500/95 backdrop-blur-md border-b border-warm-700/20"
        >
          <div className="flex items-center gap-2 overflow-x-auto pb-3 hide-scrollbar">
            {DIRECTORY_TYPES.map((cat) => {
              const count = cat.type === "all"
                ? Object.values(typeCounts).reduce((a, b) => a + b, 0)
                : typeCounts[cat.type]
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
                    <span className="text-[10px] font-bold tabular-nums opacity-60">{count.toLocaleString()}</span>
                  )}
                </button>
              )
            })}
          </div>

          <div className="relative search-glow rounded-xl mt-3">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-warm-500" />
            <input
              type="text"
              placeholder={`Search ${activeType === "all" ? "all contacts" : typeLabel.toLowerCase()}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-11 pl-11 pr-10 text-sm rounded-xl border border-warm-700/30 bg-navy-400/50 text-white placeholder:text-warm-500 outline-none transition-colors"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-warm-500 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Cards */}
        {isLoading ? (
          <div className="flex items-center justify-center py-32">
            <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
          </div>
        ) : contacts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pt-6">
            {contacts.map((contact, idx) => {
              const TypeIcon = ICON_MAP[contact.type] || Globe
              const borderColor = TYPE_COLORS[contact.type] || "border-l-brand-500"
              const isBlurred = !user && idx >= 6

              return (
                <div
                  key={contact.id || idx}
                  className={`listing-card rounded-2xl p-5 border-l-2 ${borderColor} flex flex-col relative overflow-hidden`}
                >
                  {isBlurred && (
                    <div className="absolute inset-0 backdrop-blur-sm bg-navy-500/60 z-10 flex flex-col items-center justify-center gap-3 rounded-2xl">
                      <Lock className="w-6 h-6 text-brand-500" />
                      <p className="text-xs text-warm-400 text-center px-4">
                        <Link href="/signup" className="text-brand-500 font-semibold hover:text-brand-400">Create free account</Link>
                        {" "}to unlock all contacts
                      </p>
                    </div>
                  )}
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
                  {contact.genre && (
                    <div className="mb-2">
                      <span className="text-[10px] font-semibold text-brand-500 bg-brand-500/10 px-2 py-0.5 rounded-full border border-brand-500/20">
                        {contact.genre}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 mt-auto pt-3 border-t border-warm-700/30">
                    {contact.website && (
                      <a href={contact.website.startsWith("http") ? contact.website : `https://${contact.website}`}
                        target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1 text-xs font-semibold text-brand-500 hover:text-brand-400">
                        <Globe className="h-3 w-3" /> Visit
                      </a>
                    )}
                    {contact.email && user ? (
                      <a href={`mailto:${contact.email}`} className="flex items-center gap-1 text-xs font-semibold text-warm-400 hover:text-white ml-auto">
                        <Mail className="h-3 w-3" /> Email
                      </a>
                    ) : contact.email && (
                      <span className="flex items-center gap-1 text-xs text-warm-600 ml-auto">
                        <Lock className="h-3 w-3" /> Email
                      </span>
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

        {/* Cursor-based Pagination */}
        {!isLoading && contacts.length > 0 && (
          <div className="flex items-center justify-center gap-4 mt-10">
            <button
              onClick={goPrev}
              disabled={pageIndex === 0}
              className="flex items-center gap-2 h-10 px-5 rounded-xl border border-warm-700/30 text-warm-400 hover:text-white hover:border-brand-500/30 disabled:opacity-30 transition-all text-sm font-medium"
            >
              <ChevronLeft className="h-4 w-4" /> Previous
            </button>
            <span className="text-xs text-warm-500 font-mono">
              Page {pageIndex + 1}
            </span>
            <button
              onClick={goNext}
              disabled={!nextCursor}
              className="flex items-center gap-2 h-10 px-5 rounded-xl border border-warm-700/30 text-warm-400 hover:text-white hover:border-brand-500/30 disabled:opacity-30 transition-all text-sm font-medium"
            >
              Next <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Sign-up CTA for guests */}
        {!user && contacts.length > 0 && (
          <div className="mt-16 text-center listing-card rounded-2xl p-10 max-w-2xl mx-auto">
            <div className="w-14 h-14 rounded-2xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center mx-auto mb-5">
              <Lock className="w-6 h-6 text-brand-500" />
            </div>
            <h3 className="text-2xl font-heading font-bold text-white mb-3">
              Unlock All {totalContacts.toLocaleString()}+ Contacts
            </h3>
            <p className="text-warm-400 text-sm mb-6 max-w-md mx-auto">
              Create a free account to access full contact details, emails, websites, and filter across all 78,000+ music industry contacts.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/signup" className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-brand-500 text-navy-900 font-bold text-sm hover:bg-brand-400 transition-all">
                Create Free Account <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/login" className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-warm-700/30 text-warm-300 font-semibold text-sm hover:border-brand-500/30 hover:text-white transition-all">
                Sign In
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function DirectoryPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-navy-500 pt-24 pb-20 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-brand-500" /></div>}>
      <DirectoryContent />
    </Suspense>
  )
}
