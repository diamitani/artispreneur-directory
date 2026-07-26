"use client"

import { motion } from "framer-motion"
import { Search, Database, Target, Globe, Music, CheckCircle } from "lucide-react"

const features = [
  {
    icon: Search,
    title: "Smart Search & Filters",
    description: "Find exactly what you need with filters for type, location, genre, and keyword search across 79K+ contacts.",
  },
  {
    icon: Database,
    title: "Verified Database",
    description: "Every contact is verified — real emails, accurate locations, and up-to-date information.",
  },
  {
    icon: Target,
    title: "Built for Outreach",
    description: "Find radio stations to pitch, blogs to submit to, venues to book, and playlists to land on.",
  },
  {
    icon: Globe,
    title: "Worldwide Coverage",
    description: "Music industry contacts in every US state and 160+ countries worldwide.",
  },
  {
    icon: Music,
    title: "Every Resource Type",
    description: "Radio, playlists, blogs, venues, podcasts, magazines, record labels, distribution, DAWs, and more.",
  },
  {
    icon: CheckCircle,
    title: "Free to Start",
    description: "Access thousands of contacts free. Upgrade to Pro for direct emails, bulk export, and CRM tools.",
  },
]

export default function FeaturesBanner() {
  return (
    <section className="py-20 sm:py-28 bg-white border-y border-[#E8E3D9]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="eyebrow mb-4 flex items-center justify-center gap-2">
            <div className="h-px w-6 bg-[#C0272D]" />
            WHY ARTISPRENEUR
            <div className="h-px w-6 bg-[#C0272D]" />
          </div>
          <h2 className="text-3xl sm:text-4xl font-heading font-bold text-[#1A1A1A] mb-4">
            Everything You Need to <span className="text-[#C0272D]">Grow</span>
          </h2>
          <p className="text-[#4A4A4A] text-lg leading-relaxed">
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
              <div className="w-12 h-12 rounded-xl bg-[#F5E5E6] border border-[#C0272D]/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <feature.icon className="w-6 h-6 text-[#C0272D]" />
              </div>
              <h3 className="text-lg font-heading font-semibold text-[#1A1A1A] mb-2 group-hover:text-[#C0272D] transition-colors">
                {feature.title}
              </h3>
              <p className="text-sm text-[#4A4A4A] leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
