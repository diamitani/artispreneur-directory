"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { MapPin, ArrowRight, Radio, Building, Music, Globe } from "lucide-react"
import { motion } from "framer-motion"

interface TypeStat {
  type: string
  count: number
}

const TYPE_LABELS: Record<string, string> = {
  radio: "Radio Stations",
  venue: "Live Venues",
  blog: "Music Blogs",
  playlist: "Playlists",
  podcast: "Podcasts",
  record_label: "Record Labels",
  magazine: "Magazines",
  press: "Press & PR",
  newspaper: "Newspapers",
  distributor: "Distributors",
  publisher: "Publishers",
  licensing_library: "Sync Libraries",
}

const TYPE_ICONS: Record<string, React.ElementType> = {
  radio: Radio,
  venue: Building,
  playlist: Music,
  blog: Globe,
}

export default function StatsExplorer() {
  const [typeStats, setTypeStats] = useState<TypeStat[]>([])
  const [totalContacts, setTotalContacts] = useState(78000)

  useEffect(() => {
    fetch("https://xz63nlwl0l.execute-api.us-east-1.amazonaws.com/prod/stats")
      .then((r) => r.json())
      .then((d) => {
        if (d.byType) {
          const list = Object.entries(d.byType)
            .map(([type, count]) => ({
              type,
              count: count as number,
            }))
            .sort((a, b) => b.count - a.count)
          setTypeStats(list)
        }
        if (d.totalContacts) {
          setTotalContacts(d.totalContacts)
        }
      })
      .catch(() => {})
  }, [])

  if (typeStats.length === 0) return null

  return (
    <section className="py-20 sm:py-28 bg-navy-600/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
          <div>
            <div className="eyebrow mb-4 flex items-center gap-2">
              <div className="h-px w-6 bg-brand-500" />
              EXPLORE BY TYPE
            </div>
            <h2 className="text-3xl sm:text-4xl font-heading font-bold text-white">
              Music Industry <span className="text-brand-500">Contacts</span>
            </h2>
          </div>
          <Link
            href="/directory"
            className="inline-flex items-center gap-1.5 text-brand-500 font-medium hover:text-brand-400 transition-colors"
          >
            Browse all contacts <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {typeStats.slice(0, 12).map((st, i) => {
            const Icon = TYPE_ICONS[st.type] || Globe
            return (
              <motion.div
                key={st.type}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.04, duration: 0.3 }}
              >
                <Link
                  href={`/directory?type=${st.type}`}
                  className="flex items-center justify-between p-4 rounded-xl listing-card transition-all group"
                >
                  <div className="flex-1 min-w-0">
                    <div className="font-heading font-semibold text-white text-sm flex items-center gap-1.5">
                      <Icon className="w-3.5 h-3.5 text-brand-500 shrink-0" />
                      <span className="truncate">{TYPE_LABELS[st.type] || st.type}</span>
                    </div>
                  </div>
                  <div className="text-right ml-2">
                    <div className="text-lg font-bold text-brand-500">{st.count.toLocaleString()}</div>
                  </div>
                </Link>
              </motion.div>
            )
          })}
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-warm-500">
            {totalContacts.toLocaleString()} verified music industry contacts across {typeStats.length} categories.
            <br />
            <span className="text-xs text-warm-600">Data verified and updated daily.</span>
          </p>
        </div>
      </div>
    </section>
  )
}
