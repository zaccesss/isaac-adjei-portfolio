import Link from "next/link"
import { ChevronLeft } from "lucide-react"
import MusicAnalyticsClient from "./MusicAnalyticsClient"

export const dynamic = "force-dynamic"
export const metadata = { title: "Music Analytics", robots: "noindex, nofollow" }

export default function MusicAnalyticsPage() {
  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="flex items-center gap-2 px-4 pt-4 pb-2 shrink-0">
        <Link
          href="/dashboard/analytics/applications"
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
          title="Back to analytics"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          Analytics
        </Link>
        <span className="text-xs text-muted-foreground">/</span>
        <span className="text-xs font-medium">Music</span>
        <span className="ml-auto text-[10px] font-mono text-muted-foreground/60">from Spotify</span>
      </div>
      <div className="flex-1 overflow-auto px-4 pb-4">
        <MusicAnalyticsClient />
      </div>
    </div>
  )
}
