import Link from "next/link"
import { Music, Heart, Mail } from "lucide-react"

const footerLinks = {
  platform: {
    label: "Platform",
    links: [
      { href: "/directory", label: "Browse Database" },
      { href: "/categories", label: "All Categories" },
      { href: "/pricing", label: "Pricing" },
    ],
  },
  resources: {
    label: "Resources",
    links: [
      { href: "/about", label: "About Us" },
      { href: "/blog", label: "Blog" },
      { href: "/guides", label: "Artist Guides" },
    ],
  },
  support: {
    label: "Support",
    links: [
      { href: "/contact", label: "Contact" },
      { href: "/faq", label: "FAQ" },
      { href: "/privacy", label: "Privacy Policy" },
      { href: "/terms", label: "Terms of Service" },
    ],
  },
}

export default function Footer() {
  return (
    <footer className="bg-navy-600 border-t border-warm-700/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-3 mb-4">
              <img src="/artispreneur-logo.png" alt="Artispreneur" className="h-9 w-9 rounded-lg" />
              <div>
                <span className="text-xl font-heading font-bold text-brand-500">Artispreneur</span>
              </div>
            </Link>
            <p className="text-warm-400 text-sm leading-relaxed max-w-sm mb-4">
              The premier FREE music industry database. 78,000+ verified contacts worldwide. For independent artists, labels, managers and more.
            </p>
            <p className="text-sm font-bold italic text-brand-500 font-heading mb-6">
              Art Means Business.
            </p>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-warm-400">
                <Heart className="w-4 h-4 text-brand-500" fill="currentColor" />
                <span>78,000+ contacts</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-warm-400">
                <Mail className="w-4 h-4" />
                <span>support@artispreneur.com</span>
              </div>
            </div>
          </div>

          {Object.values(footerLinks).map((group) => (
            <div key={group.label}>
              <h4 className="font-heading font-semibold text-xs uppercase tracking-wider text-brand-500 mb-4">
                {group.label}
              </h4>
              <ul className="space-y-3">
                {group.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-warm-400 hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-warm-700/20 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-warm-500">
            &copy; {new Date().getFullYear()} Artispreneur. All rights reserved.
          </p>
          <div className="flex items-center gap-2 text-xs text-warm-500">
            <span className="inline-block w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="font-mono">Database Updated Daily</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
