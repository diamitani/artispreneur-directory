"use client"

import { motion } from "framer-motion"
import { Search, Database, Target, Globe, Music, CheckCircle } from "lucide-react"

const features = [
  {
    icon: Search,
    title: "Smart Search & Filters",
    description: "Find exactly what you need with powerful filters for type, category, location, and keyword search across 78K+ contacts.",
  },
  {
    icon: Database,
    title: "Verified Database",
    description: "Every contact is verified. Real emails, accurate locations, and up-to-date information for radio stations, venues, blogs, and more.",
  },
  {
    icon: Target,
    title: "Built for Outreach",
    description: "Find radio stations to pitch, blogs to submit to, venues to book, and playlists to land on — all in one place.",
  },
  {
    icon: Globe,
    title: "Nationwide Coverage",
    description: "From New York to Los Angeles, Austin to Atlanta — find music industry contacts in every US state and 160+ countries.",
  },
  {
    icon: Music,
    title: "Every Resource Type",
    description: "Radio stations, Spotify playlists, music blogs, live venues, podcasts, magazines, record labels, and more — all categorized.",
  },
  {
    icon: CheckCircle,
    title: "Free to Start",
    description: "Access thousands of contacts for free. Upgrade to Pro for CRM tools, bulk export, email tracking, and priority support.",
  },
]

export default function FeaturesBanner() {
  return (
    <section className="py-20 sm:py-28 bg-navy-600/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="eyebrow mb-4 flex items-center justify-center gap-2">
            <div className="h-px w-6 bg-brand-500" />
            WHY ARTISPRENEUR
            <div className="h-px w-6 bg-brand-500" />
          </div>
          <h2 className="text-3xl sm:text-4xl font-heading font-bold text-white mb-4">
            Everything You Need to <span className="text-brand-500">Grow</span>
          </h2>
          <p className="text-warm-400 text-lg leading-relaxed">
            The most comprehensive music industry database — built for artists who treat music like a business.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.4 }}
              className="listing-card p-6 rounded-2xl group"
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"
                style={{ background: "oklch(0.72 0.19 85 / 0.1)", border: "1px solid oklch(0.72 0.19 85 / 0.15)" }}
              >
                <feature.icon className="w-6 h-6 text-brand-500" />
              </div>
              <h3 className="text-lg font-heading font-semibold text-white mb-2 group-hover:text-brand-400 transition-colors">
                {feature.title}
              </h3>
              <p className="text-sm text-warm-400 leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
