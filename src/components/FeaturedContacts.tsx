"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowRight, MapPin, Globe, Mail, Radio, Building, Music, Podcast, BookOpen, Star, Lock } from "lucide-react"
import { motion } from "framer-motion"
import { fetchContacts } from "@/lib/api"

interface Contact {
  id: string
  name: string
  type: string
  location?: string
  description?: string
  website?: string
  email?: string
}

const ICON_MAP: Record<string, React.ElementType> = {
  radio: Radio, blog: Globe, venue: Building, playlist: Music,
  podcast: Podcast, magazine: BookOpen, record_label: Star, press: Globe,
}

const TYPE_COLORS: Record<string, string> = {
  radio: "bg-blue-50 border-blue-200 text-blue-700",
  blog: "bg-violet-50 border-violet-200 text-violet-700",
  venue: "bg-rose-50 border-rose-200 text-rose-700",
  playlist: "bg-emerald-50 border-emerald-200 text-emerald-700",
  podcast: "bg-teal-50 border-teal-200 text-teal-700",
  record_label: "bg-[#FFF8D6] border-[#F5C100]/40 text-[#B8910A]",
  magazine: "bg-amber-50 border-amber-200 text-amber-700",
  press: "bg-cyan-50 border-cyan-200 text-cyan-700",
}

const LEFT_ACCENTS: Record<string, string> = {
  radio: "border-l-blue-400",
  blog: "border-l-violet-400",
  venue: "border-l-rose-500",
  playlist: "border-l-emerald-500",
  podcast: "border-l-teal-400",
  record_label: "border-l-[#F5C100]",
  magazine: "border-l-amber-400",
  press: "border-l-cyan-400",
}

const FALLBACK: Contact[] = [
  { id: "1", name: "KEXP 90.3 FM", type: "radio", location: "Seattle, WA", description: "Independent music radio station known for discovering new artists" },
  { id: "2", name: "Pitchfork", type: "blog", location: "New York, NY", description: "Leading online music publication and tastemaker" },
  { id: "3", name: "The Bowery Ballroom", type: "venue", location: "New York, NY", description: "Iconic NYC live music venue for indie and rock" },
  { id: "4", name: "Spotify Fresh Finds", type: "playlist", location: "Global", description: "Curated playlist featuring emerging independent artists" },
  { id: "5", name: "Song Exploder", type: "podcast", location: "Los Angeles, CA", description: "Artists break down how they made their songs" },
  { id: "6", name: "Sub Pop Records", type: "record_label", location: "Seattle, WA", description: "Legendary indie label behind Nirvana, Fleet Foxes" },
]

export default function FeaturedContacts() {
  const [contacts, setContacts] = useState<Contact[]>([])

  useEffect(() => {
    fetchContacts({ type: "all" })
      .then((d) => {
        const items = d.items || []
        setContacts(items.length >= 6 ? items.slice(0, 6) : FALLBACK)
      })
      .catch(() => setContacts(FALLBACK))
  }, [])

  if (contacts.length === 0) return null

  return (
    <section className="py-20 sm:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
          <div>
            <div className="eyebrow mb-4 flex items-center gap-2">
              <div className="h-px w-6 bg-[#C0272D]" />
              FEATURED CONTACTS
            </div>
            <h2 className="text-3xl sm:text-4xl font-heading font-bold text-[#1A1A1A]">
              Top Industry <span className="text-[#C0272D]">Resources</span>
            </h2>
          </div>
          <Link
            href="/directory"
            className="inline-flex items-center gap-1.5 text-[#C0272D] font-bold hover:text-[#A12024] transition-colors shrink-0 text-sm"
          >
            View all contacts <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {contacts.map((contact, i) => {
            const TypeIcon = ICON_MAP[contact.type] || Globe
            const leftColor = LEFT_ACCENTS[contact.type] || "border-l-[#C0272D]"
            const badgeColor = TYPE_COLORS[contact.type] || "bg-[#F5E5E6] border-[#C0272D]/20 text-[#C0272D]"
            return (
              <motion.div
                key={contact.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.5 }}
              >
                <div className={`listing-card rounded-2xl p-5 border-l-4 ${leftColor} flex flex-col h-full`}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-sm text-[#1A1A1A] truncate">{contact.name}</h3>
                      {contact.location && (
                        <div className="flex items-center gap-1 mt-1 text-xs text-[#8a8070]">
                          <MapPin className="h-3 w-3 shrink-0" />
                          <span className="truncate">{contact.location}</span>
                        </div>
                      )}
                    </div>
                    <span className={`shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ml-2 ${badgeColor}`}>
                      {contact.type?.replace(/_/g, " ") || "contact"}
                    </span>
                  </div>
                  {contact.description && (
                    <p className="text-xs text-[#4A4A4A] line-clamp-2 mb-3 leading-relaxed flex-1">
                      {contact.description}
                    </p>
                  )}
                  <div className="flex items-center gap-2 mt-auto pt-3 border-t border-[#E8E3D9]">
                    {contact.website && (
                      <a
                        href={contact.website.startsWith("http") ? contact.website : `https://${contact.website}`}
                        target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1 text-xs font-bold text-[#C0272D] hover:text-[#A12024]"
                      >
                        <Globe className="h-3 w-3" /> Visit
                      </a>
                    )}
                    <Link
                      href={`/directory`}
                      className="flex items-center gap-1 text-xs font-semibold text-[#8a8070] hover:text-[#1A1A1A] ml-auto"
                    >
                      View More <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
