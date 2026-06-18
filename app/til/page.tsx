// I am a server component: I fetch published entries and hand them to the client TILList.
import type { Metadata } from "next"
import Link from "next/link"
import { Rss } from "lucide-react"
import { getPublishedTILEntries } from "@/data/til"
import TILList from "@/components/til/TILList"

export const metadata: Metadata = {
  title: "TIL: Today I Learned",
  description:
    "Short notes from across everything I work on as an Electronic Engineering and Computer Science student: embedded firmware and real-time systems, algorithms and data structures, full-stack web, AI and machine learning, cybersecurity and CTFs, computer architecture, hardware design, git and Linux and whatever else catches my attention that week. From piano practice to Ghanaian cooking, faith and fitness. If it surprised me or would have saved me time, it ends up here.",
  alternates: {
    canonical: "https://www.isaacadjei.me/til",
  },
  openGraph: {
    images: [
      "/api/og?title=TIL%3A%20Today%20I%20Learned&description=Short%20notes%20on%20things%20I%20discover%20while%20coding%20and%20building",
    ],
  },
}

export default function TILPage() {
  const entries = getPublishedTILEntries().sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )

  return (
    <div className="container max-w-2xl py-24 space-y-12">
      {/* Header */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold tracking-tight">TIL</h1>
            <p className="text-sm text-muted-foreground font-mono mt-1">Today I Learned</p>
          </div>
          <Link
            href="/til/feed.xml"
            title="RSS feed"
            className="inline-flex items-center gap-1.5 text-base font-medium text-primary hover:text-primary/70 transition-colors shrink-0"
          >
            <Rss className="h-5 w-5 shrink-0" />
            Feed
          </Link>
        </div>
        <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl">
          Things that surprised me, things I had to look up twice, things I wish I had known sooner.
          One discovery at a time.
        </p>
      </div>

      {/* Client component handles search, filter and pagination */}
      <TILList entries={entries} />
    </div>
  )
}
