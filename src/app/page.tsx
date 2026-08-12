"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"

const stats = [
  { value: "79K+", label: "Verified Contacts", suffix: "worldwide" },
  { value: "14", label: "Resource Types", suffix: "radio to labels" },
  { value: "160+", label: "Countries", suffix: "global reach" },
  { value: "24/7", label: "AI Agent", suffix: "always available" },
]

const features = [
  {
    title: "Smart Contact Search",
    description: "Find the exact radio station, playlist curator, venue booker, or label A&R for your genre and career stage.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
        <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
      </svg>
    ),
    large: true,
  },
  {
    title: "AI Pitch Writer",
    description: "Generate personalized outreach emails tailored to each contact. PAL-compiled intents ensure every pitch hits the right tone.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
        <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
      </svg>
    ),
    large: false,
  },
  {
    title: "Release Planner",
    description: "Plan your release strategy with timeline, asset checklists, and market analysis. Everything in one workspace.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
      </svg>
    ),
    large: false,
  },
  {
    title: "Workspace Chat",
    description: "Chat with the Artispreneur AI agent. It remembers your context, learns your genre, and gives specific, actionable advice.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </svg>
    ),
    large: false,
  },
  {
    title: "Industry Database",
    description: "78,000+ verified contacts across radio, blogs, venues, playlists, podcasts, labels, and more. Updated continuously.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
        <ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>
      </svg>
    ),
    large: true,
  },
]

const howItWorks = [
  { step: "01", title: "Create your workspace", description: "Sign up in seconds. Your workspace is ready instantly — no setup required." },
  { step: "02", title: "Ask the AI agent", description: "Tell the agent your genre, goals, and what you need. It understands music industry context." },
  { step: "03", title: "Get matched contacts", description: "The agent searches the database and returns the right contacts for your specific needs." },
  { step: "04", title: "Execute your plan", description: "Send pitches, book shows, get press — all with AI-assisted workflows." },
]

const pricingTiers = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Get started with essential tools",
    features: ["500 contact views/month", "AI chat (10 messages/day)", "Basic search filters", "1 workspace"],
    cta: "Start Free",
    href: "/signup",
    featured: false,
  },
  {
    name: "Pro",
    price: "$19",
    period: "/month",
    description: "Everything you need to grow",
    features: ["Unlimited contacts", "Unlimited AI chat", "Advanced filters & export", "5 workspaces", "Priority support"],
    cta: "Go Pro",
    href: "/signup?plan=pro",
    featured: true,
  },
  {
    name: "Team",
    price: "$49",
    period: "/month",
    description: "For labels, managers, and agencies",
    features: ["Everything in Pro", "Unlimited workspaces", "Team collaboration", "API access", "Dedicated support"],
    cta: "Contact Sales",
    href: "/pricing",
    featured: false,
  },
]

