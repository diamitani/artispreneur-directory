"use client"

import { useState, useEffect, useRef, Suspense, useCallback } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import {
  Search, Music, ChevronLeft, ChevronRight, X, Loader2, Filter,
} from "lucide-react"
import Link from "next/link"
import { fetchPlaylists } from "@/lib/api"
import { useAuth } from "@/lib/AuthProvider"
import type { Contact } from "@/lib/api"
import { PlaylistCard } from "@/components/PlaylistCard"

const GENRES = [
  "POP", "R&B", "EDM", "HIP HOP", "RAP", "ROCK", "INDIE",
  "CHRISTIAN", "GOSPEL", "METAL", "FOLK", "JAZZ", "BLUES",
  "COUNTRY", "ALTERNATIVE", "ELECTRONIC", "LATIN", "REGGAE",
  "SOUL", "FUNK", "PUNK", "AMBIENT", "CLASSICAL", "REGGAETON",
]

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(t)
  }, [value, delay])
  return debounced
}

function PlaylistsContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useAuth()

  const initialGenre = searchParams.get("genre") || ""
  const initialQuery = searchParams.get("q") || ""

  const [searchQuery, setSearchQuery] = useState(initialQuery)
  const [activeGenre, setActiveGenre] = useState(initialGenre)
  const [playlists, setPlaylists] = useState<Contact[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [nextCursor, setNextCursor] = useState<string | null>(null)
  const [prevCursors, setPrevCursors] = useState<(string | null)[]>([null])
  const [pageIndex, setPageIndex] = useState(0)
  const [showGenrePicker, setShowGenrePicker] = useState(false)
  const browseRef = useRef<HTMLDivElement>(null)

  const debouncedSearch = useDebounce(searchQuery, 400)

  const loadPage = useCallback(async (cursor: string | null = null) => {
    setIsLoading(true)
    try {
      const result = await fetchPlaylists({
        genre: activeGenre || undefined,
        q: debouncedSearch || undefined,
        cursor,
      })
      setPlaylists(result.items)
      setNextCursor(result.nextCursor)
    } catch {
      setPlaylists([])
    } finally {
      setIsLoading(false)
    }
  }, [activeGenre, debouncedSearch])

  useEffect(() => {
    setPrevCursors([null])
    setPageIndex(0)
    loadPage(null)
  }, [activeGenre, debouncedSearch])

  useEffect(() => {
    const params = new URLSearchParams()
    if (activeGenre) params.set("genre", activeGenre)
    if (debouncedSearch) params.set("q", debouncedSearch)
    router.replace(`/playlists?${params.toString()}`, { scroll: false })
  }, [activeGenre, debouncedSearch, router])

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
    <div className="min-h-screen bg-[#F9F6EF] pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-10">
          <div>
            <h1 className="text-3xl lg:text-4xl font-heading font-bold text-[#1A1A1A] flex items-center gap-3">
              <Music className="h-8 w-8 text-emerald-500" />
              Spotify Playlists
            </h1>
            <p className="text-sm mt-1 text-[#4A4A4A]">
              {isLoading ? "Loading..." : "Verified playlist curator contacts for indie artists"}
              {debouncedSearch && ` matching "${debouncedSearch}"`}
              {activeGenre && ` in ${activeGenre}`}
            </p>
          </div>
          <Link href="/directory">
            <button className="h-10 px-4 rounded-xl text-sm font-semibold border border-warm-700/30 text-[#4A4A4A] hover:text-[#1A1A1A] hover:border-brand-500/30 transition-all">
              ← All Contacts
            </button>
          </Link>
        </div>

        {/* Sticky filters */}
        <div
          ref={browseRef}
          className="sticky z-30 top-20 pb-6 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 bg-[#F9F6EF]/95 backdrop-blur-md border-b border-warm-700/20"
        >
          {/* Search + Genre toggle */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1 search-glow rounded-xl">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8a8070]" />
              <input
                type="text"
                placeholder="Search by playlist name, curator, or genre..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-11 pl-11 pr-10 text-sm rounded-xl border border-warm-700/30 bg-navy-400/50 text-[#1A1A1A] placeholder:text-[#8a8070] outline-none transition-colors"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8a8070] hover:text-[#1A1A1A]">
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <button
              onClick={() => setShowGenrePicker(!showGenrePicker)}
              className={`h-11 px-4 rounded-xl text-sm font-semibold border transition-all flex items-center gap-1.5 shrink-0 ${
                activeGenre
                  ? "bg-emerald-500 text-white border-emerald-500"
                  : "border-warm-700/30 text-[#4A4A4A] hover:text-[#1A1A1A]"
              }`}
            >
              <Filter className="h-4 w-4" />
              Genre {activeGenre && `: ${activeGenre}`}
            </button>
          </div>

          {/* Genre picker */}
          {showGenrePicker && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              <button
                onClick={() => { setActiveGenre(""); setShowGenrePicker(false) }}
                className={`px-3 py-1 rounded-full text-[10px] font-bold border transition-all ${
                  !activeGenre
                    ? "bg-[#1A1A1A] text-white border-[#1A1A1A]"
                    : "border-warm-700/30 text-[#4A4A4A] hover:text-[#1A1A1A]"
                }`}
              >
                All Genres
              </button>
              {GENRES.map((g) => (
                <button
                  key={g}
                  onClick={() => { setActiveGenre(g); setShowGenrePicker(false) }}
                  className={`px-3 py-1 rounded-full text-[10px] font-bold border transition-all ${
                    activeGenre === g
                      ? "bg-emerald-500 text-white border-emerald-500"
                      : "border-warm-700/30 text-[#4A4A4A] hover:text-[#1A1A1A]"
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Cards */}
        {isLoading ? (
          <div className="flex items-center justify-center py-32">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
          </div>
        ) : playlists.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pt-6">
            {playlists.map((playlist, idx) => (
              <PlaylistCard key={playlist.id || idx} contact={playlist} idx={idx} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <Music className="h-12 w-12 text-[#8a8070] mx-auto mb-4 opacity-30" />
            <p className="text-[#4A4A4A]">No playlists found. Try a different search or genre.</p>
          </div>
        )}

        {/* Pagination */}
        {!isLoading && playlists.length > 0 && (
          <div className="flex items-center justify-center gap-4 mt-10">
            <button
              onClick={goPrev}
              disabled={pageIndex === 0}
              className="flex items-center gap-2 h-10 px-5 rounded-xl border border-warm-700/30 text-[#4A4A4A] hover:text-[#1A1A1A] hover:border-brand-500/30 disabled:opacity-30 transition-all text-sm font-medium"
            >
              <ChevronLeft className="h-4 w-4" /> Previous
            </button>
            <span className="text-xs text-[#8a8070] font-mono">Page {pageIndex + 1}</span>
            <button
              onClick={goNext}
              disabled={!nextCursor}
              className="flex items-center gap-2 h-10 px-5 rounded-xl border border-warm-700/30 text-[#4A4A4A] hover:text-[#1A1A1A] hover:border-brand-500/30 disabled:opacity-30 transition-all text-sm font-medium"
            >
              Next <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* CTA */}
        {!user && playlists.length > 0 && (
          <div className="mt-16 text-center listing-card rounded-2xl p-10 max-w-2xl mx-auto">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-5">
              <Music className="w-6 h-6 text-emerald-500" />
            </div>
            <h3 className="text-2xl font-heading font-bold text-[#1A1A1A] mb-3">
              Unlock All Playlist Contacts
            </h3>
            <p className="text-[#4A4A4A] text-sm mb-6 max-w-md mx-auto">
              Get full curator emails, verification status, and direct contact links for every playlist.
            </p>
            <Link href="/signup" className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#C0272D] text-white font-bold text-sm hover:bg-brand-400 transition-all">
              Create Free Account
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

export default function PlaylistsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F9F6EF] pt-24 pb-20 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-emerald-500" /></div>}>
      <PlaylistsContent />
    </Suspense>
  )
}
