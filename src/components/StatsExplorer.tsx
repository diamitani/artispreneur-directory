"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowRight, Radio, Building, Music, Globe } from "lucide-react"
import { motion } from "framer-motion"
import { fetchStats } from "@/lib/api"

const TYPE_LABELS: Record<string, string> = {
  radio: "Radio Stations", venue: "Live Venues", blog: "Music Blogs",
  playlist: "Playlists", podcast: "Podcasts", record_label: "Record Labels",
  magazine: "Magazines", press: "Press & PR", newspaper: "Newspapers",
  distributor: "Distributors", publisher: "Publishers",
  licensing_library: "Sync Libraries", resource: "Artist Resources",
}

const TYPE_ICONS: Record<string, React.ElementType> = {
  radio: Radio, venue: Building, playlist: Music, blog: Globe,
}

export default function StatsExplorer() {
  const [typeStats, setTypeStats] = useState<{ type: string; count: number }[]>([])
  const [totalContacts, setTotalContacts] = useState(79000)

  useEffect(() => {
    fetchStats().then((d) => {
      if (d.byType) {
        setTypeStats(
          Object.entries(d.byType)
            .map(([type, count]) => ({ type, count: count as number }))
            .sort((a, b) => b.count - a.count)
        )
      }
      if (d.totalContacts) setTotalContacts(d.totalContacts)
    }).catch(() => {})
  }, [])

  if (typeStats.length === 0) return null

  return (
    <section className="py-20 sm:py-28 bg-white border-y border-[#E8E3D9]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
          <div>
            <div className="eyebrow mb-4 flex items-center gap-2">
              <div className="h-px w-6 bg-[#C0272D]" />
              EXPLORE BY TYPE
            </div>
            <h2 className="text-3xl sm:text-4xl font-heading font-bold text-[#1A1A1A]">
              Music Industry <span className="text-[#C0272D]">Contacts</span>
            </h2>
          </div>
          <Link href="/directory" className="inline-flex items-center gap-1.5 text-[#C0272D] font-bold hover:text-[#A12024] transition-colors text-sm">
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
                  className="listing-card flex flex-col p-4 rounded-xl transition-all group hover:border-[#C0272D]"
                >
                  <div className="flex items-center gap-1.5 mb-2">
                    <Icon className="w-3.5 h-3.5 text-[#C0272D] shrink-0" />
                    <span className="font-semibold text-[#1A1A1A] text-xs leading-tight truncate group-hover:text-[#C0272D] transition-colors">
                      {TYPE_LABELS[st.type] || st.type}
                    </span>
                  </div>
                  <div className="text-lg font-bold text-[#F5C100] font-heading">{st.count.toLocaleString()}</div>
                </Link>
              </motion.div>
            )
          })}
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-[#8a8070]">
            {totalContacts.toLocaleString()} verified music industry contacts across {typeStats.length} categories.{" "}
            <span className="text-xs text-[#D4CBBA]">Data verified and updated daily.</span>
          </p>
        </div>
      </div>
    </section>
  )
}
