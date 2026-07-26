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
  },
  {
    icon: Target,
    step: "02",
    title: "Connect",
    description: "Access verified contact details and submit your EPK, pitch, or music directly to the right people at the right places.",
  },
  {
    icon: TrendingUp,
    step: "03",
    title: "Grow",
    description: "Track your outreach, book shows, get press coverage, and land playlist placements. Build real momentum for your career.",
  },
]

export default function HowItWorks() {
  return (
    <section className="py-20 sm:py-28 bg-[#F9F6EF]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="eyebrow mb-4 flex items-center justify-center gap-2">
            <div className="h-px w-6 bg-[#C0272D]" />
            HOW IT WORKS
            <div className="h-px w-6 bg-[#C0272D]" />
          </div>
          <h2 className="text-3xl sm:text-4xl font-heading font-bold text-[#1A1A1A] mb-4">
            From Search to Booking in <span className="text-[#C0272D]">Three Steps</span>
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
                {/* Step number badge */}
                <div className="relative mb-5">
                  <div className="w-16 h-16 rounded-2xl bg-[#C0272D] flex items-center justify-center shadow-lg">
                    <step.icon className="w-7 h-7 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-[#F5C100] text-[#1A1A1A] text-xs font-black flex items-center justify-center shadow">
                    {i + 1}
                  </div>
                </div>
                <div className="text-sm font-black mb-2 text-[#C0272D] font-heading tracking-wider">{step.step}</div>
                <h3 className="text-xl font-heading font-semibold text-[#1A1A1A] mb-2">{step.title}</h3>
                <p className="text-[#4A4A4A] text-sm leading-relaxed max-w-xs">{step.description}</p>
              </div>
              {i < steps.length - 1 && (
                <div className="hidden md:block absolute top-8 -right-4 text-[#D4CBBA]">
                  <ArrowRight className="w-6 h-6" />
                </div>
              )}
            </motion.div>
          ))}
        </div>

        <div className="flex justify-center mt-12">
          <Link
            href="/directory"
            className="inline-flex items-center gap-2 bg-[#C0272D] text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-[#A12024] transition-all hover:scale-[1.02] shadow-md hover:shadow-lg"
          >
            Browse Database
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}
