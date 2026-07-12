// I wrap every page here with global metadata, Geist fonts, ThemeProvider and a floating CommandMenu.

import type { Metadata, Viewport } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import "./globals.css"
import "@/styles/animations.css"
import PublicShell from "@/components/layout/PublicShell"
import CommandMenu from "@/components/shared/CommandMenu"
import FaviconAnimator from "@/components/shared/FaviconAnimator"
import { ThemeProvider } from "@/components/providers/ThemeProvider"
import { SITE_URL } from "@/lib/constants"
import { Analytics } from "@vercel/analytics/next"
import SiteAnalytics from "@/components/shared/Analytics"

const GA_ID = process.env.NEXT_PUBLIC_GA_ID
const CF_BEACON_TOKEN = process.env.NEXT_PUBLIC_CF_BEACON_TOKEN

// ─── Schema.org structured data ─────────────────────────────────────────────
// Injected as a JSON-LD script tag in the <body>.
// Tells search engines (Google, Bing, etc.) that this is a Person page.
// sameAs links connect this identity to GitHub and LinkedIn for knowledge graph
// disambiguation. Data is fully static so dangerouslySetInnerHTML is safe here.
const personSchema = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Isaac Adjei",
  url: SITE_URL,
  jobTitle: "Electronic Engineering and Computer Science Student",
  alumniOf: {
    "@type": "CollegeOrUniversity",
    name: "Aston University",
  },
  sameAs: ["https://github.com/zaccesss", "https://linkedin.com/in/isaacadjei"],
}

export const viewport: Viewport = { width: "device-width", initialScale: 1 }

export const metadata: Metadata = {
  // Use the live canonical host consistently.
  // All absolute OG/Twitter image URLs resolve relative to this base.
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Isaac Adjei | EECS",
    template: "%s | Isaac Adjei",
  },
  // Description length target: 140-160 characters for optimal search snippets.
  description:
    "Electronic Engineering and Computer Science student at Aston University, Birmingham. Building full-stack software, embedded systems, AI/ML and data science solutions from concept to deployment.",
  keywords: [
    "Isaac Adjei",
    "Zac",
    "Zacess",
    "Electronic Engineering",
    "Computer Science",
    "Aston University",
    "Embedded Systems",
    "AI",
    "Machine Learning",
    "Data Science",
  ],
  authors: [{ name: "Isaac Adjei" }],
  creator: "Isaac Adjei",
  // Tell crawlers to index and follow all links (explicit is better than implicit)
  robots: {
    index: true,
    follow: true,
  },
  // Favicon + apple-touch icon come from the app/icon.svg and app/apple-icon.tsx
  // file conventions, so there is no manual icons block to keep in sync.
  manifest: "/manifest.webmanifest",
  openGraph: {
    type: "website",
    locale: "en_GB",
    url: SITE_URL,
    title: "Isaac Adjei | EECS",
    description:
      "Electronic Engineering and Computer Science student building full-stack software, embedded systems, AI/ML and data science solutions.",
    siteName: "Isaac Adjei Portfolio",
    images: [{
      url: "/api/og?title=Isaac%20Adjei&description=Electronic%20Engineering%20and%20Computer%20Science%20Student",
      width: 1200,
      height: 630,
      alt: "Isaac Adjei - Electronic Engineering and Computer Science Student",
    }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Isaac Adjei | EECS",
    description:
      "Electronic Engineering and Computer Science student building full-stack software, embedded systems, AI/ML and data science solutions.",
    images: ["/api/og?title=Isaac%20Adjei&description=Electronic%20Engineering%20and%20Computer%20Science%20Student"],
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link
          rel="alternate"
          type="application/rss+xml"
          title="Isaac Adjei"
          href="/blog/feed.xml"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
        />
        {/* Both analytics scripts live in a pathname-aware client component so they never
            load on /dashboard - my own traffic skews the stats. */}
        <SiteAnalytics gaId={GA_ID} cfToken={CF_BEACON_TOKEN} />
      </head>
      <body
        suppressHydrationWarning
        className={`${GeistSans.variable} ${GeistMono.variable} font-sans antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <PublicShell>{children}</PublicShell>
          <CommandMenu />
          <FaviconAnimator />
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  )
}
