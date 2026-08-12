// AWS API client — replaces Supabase entirely
// All data lives in DynamoDB artispreneur-directory table
// Accessed via Lambda + API Gateway

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://xz63nlwl0l.execute-api.us-east-1.amazonaws.com/prod"

export interface Contact {
  id: string
  name: string
  type: string
  location?: string
  city?: string
  state?: string
  country?: string
  description?: string
  website?: string
  email?: string
  genre?: string
  format?: string
  platform?: string
  capacity?: string
  followers?: string
  // Playlist-specific fields
  curator_contact?: string
  playlist_link?: string
  song_count?: string
  facebook?: string
  twitter?: string
  instagram?: string
  youtube?: string
  // Email verification fields
  verification_verdict?: string
  verification_confidence?: string
  verification_detail?: string
  // Source tracking
  source_type?: string
  source_url?: string
  source_notes?: string
}

export interface ContactsResult {
  items: Contact[]
  count: number
  nextCursor: string | null
  hasMore: boolean
}

export interface StatsResult {
  totalContacts: number
  radioStations: number
  venues: number
  playlists: number
  byType: Record<string, number>
}

export async function fetchContacts({
  type = "all",
  genre,
  q = "",
  cursor,
}: {
  type?: string
  genre?: string
  q?: string
  cursor?: string | null
}): Promise<ContactsResult> {
  const params = new URLSearchParams()
  if (type && type !== "all") params.set("type", type)
  if (genre) params.set("genre", genre)
  if (q) params.set("q", q)
  if (cursor) params.set("cursor", cursor)

  const url = `${API_BASE}/contacts${params.toString() ? `?${params}` : ""}`

  try {
    const res = await fetch(url, {
      headers: { "Content-Type": "application/json" },
      next: { revalidate: 60 },
    })
    if (!res.ok) throw new Error(`API error: ${res.status}`)
    return await res.json()
  } catch (err) {
    console.error("fetchContacts error:", err)
    return { items: [], count: 0, nextCursor: null, hasMore: false }
  }
}

export async function fetchStats(): Promise<StatsResult> {
  try {
    const res = await fetch(`${API_BASE}/stats`, {
      next: { revalidate: 3600 },
    })
    if (!res.ok) throw new Error(`Stats API error: ${res.status}`)
    return await res.json()
  } catch {
    return {
      totalContacts: 72313,
      radioStations: 50000,
      venues: 6900,
      playlists: 260,
      byType: {
        radio: 50000, venue: 6900, blog: 4547, record_label: 4100,
        newspaper: 2641, resource: 1001, podcast: 999, distributor: 600,
        magazine: 466, publisher: 400, press: 299, playlist: 260,
        licensing_library: 100,
      },
    }
  }
}

export async function fetchPlaylists({
  genre,
  q = "",
  cursor,
}: {
  genre?: string
  q?: string
  cursor?: string | null
} = {}): Promise<ContactsResult> {
  return fetchContacts({ type: "playlist", genre, q, cursor })
}
