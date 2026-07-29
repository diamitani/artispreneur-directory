"use client"

import {
  Music, MapPin, Users, Shield, ShieldAlert,
  Mail, Globe, Music2, Disc3, AlertCircle,
  ExternalLink, AtSign, Camera, Video,
} from "lucide-react"
import Link from "next/link"
import type { Contact } from "@/lib/api"
import { useAuth } from "@/lib/AuthProvider"

const VERDICT_STYLES: Record<string, { icon: typeof Shield; color: string; label: string }> = {
  mx_valid: { icon: Shield, color: "text-emerald-500", label: "Email Verified" },
  mx_invalid: { icon: ShieldAlert, color: "text-red-400", label: "Email Invalid" },
  unknown: { icon: AlertCircle, color: "text-amber-400", label: "Unverified" },
}

export function PlaylistCard({ contact, idx }: { contact: Contact; idx: number }) {
  const { user } = useAuth()
  const isBlurred = !user && idx >= 6

  const verdict = contact.verification_verdict || "unknown"
  const verdictStyle = VERDICT_STYLES[verdict] || VERDICT_STYLES.unknown
  const VerdictIcon = verdictStyle.icon

  const genres = contact.genre?.split(",").map(g => g.trim()).filter(Boolean) || []
  const followers = contact.followers ? parseInt(contact.followers).toLocaleString() : null
  const songCount = contact.song_count ? parseInt(contact.song_count).toLocaleString() : null

  return (
    <div className={`listing-card rounded-2xl p-5 border-l-2 border-l-emerald-400 flex flex-col relative overflow-hidden group ${
      isBlurred ? "pointer-events-none" : ""
    }`}>
      {/* Blur overlay for non-authenticated users */}
      {isBlurred && (
        <div className="absolute inset-0 backdrop-blur-sm bg-[#F9F6EF]/60 z-10 flex flex-col items-center justify-center gap-3 rounded-2xl">
          <Music className="w-6 h-6 text-[#C0272D]" />
          <p className="text-xs text-[#4A4A4A] text-center px-4">
            <Link href="/signup" className="text-[#C0272D] font-semibold hover:text-brand-400">
              Create free account
            </Link>
            {" "}to unlock playlist contacts
          </p>
        </div>
      )}

      {/* Header: Name + Verification */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-sm text-[#1A1A1A] truncate pr-2">
            {contact.name}
          </h3>
        </div>
        <div className="shrink-0 flex items-center gap-1" title={verdictStyle.label}>
          <VerdictIcon className={`h-3.5 w-3.5 ${verdictStyle.color}`} />
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#8a8070]">
            Playlist
          </span>
        </div>
      </div>

      {/* Curator */}
      {contact.curator_contact && (
        <p className="text-xs text-[#4A4A4A] mb-2">
          <span className="text-[#8a8070]">Curator:</span>{" "}
          <span className="font-medium">{contact.curator_contact}</span>
        </p>
      )}

      {/* Location */}
      {contact.location && (
        <div className="flex items-center gap-1 mb-2 text-xs text-[#4A4A4A]">
          <MapPin className="h-3 w-3 shrink-0" />
          <span className="truncate">{contact.location}</span>
        </div>
      )}

      {/* Stats row */}
      <div className="flex items-center gap-3 mb-3 text-xs text-[#4A4A4A]">
        {followers && (
          <div className="flex items-center gap-1" title="Followers">
            <Users className="h-3 w-3" />
            <span className="font-semibold tabular-nums">{followers}</span>
          </div>
        )}
        {songCount && (
          <div className="flex items-center gap-1" title="Songs">
            <Disc3 className="h-3 w-3" />
            <span className="font-semibold tabular-nums">{songCount}</span>
          </div>
        )}
      </div>

      {/* Genres */}
      {genres.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {genres.slice(0, 4).map((g) => (
            <span
              key={g}
              className="text-[10px] font-semibold text-[#C0272D] bg-[#C0272D]/10 px-2 py-0.5 rounded-full border border-brand-500/20"
            >
              {g.length > 20 ? g.slice(0, 20) + "…" : g}
            </span>
          ))}
          {genres.length > 4 && (
            <span className="text-[10px] text-[#8a8070] px-1">+{genres.length - 4}</span>
          )}
        </div>
      )}

      {/* Description */}
      {contact.description && (
        <p className="text-xs text-[#4A4A4A] line-clamp-2 mb-3 leading-relaxed flex-1">
          {contact.description}
        </p>
      )}

      {/* Action row: Social links + Playlist link */}
      <div className="flex items-center gap-1.5 mt-auto pt-3 border-t border-warm-700/30 flex-wrap">
        {/* Playlist link */}
        {contact.playlist_link && (
          <a
            href={contact.playlist_link.startsWith("http") ? contact.playlist_link : `https://open.spotify.com/playlist/${contact.playlist_link}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:text-emerald-500 px-1.5 py-0.5 rounded hover:bg-emerald-50 transition-colors"
          >
            <Music2 className="h-3 w-3" />
            Spotify
          </a>
        )}

        {/* Website */}
        {contact.website && (
          <a
            href={contact.website.startsWith("http") ? contact.website : `https://${contact.website}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs font-semibold text-[#4A4A4A] hover:text-[#1A1A1A] px-1.5 py-0.5 rounded hover:bg-warm-700/10 transition-colors"
          >
            <Globe className="h-3 w-3" />
            Web
          </a>
        )}

        {/* Instagram */}
        {contact.instagram && (
          <a
            href={contact.instagram.startsWith("http") ? contact.instagram : `https://instagram.com/${contact.instagram.replace("@", "")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs text-[#8a8070] hover:text-pink-500 px-1 py-0.5 rounded hover:bg-pink-50 transition-colors"
            title={contact.instagram}
          >
            <Camera className="h-3 w-3" />
          </a>
        )}

        {/* Twitter/X */}
        {contact.twitter && (
          <a
            href={contact.twitter.startsWith("http") ? contact.twitter : `https://x.com/${contact.twitter.replace("@", "")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs text-[#8a8070] hover:text-blue-400 px-1 py-0.5 rounded hover:bg-blue-50 transition-colors"
            title={contact.twitter}
          >
            <AtSign className="h-3 w-3" />
          </a>
        )}

        {/* Facebook */}
        {contact.facebook && (
          <a
            href={contact.facebook.startsWith("http") ? contact.facebook : `https://facebook.com/${contact.facebook}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs text-[#8a8070] hover:text-blue-600 px-1 py-0.5 rounded hover:bg-blue-50 transition-colors"
            title={contact.facebook}
          >
            <Users className="h-3 w-3" />
          </a>
        )}

        {/* YouTube */}
        {contact.youtube && (
          <a
            href={contact.youtube.startsWith("http") ? contact.youtube : `https://youtube.com/${contact.youtube.replace("@", "")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs text-[#8a8070] hover:text-red-500 px-1 py-0.5 rounded hover:bg-red-50 transition-colors"
            title={contact.youtube}
          >
            <Video className="h-3 w-3" />
          </a>
        )}

        {/* Email (authenticated users only) */}
        {contact.email && user && (
          <a
            href={`mailto:${contact.email}`}
            className="flex items-center gap-1 text-xs font-semibold text-[#C0272D] hover:text-brand-400 px-1.5 py-0.5 ml-auto"
            title={contact.email}
          >
            <Mail className="h-3 w-3" />
            Contact
          </a>
        )}

        {/* Source badge */}
        {contact.source_type === "web_discovered" && (
          <span className="text-[9px] text-[#8a8070] ml-auto italic">web discovered</span>
        )}
      </div>
    </div>
  )
}
