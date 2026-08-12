import type { Metadata } from "next"
import { Analytics } from "@vercel/analytics/react"
import "./globals.css"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"
import { AuthProvider } from "@/lib/AuthProvider"

export const metadata: Metadata = {
  title: "Artispreneur — The OS for Independent Artists",
  description:
    "AI-powered workspace for music professionals. Find contacts, write pitches, plan releases, and grow your career — all in one place.",
  icons: {
    icon: "/artispreneur-logo.png",
    apple: "/artispreneur-logo.png",
  },
  openGraph: {
    title: "Artispreneur — The OS for Independent Artists",
    description:
      "AI-powered workspace for music professionals. Find contacts, write pitches, plan releases, and grow your career.",
    type: "website",
  },
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600;700&family=Geist+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen flex flex-col antialiased bg-[#050505]">
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
