"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowRight, Radio, Globe, Building, Music, Podcast, Star, BookOpen, Users, Newspaper, Truck, Book, Library, Layers } from "lucide-react"
import { motion } from "framer-motion"
import { fetchStats } from "@/lib/api"

interface CategoryStat { type: string; count: number }

const CATEGORIES = [
  { type: "radio", label: "Radio Stations", icon: Radio, image: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=600" },
  { type: "venue", label: "Live Venues", icon: Building, image: "https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=600" },
  { type: "blog", label: "Music Blogs", icon: Globe, image: "https://images.unsplash.com/photo-1432821596592-e2c18b78144f?w=600" },
  { type: "playlist", label: "Playlists", icon: Music, image: "https://images.unsplash.com/photo-1614680376573-df3480f0c6ff?w=600" },
  { type: "podcast", label: "Podcasts", icon: Podcast, image: "https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=600" },
  { type: "record_label", label: "Record Labels", icon: Star, image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600" },
  { type: "magazine", label: "Magazines", icon: BookOpen, image: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=600" },
  { type: "press", label: "Press & PR", icon: Users, image: "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=600" },
  { type: "newspaper", label: "Newspapers", icon: Newspaper, image: "https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=600" },
  { type: "distributor", label: "Distributors", icon: Truck, image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600" },
  { type: "publisher", label: "Publishers", icon: Book, image: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=600" },
  { type: "licensing_library", label: "Sync Libraries", icon: Library, image: "https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=600" },
  { type: "resource", label: "Artist Resources", icon: Layers, image: "https://images.unsplash.com/photo-1598653222000-6b7b7a552625?w=600" },
]

export default function CategoryGrid() {
  const [stats, setStats] = useState<CategoryStat[]>([])

  useEffect(() => {
    fetchStats().then((d) => {
      if (d.byType) {
        setStats(Object.entries(d.byType).map(([type, count]) => ({ type, count: count as number })))
      }
    }).catch(() => {})
  }, [])

  const getCount = (type: string) => stats.find((s) => s.type === type)?.count || 0

  return (
    <section className="py-20 sm:py-28 bg-[#F9F6EF]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
          <div>
            <div className="eyebrow mb-4 flex items-center gap-2">
              <div className="h-px w-6 bg-[#C0272D]" />
              BROWSE BY CATEGORY
            </div>
            <h2 className="text-3xl sm:text-4xl font-heading font-bold text-[#1A1A1A]">
              Explore All <span className="text-[#C0272D]">Categories</span>
            </h2>
          </div>
          <Link href="/categories" className="inline-flex items-center gap-1.5 text-[#C0272D] font-bold hover:text-[#A12024] transition-colors text-sm">
            Browse all categories <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {CATEGORIES.map((cat, i) => (
            <motion.div
              key={cat.type}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05, duration: 0.4 }}
            >
              <Link
                href={`/directory?type=${cat.type}`}
                className="group relative block aspect-[4/3] rounded-2xl overflow-hidden listing-card"
              >
                <img
                  src={cat.image} alt={cat.label}
                  className="w-full h-full object-cover transition-all duration-500 group-hover:scale-110 opacity-50"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1A1A1A]/90 via-[#1A1A1A]/40 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <div className="flex items-center gap-1.5 text-white mb-0.5">
                    <cat.icon className="w-3.5 h-3.5 text-[#F5C100]" />
                    <h3 className="font-heading font-semibold text-xs leading-tight">{cat.label}</h3>
                  </div>
                  {getCount(cat.type) > 0 && (
                    <p className="text-[#F5C100] text-[10px] font-bold">
                      {getCount(cat.type).toLocaleString()}
                    </p>
                  )}
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
