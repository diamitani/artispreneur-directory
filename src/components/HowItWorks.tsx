"use client"

import { Compass, Target, TrendingUp, ArrowRight } from "lucide-react"
import { motion } from "framer-motion"
import Link from "next/link"

const steps = [
  {
    icon: Compass,
    step: "01",
    title: "Discover",
    description: "Browse thousands of radio stations, venues, blogs, and playlists. Filter by type, location, or search for exactly what you need.",
    color: "bg-brand-500 text-navy-900",
  },
  {
    icon: Target,
    step: "02",
    title: "Connect",
    description: "Access verified contact details and submit your EPK, pitch, or music directly to the right people at the right places.",
    color: "bg-brand-500 text-navy-900",
  },
  {
    icon: TrendingUp,
    step: "03",
    title: "Grow",
    description: "Track your outreach, book shows, get press coverage, and land playlist placements. Build real momentum for your career.",
    color: "bg-brand-500 text-navy-900",
  },
]

export default function HowItWorks() {
  return (
    <section className="py-20 sm:py-28 bg-navy-500 border-y border-warm-700/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="eyebrow mb-4 flex items-center justify-center gap-2">
            <div className="h-px w-6 bg-brand-500" />
            HOW IT WORKS
            <div className="h-px w-6 bg-brand-500" />
          </div>
          <h2 className="text-3xl sm:text-4xl font-heading font-bold text-white mb-4">
            From Search to Booking in <span className="text-brand-500">Three Steps</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {steps.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15, duration: 0.5 }}
              className="relative text-center"
            >
              <div className="flex flex-col items-center">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-5 ${step.color}`}>
                  <step.icon className="w-7 h-7" />
                </div>
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-brand-500 text-navy-900 text-sm font-bold flex items-center justify-center shadow-lg" style={{ boxShadow: "0 4px 20px oklch(0.72 0.19 85 / 0.3)" }}>
                  {i + 1}
                </div>
                <div className="text-sm font-black mb-2 text-brand-500 font-heading">{step.step}</div>
                <h3 className="text-xl font-heading font-semibold text-white mb-2">{step.title}</h3>
                <p className="text-warm-400 text-sm leading-relaxed max-w-xs">{step.description}</p>
              </div>
              {i < steps.length - 1 && (
                <div className="hidden md:block absolute top-8 -right-4 text-warm-600">
                  <ArrowRight className="w-6 h-6" />
                </div>
              )}
            </motion.div>
          ))}
        </div>

        <div className="flex justify-center mt-12">
          <Link
            href="/directory"
            className="inline-flex items-center gap-2 bg-brand-500 text-navy-900 px-6 py-3 rounded-xl font-bold hover:bg-brand-400 transition-all hover:scale-[1.02]"
          >
            Browse Database
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}
