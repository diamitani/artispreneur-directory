"use client"

import { useState, useEffect } from "react"
import { Database, Radio, Building, Music, Globe } from "lucide-react"
import SearchBar from "./SearchBar"
import { fetchStats } from "@/lib/api"

export default function HeroSection() {
  const [stats, setStats] = useState({
    totalContacts: 79000,
    radioStations: 50000,
    venues: 6900,
    playlists: 4500,
  })

  useEffect(() => {
    fetchStats().then((d) => {
      if (d.totalContacts) {
        setStats({
          totalContacts: d.totalContacts,
          radioStations: d.radioStations || 50000,
          venues: d.venues || 6900,
          playlists: d.playlists || 4500,
        })
      }
    }).catch(() => {})
  }, [])

  const statItems = [
    { label: "Verified Contacts", value: `${(stats.totalContacts / 1000).toFixed(0)}K+`, icon: Database },
    { label: "Radio Stations",    value: `${(stats.radioStations / 1000).toFixed(0)}K+`, icon: Radio },
    { label: "Live Venues",       value: `${(stats.venues / 1000).toFixed(1)}K+`,  icon: Building },
    { label: "Playlists",         value: `${(stats.playlists / 1000).toFixed(1)}K+`, icon: Music },
  ]

  return (
    <section className="relative min-h-[92dvh] flex items-center overflow-hidden">
      {/* Background: performer image + warm overlay */}
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1600&q=80"
          alt="Music performer"
          className="w-full h-full object-cover object-center"
        />
        {/* Deep warm overlay preserving image mood */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#1A1A1A]/92 via-[#1A1A1A]/75 to-[#1A1A1A]/30" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1A1A1A]/60 via-transparent to-transparent" />
      </div>

      {/* Gold glow top-left */}
      <div
        className="absolute top-20 left-0 w-[480px] h-[480px] rounded-full opacity-15 pointer-events-none"
        style={{ background: "#F5C100", filter: "blur(120px)" }}
      />

      <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20">
        <div className="max-w-2xl">

          {/* Live badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-7 animate-fade-in-up">
            <span className="w-2 h-2 rounded-full bg-[#F5C100] animate-pulse-dot" />
            <span className="text-sm text-[#F5C100] font-bold tracking-wide">
              {stats.totalContacts.toLocaleString()}+ Verified Contacts
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-heading font-bold text-white leading-[1.08] tracking-tight mb-5 animate-fade-in-up stagger-1">
            The Music Industry
            <br />
            <span className="text-gold-shimmer">Database.</span>
          </h1>

          {/* Tagline */}
          <p className="text-lg sm:text-xl text-white/70 max-w-lg leading-relaxed mb-3 animate-fade-in-up stagger-2">
            Direct access to radio stations, playlists, venues, blogs, and labels worldwide.
          </p>
          <p className="text-base text-[#F5C100] font-bold italic mb-8 animate-fade-in-up stagger-2">
            Art Means Business.
          </p>

          {/* Search */}
          <div className="animate-fade-in-up stagger-3">
            <SearchBar variant="hero" />
          </div>
        </div>

        {/* Stats row */}
        <div className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-2xl animate-fade-in-up" style={{ animationDelay: "0.5s", opacity: 0 }}>
          {statItems.map((stat) => (
            <div key={stat.label} className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#F5C100]/15 backdrop-blur-sm flex items-center justify-center shrink-0 border border-[#F5C100]/30">
                <stat.icon className="w-5 h-5 text-[#F5C100]" />
              </div>
              <div>
                <div className="text-xl font-bold text-white">{stat.value}</div>
                <div className="text-xs text-white/50">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll hint */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 animate-float">
        <span className="text-[9px] font-bold uppercase tracking-[0.25em] text-white/40">Explore</span>
        <div className="w-px h-8" style={{ background: "linear-gradient(to bottom, rgba(245,193,0,0.6), transparent)" }} />
      </div>
    </section>
  )
}
