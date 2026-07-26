import type { Metadata } from "next"
import { Analytics } from "@vercel/analytics/react"
import "./globals.css"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"
import { AuthProvider } from "@/lib/AuthProvider"

export const metadata: Metadata = {
  title: "Artispreneur — The Music Industry Database",
  description:
    "The largest, most comprehensive music industry database. Free access to 78,000+ verified contacts for independent artists, labels, managers and more. Radio stations, playlists, venues, blogs, and press worldwide.",
  keywords: ["music industry database", "music contacts", "independent artists", "playlist submissions", "radio promotion", "music venues", "record labels"],
  icons: {
    icon: "/artispreneur-logo.png",
    apple: "/artispreneur-logo.png",
  },
  openGraph: {
    title: "Artispreneur — The Music Industry Database",
    description: "The largest, most comprehensive music industry database for independent artists, labels, managers and more. 78,000+ verified contacts worldwide.",
    type: "website",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="min-h-screen flex flex-col antialiased">
        <AuthProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  )
}
