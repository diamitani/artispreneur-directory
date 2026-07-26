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
    <footer className="bg-[#1A1A1A] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">

          {/* Brand col */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-3 mb-5">
              <img src="/artispreneur-logo.png" alt="Artispreneur" className="h-10 w-10 object-contain" />
              <div>
                <span className="text-xl font-heading font-bold text-white">Artispreneur</span>
                <div className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#F5C100]">
                  Music Industry Database
                </div>
              </div>
            </Link>

            <p className="text-sm text-white/60 leading-relaxed max-w-sm mb-4">
              The premier FREE music industry database. 79,000+ verified contacts worldwide for independent artists, labels, managers and more.
            </p>

            <p className="text-sm font-bold italic text-[#F5C100] font-heading mb-6">
              Art Means Business.
            </p>

            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center gap-2 text-sm text-white/50">
                <Heart className="w-4 h-4 text-[#C0272D]" fill="currentColor" />
                <span>79,000+ contacts</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-white/50">
                <Mail className="w-4 h-4" />
                <span>support@artispreneur.com</span>
              </div>
            </div>

            {/* Social links */}
            <div className="flex gap-3">
              {[
                { href: "https://instagram.com/artispreneur", label: "IG" },
                { href: "https://twitter.com/artispreneur", label: "X" },
                { href: "https://youtube.com/@artispreneur", label: "YT" },
              ].map(({ href, label }) => (
                <a key={href} href={href} target="_blank" rel="noopener noreferrer"
                  className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-[10px] font-bold text-white/50 hover:text-[#F5C100] hover:border-[#F5C100]/30 transition-all">
                  {label}
                </a>
              ))}
            </div>
          </div>

          {/* Link groups */}
          {Object.values(footerLinks).map((group) => (
            <div key={group.label}>
              <h4 className="text-xs font-bold uppercase tracking-[0.15em] text-[#F5C100] mb-4">
                {group.label}
              </h4>
              <ul className="space-y-3">
                {group.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href}
                      className="text-sm text-white/50 hover:text-white transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-white/30">
            &copy; {new Date().getFullYear()} Artispreneur. All rights reserved.
          </p>
          <div className="flex items-center gap-2 text-xs text-white/30">
            <span className="inline-block w-2 h-2 rounded-full bg-[#F5C100] animate-pulse" />
            <span className="font-mono">Database Updated Daily</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
