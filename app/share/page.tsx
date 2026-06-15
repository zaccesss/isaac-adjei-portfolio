// I exist purely as a social share target - when this URL is pasted into Twitter/X, LinkedIn
// or WhatsApp, the platform reads the OG tags and renders a rich preview card.
// The versioned image query string (?v=...) forces platforms to re-fetch the preview image
// when it changes rather than serving a months-old cached version.

import type { Metadata } from "next"
import Link from "next/link"
import { ArrowRight, Code, Cpu, Brain } from "lucide-react"

const TITLE = "Isaac Adjei | EE & CS"
const DESCRIPTION =
  "Electronic Engineering and Computer Science student at Aston University. Building full-stack software, embedded systems and AI/ML solutions. Open to internships and placements."

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: "https://www.isaacadjei.me/share",
    type: "website",
    images: ["https://www.isaacadjei.me/opengraph-image?v=20260424b"],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: ["https://www.isaacadjei.me/twitter-image?v=20260424b"],
  },
  alternates: { canonical: "https://www.isaacadjei.me/share" },
  robots: { index: false, follow: false },
}

export default function SharePage() {
  return (
    <main className="container flex min-h-[60vh] items-center justify-center py-16">
      <div className="max-w-lg text-center space-y-6">
        <div className="flex items-center justify-center gap-3 text-muted-foreground">
          <Cpu className="h-5 w-5" />
          <Code className="h-5 w-5" />
          <Brain className="h-5 w-5" />
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Isaac Adjei</h1>
          <p className="text-sm font-mono text-primary uppercase tracking-widest">
            Electronic Engineering &amp; Computer Science
          </p>
        </div>
        <p className="text-muted-foreground leading-relaxed">
          EE &amp; CS student at Aston University building across full-stack software,
          embedded systems and AI/ML. Open to internships and placements.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline underline-offset-4"
        >
          Visit portfolio
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </main>
  )
}
