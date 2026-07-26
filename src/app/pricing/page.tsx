import Link from "next/link"
import { Check, ArrowRight, Star, Zap, Shield, Database } from "lucide-react"

const FREE_FEATURES = [
  "Browse 78,000+ verified contacts",
  "Search by name, location, type",
  "Filter by category",
  "View contact websites",
  "Basic directory access",
  "Mobile-friendly interface",
]

const PRO_FEATURES = [
  "Everything in Free",
  "View all email addresses",
  "Export contacts to CSV",
  "CRM notes & tagging",
  "Bulk outreach lists",
  "Priority support",
  "Advanced filters (genre, country, state)",
  "Weekly database updates",
  "Submission tracking",
  "Unlimited searches",
]

const TESTIMONIALS = [
  {
    quote: "Found 200 radio stations in my genre in under 10 minutes. Artispreneur is the only database you need.",
    author: "Marcus T.",
    role: "Independent Hip-Hop Artist",
  },
  {
    quote: "Booked 8 shows last month using the venue contacts. Absolutely worth every penny.",
    author: "Leila R.",
    role: "Singer-Songwriter",
  },
  {
    quote: "Landed 3 playlist placements and a blog feature. This database is insane.",
    author: "Devon K.",
    role: "Electronic Producer",
  },
]

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-navy-500 pt-24 pb-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="eyebrow mb-4 flex items-center justify-center gap-2">
            <div className="h-px w-6 bg-brand-500" />
            PRICING
            <div className="h-px w-6 bg-brand-500" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-heading font-bold text-white mb-4">
            Simple, Honest <span className="text-gradient-gold">Pricing</span>
          </h1>
          <p className="text-warm-400 text-lg leading-relaxed">
            Start free. Upgrade when you&apos;re ready to unlock direct emails and power tools.
          </p>
        </div>

        {/* Plans */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto mb-20">

          {/* Free Plan */}
          <div className="listing-card rounded-2xl p-8 flex flex-col">
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-warm-700/20 flex items-center justify-center">
                  <Database className="w-5 h-5 text-warm-400" />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-white text-xl">Free</h3>
                  <p className="text-xs text-warm-500">Always free</p>
                </div>
              </div>
              <div className="flex items-end gap-1 mb-2">
                <span className="text-5xl font-heading font-bold text-white">$0</span>
                <span className="text-warm-500 mb-2">/month</span>
              </div>
              <p className="text-sm text-warm-400">Full directory access, no credit card required.</p>
            </div>

            <ul className="space-y-3 mb-8 flex-1">
              {FREE_FEATURES.map((f) => (
                <li key={f} className="flex items-start gap-2.5 text-sm text-warm-300">
                  <Check className="w-4 h-4 text-green-400 shrink-0 mt-0.5" />
                  {f}
                </li>
              ))}
            </ul>

            <Link
              href="/signup"
              className="block w-full text-center py-3 rounded-xl border border-warm-700/30 text-warm-300 font-bold text-sm hover:border-brand-500/30 hover:text-white transition-all"
            >
              Get Started Free
            </Link>
          </div>

          {/* Pro Plan */}
          <div className="relative rounded-2xl p-8 flex flex-col" style={{ background: "oklch(0.12 0.005 250)", border: "1px solid oklch(0.72 0.19 85 / 0.35)", boxShadow: "0 0 40px oklch(0.72 0.19 85 / 0.08)" }}>
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <span className="inline-flex items-center gap-1.5 bg-brand-500 text-navy-900 text-xs font-black px-4 py-1.5 rounded-full">
                <Star className="w-3 h-3" fill="currentColor" /> MOST POPULAR
              </span>
            </div>

            <div className="mb-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-brand-500" />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-white text-xl">Pro</h3>
                  <p className="text-xs text-brand-500">Full access + power tools</p>
                </div>
              </div>
              <div className="flex items-end gap-1 mb-2">
                <span className="text-5xl font-heading font-bold text-white">$29</span>
                <span className="text-warm-500 mb-2">/month</span>
              </div>
              <p className="text-sm text-warm-400">Unlock emails, exports, and outreach tools.</p>
            </div>

            <ul className="space-y-3 mb-8 flex-1">
              {PRO_FEATURES.map((f) => (
                <li key={f} className="flex items-start gap-2.5 text-sm text-warm-300">
                  <Check className="w-4 h-4 text-brand-500 shrink-0 mt-0.5" />
                  {f}
                </li>
              ))}
            </ul>

            <Link
              href="/signup?plan=pro"
              className="block w-full text-center py-3 rounded-xl bg-brand-500 text-navy-900 font-bold text-sm hover:bg-brand-400 transition-all hover:scale-[1.02] flex items-center justify-center gap-2"
            >
              Start Pro Free Trial <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Guarantee */}
        <div className="max-w-2xl mx-auto text-center mb-20">
          <div className="flex items-center justify-center gap-3 listing-card rounded-2xl p-6">
            <Shield className="w-8 h-8 text-brand-500 shrink-0" />
            <div className="text-left">
              <p className="font-heading font-semibold text-white">30-day money-back guarantee</p>
              <p className="text-sm text-warm-400">Not happy? Full refund, no questions asked.</p>
            </div>
          </div>
        </div>

        {/* Testimonials */}
        <div className="mb-20">
          <div className="eyebrow mb-8 flex items-center justify-center gap-2">
            <div className="h-px w-6 bg-brand-500" />
            ARTIST STORIES
            <div className="h-px w-6 bg-brand-500" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t) => (
              <div key={t.author} className="listing-card rounded-2xl p-6">
                <div className="flex gap-0.5 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-brand-500" fill="currentColor" />
                  ))}
                </div>
                <p className="text-sm text-warm-300 leading-relaxed mb-4 italic">&ldquo;{t.quote}&rdquo;</p>
                <div>
                  <p className="text-sm font-semibold text-white">{t.author}</p>
                  <p className="text-xs text-warm-500">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-heading font-bold text-white text-center mb-8">Frequently Asked Questions</h2>
          {[
            { q: "Is the free plan actually free?", a: "Yes, forever. No credit card required. You get full directory browsing and search." },
            { q: "How often is the database updated?", a: "Pro members get weekly updates. Free members get monthly updates. All contacts are human-verified." },
            { q: "Can I export contacts?", a: "Pro members can export to CSV. Free members can browse and copy individual contacts." },
            { q: "What payment methods do you accept?", a: "We accept all major credit cards via Stripe. All transactions are encrypted and secure." },
            { q: "How do I cancel?", a: "Cancel anytime from your account settings. No cancellation fees." },
          ].map(({ q, a }) => (
            <div key={q} className="listing-card rounded-xl p-5 mb-3">
              <h4 className="font-heading font-semibold text-white mb-2 text-sm">{q}</h4>
              <p className="text-sm text-warm-400 leading-relaxed">{a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
