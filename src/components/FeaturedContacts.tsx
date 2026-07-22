"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowRight, MapPin, Globe, Mail, Radio, Building, Music, Podcast, BookOpen, Star } from "lucide-react"
import { motion } from "framer-motion"

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
  radio: Radio,
  blog: Globe,
  venue: Building,
  playlist: Music,
  podcast: Podcast,
  magazine: BookOpen,
  record_label: Star,
  press: Globe,
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
}

export default function FeaturedContacts() {
  const [contacts, setContacts] = useState<Contact[]>([])

  useEffect(() => {
    fetch("/data/featured.json")
      .then((r) => r.json())
      .then((d) => setContacts(d.slice(0, 6)))
      .catch(() => {
        setContacts([
          { id: "1", name: "KEXP 90.3 FM", type: "radio", location: "Seattle, WA", description: "Independent music radio station known for discovering new artists" },
          { id: "2", name: "Pitchfork", type: "blog", location: "New York, NY", description: "Leading online music publication and tastemaker" },
          { id: "3", name: "The Bowery Ballroom", type: "venue", location: "New York, NY", description: "Iconic NYC live music venue for indie and rock" },
          { id: "4", name: "Spotify Fresh Finds", type: "playlist", location: "Global", description: "Curated playlist featuring emerging independent artists" },
          { id: "5", name: "Song Exploder", type: "podcast", location: "Los Angeles, CA", description: "Artists break down how they made their songs" },
          { id: "6", name: "Sub Pop Records", type: "record_label", location: "Seattle, WA", description: "Legendary indie label behind Nirvana, Fleet Foxes" },
        ])
      })
  }, [])

  if (contacts.length === 0) return null

  return (
    <section className="py-20 sm:py-28 bg-navy-600/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
          <div>
            <div className="eyebrow mb-4 flex items-center gap-2">
              <div className="h-px w-6 bg-brand-500" />
              FEATURED CONTACTS
            </div>
            <h2 className="text-3xl sm:text-4xl font-heading font-bold text-white">
              Top Industry <span className="text-brand-500">Resources</span>
            </h2>
          </div>
          <Link
            href="/directory"
            className="inline-flex items-center gap-1.5 text-brand-500 font-medium hover:text-brand-400 transition-colors shrink-0"
          >
            View all contacts <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {contacts.map((contact, i) => {
            const TypeIcon = ICON_MAP[contact.type] || Globe
            const borderColor = TYPE_COLORS[contact.type] || "border-l-brand-500"
            return (
              <motion.div
                key={contact.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
              >
                <div className={`listing-card rounded-2xl p-5 border-l-2 ${borderColor} flex flex-col h-full`}>
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
                    <Link
                      href={`/directory/${contact.id}`}
                      className="flex items-center gap-1 text-xs font-semibold text-warm-400 hover:text-white ml-auto"
                    >
                      View Details <ArrowRight className="h-3 w-3" />
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