export default function Home() {
  const [typedText, setTypedText] = useState("")
  const fullText = "Find the right contacts. Write better pitches. Release smarter."

  useEffect(() => {
    let i = 0
    const interval = setInterval(() => {
      setTypedText(fullText.slice(0, i))
      i++
      if (i > fullText.length) clearInterval(interval)
    }, 40)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="bg-mesh">
      {/* ═══════ HERO ═══════ */}
      <section className="relative min-h-[100dvh] flex flex-col items-center justify-center px-6 pt-24 pb-20">
        {/* Announcement */}
        <Link
          href="/signup"
          className="reveal group inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-[#22d3ee]/8 border border-[#22d3ee]/15 mb-10 hover:bg-[#22d3ee]/12 transition-all"
        >
          <span className="live-dot" />
          <span className="text-[11px] font-semibold uppercase tracking-[0.15em] text-[#22d3ee]">
            Now in Open Beta
          </span>
          <span className="text-[11px] text-white/50 group-hover:text-white/70 transition-colors">
            Join 12,000+ artists →
          </span>
        </Link>

        {/* Headline */}
        <h1 className="reveal reveal-delay-1 text-center text-[clamp(2.5rem,7vw,5rem)] font-semibold leading-[1.05] tracking-[-0.04em] text-[#f7f8f8] max-w-4xl">
          <span className="text-gradient">The operating system</span>
          <br />
          for independent artists.
        </h1>

        {/* Subtitle typed */}
        <p className="reveal reveal-delay-2 mt-8 text-lg text-white/50 max-w-xl text-center leading-relaxed min-h-[3.5rem]">
          {typedText}
          <span className="inline-block w-[2px] h-[1.1em] bg-[#22d3ee] ml-1 align-middle animate-pulse" />
        </p>

        {/* CTAs */}
        <div className="reveal reveal-delay-3 flex flex-col sm:flex-row items-center gap-4 mt-10">
          <Link href="/signup" className="btn-primary text-base px-8 py-3">
            Start building free
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </Link>
          <Link href="/directory" className="btn-ghost text-base px-8 py-3">
            Browse directory
          </Link>
        </div>

        {/* Stats row */}
        <div className="reveal reveal-delay-3 mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-16">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <div className="stat-number text-2xl md:text-3xl font-semibold text-[#f7f8f8] tracking-tight">
                {s.value}
              </div>
              <div className="text-[13px] font-medium text-white/50 mt-1">{s.label}</div>
              <div className="text-[11px] text-white/30 mt-0.5">{s.suffix}</div>
            </div>
          ))}
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
          <div className="w-5 h-8 rounded-full border border-white/10 flex justify-center pt-1.5">
            <div className="w-1 h-2 rounded-full bg-white/20 animate-bounce" />
          </div>
        </div>
      </section>

      <div className="section-divider max-w-7xl mx-auto" />

      {/* ═══════ FEATURES ═══════ */}
      <section id="features" className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="reveal text-center mb-16">
            <span className="eyebrow">⚡ Capabilities</span>
            <h2 className="mt-4 text-[clamp(2rem,5vw,3rem)] font-semibold tracking-[-0.03em] text-[#f7f8f8]">
              Everything you need to run your music career
            </h2>
            <p className="mt-4 text-white/50 max-w-lg mx-auto">
              From finding contacts to writing pitches, planning releases to analyzing markets — one AI-powered platform.
            </p>
          </div>

          {/* Bento grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 auto-rows-auto">
            {features.map((f, i) => (
              <div
                key={f.title}
                className={`reveal reveal-delay-${(i % 3) + 1} ${f.large ? "md:col-span-2" : ""}`}
              >
                <div className="double-bezel h-full">
                  <div className="double-bezel-inner p-6 md:p-8">
                    <div className="w-10 h-10 rounded-xl bg-[#22d3ee]/10 border border-[#22d3ee]/15 flex items-center justify-center text-[#22d3ee] mb-5">
                      {f.icon}
                    </div>
                    <h3 className="text-lg font-semibold text-[#f7f8f8] tracking-[-0.02em]">
                      {f.title}
                    </h3>
                    <p className="mt-2 text-[15px] text-white/50 leading-relaxed max-w-md">
                      {f.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="section-divider max-w-7xl mx-auto" />

      {/* ═══════ DASHBOARD PREVIEW ═══════ */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="reveal text-center mb-12">
            <span className="eyebrow">📊 Workspace</span>
            <h2 className="mt-4 text-[clamp(2rem,5vw,3rem)] font-semibold tracking-[-0.03em] text-[#f7f8f8]">
              Your command center for music
            </h2>
          </div>

          {/* Fake app chrome */}
          <div className="reveal reveal-delay-1 double-bezel overflow-hidden">
            <div className="double-bezel-inner !p-0 !backdrop-blur-none">
              {/* Title bar */}
              <div className="flex items-center gap-3 px-4 py-3 border-b border-white/[0.06] bg-white/[0.02]">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-[#ef4444]/60" />
                  <div className="w-3 h-3 rounded-full bg-[#f59e0b]/60" />
                  <div className="w-3 h-3 rounded-full bg-[#10b981]/60" />
                </div>
                <div className="flex-1 flex justify-center">
                  <div className="px-4 py-1 rounded-md bg-white/[0.04] border border-white/[0.06] text-[11px] text-white/40 font-mono">
                    app.artispreneur.com/workspace
                  </div>
                </div>
              </div>
              {/* App body */}
              <div className="flex h-[400px]">
                {/* Sidebar */}
                <div className="w-48 shrink-0 border-r border-white/[0.06] bg-white/[0.01] p-4 flex flex-col gap-1">
                  {["Dashboard", "Chat", "Contacts", "Releases", "Settings"].map((item, i) => (
                    <div
                      key={item}
                      className={`px-3 py-1.5 rounded-md text-[13px] ${
                        i === 1
                          ? "bg-[#22d3ee]/10 text-[#22d3ee] font-medium"
                          : "text-white/40 hover:text-white/60"
                      } cursor-pointer transition-colors`}
                    >
                      {item}
                    </div>
                  ))}
                  <div className="mt-auto pt-4 border-t border-white/[0.06]">
                    <div className="flex items-center gap-2 px-3 py-1.5">
                      <div className="w-5 h-5 rounded-full bg-[#22d3ee]/20 flex items-center justify-center text-[9px] text-[#22d3ee] font-bold">
                        A
                      </div>
                      <span className="text-[12px] text-white/50">Artist</span>
                    </div>
                  </div>
                </div>
                {/* Chat area */}
                <div className="flex-1 flex flex-col p-4 gap-3">
                  <div className="chat-bubble-agent px-4 py-3 text-[14px]">
                    <strong>AI Agent</strong>
                    <p className="mt-1">I found 23 hip-hop blogs accepting submissions in your genre. Here are the top matches in Los Angeles...</p>
                  </div>
                  <div className="glass-card rounded-lg p-3">
                    <div className="text-[13px] text-white/60">🎯 Top Match</div>
                    <div className="text-[14px] font-medium text-[#f7f8f8] mt-1">EarMilk</div>
                    <div className="text-[12px] text-white/40 mt-0.5">Hip-Hop/Electronic blog • 2.4M monthly readers</div>
                    <div className="mt-2 px-2 py-0.5 inline-block rounded bg-[#10b981]/10 border border-[#10b981]/20 text-[11px] text-[#10b981]">
                      92% match
                    </div>
                  </div>
                  <div className="mt-auto flex items-center gap-2">
                    <div className="flex-1 px-4 py-2 rounded-lg bg-white/[0.04] border border-white/[0.08] text-[13px] text-white/40">
                      Ask about contacts, pitches, or strategy...
                    </div>
                    <div className="w-8 h-8 rounded-lg bg-[#22d3ee] flex items-center justify-center">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#050505" strokeWidth="2.5" strokeLinecap="round">
                        <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/>
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="section-divider max-w-7xl mx-auto" />

      {/* ═══════ HOW IT WORKS ═══════ */}
      <section id="how-it-works" className="py-32 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="reveal text-center mb-16">
            <span className="eyebrow">🔄 Workflow</span>
            <h2 className="mt-4 text-[clamp(2rem,5vw,3rem)] font-semibold tracking-[-0.03em] text-[#f7f8f8]">
              From idea to execution in four steps
            </h2>
          </div>
          <div className="space-y-6">
            {howItWorks.map((item, i) => (
              <div key={item.step} className={`reveal reveal-delay-${(i % 3) + 1}`}>
                <div className="glass-card p-6 flex items-start gap-6">
                  <div className="shrink-0 w-12 h-12 rounded-xl bg-[#22d3ee]/10 border border-[#22d3ee]/15 flex items-center justify-center text-[#22d3ee] text-sm font-bold font-mono">
                    {item.step}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-[#f7f8f8]">{item.title}</h3>
                    <p className="mt-1 text-[15px] text-white/50">{item.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="section-divider max-w-7xl mx-auto" />

      {/* ═══════ PRICING ═══════ */}
      <section id="pricing" className="py-32 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="reveal text-center mb-16">
            <span className="eyebrow">💎 Pricing</span>
            <h2 className="mt-4 text-[clamp(2rem,5vw,3rem)] font-semibold tracking-[-0.03em] text-[#f7f8f8]">
              Simple, transparent pricing
            </h2>
            <p className="mt-4 text-white/50">Start free. Upgrade when you need more power.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {pricingTiers.map((tier, i) => (
              <div key={tier.name} className={`reveal reveal-delay-${i + 1}`}>
                <div className={`${tier.featured ? "animated-border" : ""} ${tier.featured ? "" : "double-bezel"} h-full`}>
                  <div className={`${tier.featured ? "rounded-[calc(var(--radius-2xl)-1px)] bg-[#0a0a0a] h-full" : "double-bezel-inner"} p-6 md:p-8`}>
                    {tier.featured && (
                      <span className="inline-block px-3 py-0.5 rounded-full bg-[#22d3ee]/10 border border-[#22d3ee]/15 text-[10px] font-semibold uppercase tracking-wider text-[#22d3ee] mb-4">
                        Most Popular
                      </span>
                    )}
                    <h3 className="text-lg font-semibold text-[#f7f8f8]">{tier.name}</h3>
                    <div className="mt-3 flex items-baseline gap-1">
                      <span className="text-3xl font-bold text-[#f7f8f8] tracking-tight">{tier.price}</span>
                      <span className="text-sm text-white/40">{tier.period}</span>
                    </div>
                    <p className="mt-2 text-[14px] text-white/50">{tier.description}</p>
                    <ul className="mt-6 space-y-3">
                      {tier.features.map((f) => (
                        <li key={f} className="flex items-start gap-2.5 text-[14px] text-white/60">
                          <svg className="shrink-0 mt-0.5" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22d3ee" strokeWidth="2" strokeLinecap="round">
                            <polyline points="20 6 9 17 4 12"/>
                          </svg>
                          {f}
                        </li>
                      ))}
                    </ul>
                    <Link
                      href={tier.href}
                      className={`mt-8 w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-full text-[14px] font-semibold transition-all ${
                        tier.featured
                          ? "bg-[#22d3ee] text-[#050505] hover:bg-[#67e8f9] shadow-[0_0_20px_rgba(34,211,238,0.18)]"
                          : "bg-white/[0.04] text-[#f7f8f8] border border-white/[0.08] hover:bg-white/[0.08]"
                      }`}
                    >
                      {tier.cta}
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="section-divider max-w-7xl mx-auto" />

      {/* ═══════ CTA ═══════ */}
      <section className="py-32 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="reveal animated-border rounded-[2rem]">
            <div className="rounded-[calc(2rem-1px)] bg-[#0a0a0a] p-12 md:p-16">
              <h2 className="text-[clamp(1.8rem,4vw,2.8rem)] font-semibold tracking-[-0.03em] text-[#f7f8f8]">
                Ready to take control of your music career?
              </h2>
              <p className="mt-4 text-white/50 max-w-md mx-auto">
                Join thousands of independent artists using Artispreneur to find contacts, write pitches, and plan releases.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/signup" className="btn-primary text-base px-8 py-3">
                  Start free — no credit card
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </Link>
                <Link href="/directory" className="btn-ghost text-base px-8 py-3">
                  Browse 79K+ contacts
                </Link>
              </div>
              <p className="mt-6 text-[12px] text-white/25">
                Free forever tier. No credit card required.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
