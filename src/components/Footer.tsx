export default function Footer() {
  return (
    <footer className="border-t border-white/[0.06] bg-[#050505]">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
          <div>
            <span className="text-sm font-semibold text-[#f7f8f8]">Artispreneur</span>
            <p className="text-[13px] text-white/40 mt-3 leading-relaxed max-w-[180px]">
              The operating system for independent artists.
            </p>
          </div>
          {[
            {
              title: "Product",
              links: ["Features", "Pricing", "Changelog", "API"],
            },
            {
              title: "Resources",
              links: ["Directory", "Playlists", "Blog", "Help Center"],
            },
            {
              title: "Company",
              links: ["About", "Careers", "Contact", "Privacy"],
            },
          ].map((col) => (
            <div key={col.title}>
              <h4 className="text-[13px] font-semibold text-[#f7f8f8] mb-4">
                {col.title}
              </h4>
              <ul className="space-y-2.5">
                {col.links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-[13px] text-white/40 hover:text-white/80 transition-colors"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 pt-8 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[12px] text-white/25">
            &copy; {new Date().getFullYear()} Artispreneur. All rights reserved.
          </p>
          <p className="text-[12px] text-white/25">Art Means Business.</p>
        </div>
      </div>
    </footer>
  )
}
