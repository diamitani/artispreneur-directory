"use client"

import { useState, useEffect } from "react"
import { Database, Radio, Building, Music, Globe } from "lucide-react"
import SearchBar from "./SearchBar"

export default function HeroSection() {
  const [stats, setStats] = useState({
    totalContacts: 78000,
    radioStations: 50000,
    venues: 6900,
    playlists: 4500,
  })

  useEffect(() => {
    fetch("/data/stats.json")
      .then((r) => r.json())
      .then((d) => {
        if (d.totalContacts) {
          setStats({
            totalContacts: d.totalContacts,
            radioStations: d.radioStations || 50000,
            venues: d.venues || 6900,
            playlists: d.playlists || 4500,
          })
        }
      })
      .catch(() => {})
  }, [])

  const statItems = [
    {
      label: "Verified Contacts",
      value: `${(stats.totalContacts / 1000).toFixed(0)}K+`,
      icon: Database,
    },
    {
      label: "Radio Stations",
      value: `${(stats.radioStations / 1000).toFixed(0)}K+`,
      icon: Radio,
    },
    {
      label: "Live Venues",
      value: `${(stats.venues / 1000).toFixed(1)}K+`,
      icon: Building,
    },
    {
      label: "Active Playlists",
      value: `${(stats.playlists / 1000).toFixed(1)}K+`,
      icon: Music,
    },
  ]

  return (
    <section className="relative min-h-[90dvh] flex items-center overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-navy-600 via-navy-500 to-navy-500" />
      <div
        className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full opacity-15 pointer-events-none"
        style={{ background: "oklch(0.72 0.19 85)", filter: "blur(140px)" }}
      />

      <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-500/10 backdrop-blur-sm border border-brand-500/20 mb-6">
            <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse-dot" />
            <span className="text-sm text-brand-400 font-semibold tracking-wide">
              {stats.totalContacts.toLocaleString()}+ Verified Contacts
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-heading font-bold text-white leading-[1.1] tracking-tight mb-5">
            The Music Industry
            <br />
            <span className="text-gradient-gold">Database.</span>
          </h1>

          <p className="text-lg sm:text-xl text-warm-400 max-w-xl mx-auto leading-relaxed mb-8">
            Direct access to radio stations, playlists, venues, blogs, and labels worldwide — built for independent artists who treat music like a business.
          </p>

          <SearchBar variant="hero" />
        </div>

        <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-2xl mx-auto">
          {statItems.map((stat) => (
            <div key={stat.label} className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-brand-500/10 backdrop-blur-sm flex items-center justify-center shrink-0 border border-brand-500/20">
                <stat.icon className="w-5 h-5 text-brand-400" />
              </div>
              <div>
                <div className="text-xl font-bold text-white">{stat.value}</div>
                <div className="text-xs text-warm-500">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 animate-float">
        <span className="text-[9px] font-bold uppercase tracking-[0.25em] text-warm-500">Explore</span>
        <div className="w-px h-8" style={{ background: "linear-gradient(to bottom, oklch(0.60 0.18 85), transparent)" }} />
      </div>
    </section>
  )
}
