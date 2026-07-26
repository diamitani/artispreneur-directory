import Link from "next/link"
import { ArrowRight, Radio, Globe, Building, Music, Podcast, Star, BookOpen, Users, Newspaper, Truck, Book, Library, Layers } from "lucide-react"

const CATEGORIES = [
  {
    type: "radio",
    label: "Radio Stations",
    icon: Radio,
    count: "50,000+",
    description: "AM/FM, internet, college, and community radio stations worldwide",
    color: "from-blue-500/20 to-blue-600/10",
    border: "border-blue-400/30",
    iconColor: "text-blue-400",
    image: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800",
  },
  {
    type: "venue",
    label: "Live Venues",
    icon: Building,
    count: "6,900+",
    description: "Concert halls, clubs, arenas, and intimate live music spaces",
    color: "from-pink-500/20 to-pink-600/10",
    border: "border-pink-400/30",
    iconColor: "text-pink-400",
    image: "https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=800",
  },
  {
    type: "playlist",
    label: "Playlists",
    icon: Music,
    count: "4,500+",
    description: "Spotify, Apple Music, and YouTube playlist curators open to submissions",
    color: "from-emerald-500/20 to-emerald-600/10",
    border: "border-emerald-400/30",
    iconColor: "text-emerald-400",
    image: "https://images.unsplash.com/photo-1614680376573-df3480f0c6ff?w=800",
  },
  {
    type: "record_label",
    label: "Record Labels",
    icon: Star,
    count: "4,100+",
    description: "Independent and major record labels actively signing artists",
    color: "from-brand-500/20 to-brand-600/10",
    border: "border-brand-400/30",
    iconColor: "text-brand-400",
    image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800",
  },
  {
    type: "blog",
    label: "Music Blogs",
    icon: Globe,
    count: "3,200+",
    description: "Online music publications, review sites, and tastemaker blogs",
    color: "from-violet-500/20 to-violet-600/10",
    border: "border-violet-400/30",
    iconColor: "text-violet-400",
    image: "https://images.unsplash.com/photo-1432821596592-e2c18b78144f?w=800",
  },
  {
    type: "press",
    label: "Press & PR",
    icon: Users,
    count: "2,400+",
    description: "Music journalists, publicists, and press agencies",
    color: "from-cyan-500/20 to-cyan-600/10",
    border: "border-cyan-400/30",
    iconColor: "text-cyan-400",
    image: "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800",
  },
  {
    type: "podcast",
    label: "Podcasts",
    icon: Podcast,
    count: "2,800+",
    description: "Music interview shows, industry talk, and genre-specific podcasts",
    color: "from-teal-500/20 to-teal-600/10",
    border: "border-teal-400/30",
    iconColor: "text-teal-400",
    image: "https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=800",
  },
  {
    type: "magazine",
    label: "Magazines",
    icon: BookOpen,
    count: "1,800+",
    description: "Print and digital music magazines accepting artist features",
    color: "from-amber-500/20 to-amber-600/10",
    border: "border-amber-400/30",
    iconColor: "text-amber-400",
    image: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800",
  },
  {
    type: "newspaper",
    label: "Newspapers",
    icon: Newspaper,
    count: "1,200+",
    description: "Daily and weekly newspapers with entertainment and arts sections",
    color: "from-indigo-500/20 to-indigo-600/10",
    border: "border-indigo-400/30",
    iconColor: "text-indigo-400",
    image: "https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=800",
  },
  {
    type: "distributor",
    label: "Distributors",
    icon: Truck,
    count: "600+",
    description: "Digital and physical music distribution companies",
    color: "from-orange-500/20 to-orange-600/10",
    border: "border-orange-400/30",
    iconColor: "text-orange-400",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800",
  },
  {
    type: "publisher",
    label: "Publishers",
    icon: Book,
    count: "400+",
    description: "Music publishing companies for sync licensing and royalties",
    color: "from-green-500/20 to-green-600/10",
    border: "border-green-400/30",
    iconColor: "text-green-400",
    image: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800",
  },
  {
    type: "licensing_library",
    label: "Sync Libraries",
    icon: Library,
    count: "100+",
    description: "Music licensing libraries for TV, film, and commercial placements",
    color: "from-lime-500/20 to-lime-600/10",
    border: "border-lime-400/30",
    iconColor: "text-lime-400",
    image: "https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=800",
  },
  {
    type: "resource",
    label: "Artist Resources",
    icon: Layers,
    count: "1,000+",
    description: "DAWs, distribution platforms, AI music tools, education, gear stores, legal resources, and more",
    color: "from-rose-500/20 to-rose-600/10",
    border: "border-rose-400/30",
    iconColor: "text-rose-400",
    image: "https://images.unsplash.com/photo-1598653222000-6b7b7a552625?w=800",
  },
]

export default function CategoriesPage() {
  return (
    <div className="min-h-screen bg-navy-500 pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="eyebrow mb-4 flex items-center justify-center gap-2">
            <div className="h-px w-6 bg-brand-500" />
            ALL CATEGORIES
            <div className="h-px w-6 bg-brand-500" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-heading font-bold text-white mb-4">
            78,000+ Music Industry <span className="text-gradient-gold">Contacts</span>
          </h1>
          <p className="text-warm-400 text-lg leading-relaxed">
            Every type of music industry contact you need — organized by category so you can find and reach the right people faster.
          </p>
        </div>

        {/* Category Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.type}
              href={`/directory?type=${cat.type}`}
              className={`group listing-card rounded-2xl overflow-hidden border ${cat.border} hover:border-brand-500/40 transition-all`}
            >
              <div className="relative h-36 overflow-hidden">
                <img
                  src={cat.image}
                  alt={cat.label}
                  className="w-full h-full object-cover opacity-30 group-hover:opacity-40 group-hover:scale-105 transition-all duration-500"
                />
                <div className={`absolute inset-0 bg-gradient-to-b ${cat.color} via-transparent to-navy-500/60`} />
                <div className="absolute top-4 left-4">
                  <div className={`w-10 h-10 rounded-xl bg-navy-500/70 backdrop-blur-sm border border-warm-700/20 flex items-center justify-center`}>
                    <cat.icon className={`w-5 h-5 ${cat.iconColor}`} />
                  </div>
                </div>
                <div className="absolute top-4 right-4">
                  <span className={`text-xs font-bold ${cat.iconColor} bg-navy-500/70 backdrop-blur-sm px-2.5 py-1 rounded-full border border-warm-700/20`}>
                    {cat.count}
                  </span>
                </div>
              </div>
              <div className="p-5">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-heading font-semibold text-white text-lg group-hover:text-brand-400 transition-colors">
                    {cat.label}
                  </h3>
                  <ArrowRight className="w-4 h-4 text-warm-600 group-hover:text-brand-500 group-hover:translate-x-1 transition-all" />
                </div>
                <p className="text-sm text-warm-400 leading-relaxed">{cat.description}</p>
              </div>
            </Link>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-20 text-center listing-card rounded-2xl p-12 max-w-2xl mx-auto">
          <h2 className="text-2xl font-heading font-bold text-white mb-3">
            Ready to start your outreach?
          </h2>
          <p className="text-warm-400 text-sm mb-6">
            Browse all 78,000+ contacts or search for exactly what you need.
          </p>
          <Link
            href="/directory"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-500 text-navy-900 font-bold text-sm hover:bg-brand-400 transition-all hover:scale-[1.02]"
          >
            Browse Full Database <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  )
}
