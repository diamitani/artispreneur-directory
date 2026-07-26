import type { Metadata } from "next"
import { Analytics } from "@vercel/analytics/react"
import "./globals.css"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"
import { AuthProvider } from "@/lib/AuthProvider"

export const metadata: Metadata = {
  title: "Artispreneur — The Music Industry Database",
  description:
    "The largest, most comprehensive music industry database. Free access to 79,000+ verified contacts for independent artists, labels, managers and more. Radio stations, playlists, venues, blogs, and press worldwide.",
  keywords: ["music industry database", "music contacts", "independent artists", "playlist submissions", "radio promotion", "music venues", "record labels"],
  icons: {
    icon: "/artispreneur-logo.png",
    apple: "/artispreneur-logo.png",
  },
  openGraph: {
    title: "Artispreneur — The Music Industry Database",
    description: "The largest, most comprehensive music industry database for independent artists. 79,000+ verified contacts worldwide.",
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
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;0,800;0,900;1,400;1,700&family=Lato:wght@300;400;700;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen flex flex-col antialiased bg-[#F9F6EF]">
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
