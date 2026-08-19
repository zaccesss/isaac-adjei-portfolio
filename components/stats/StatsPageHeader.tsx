import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export function StatsPageHeader({ title, description }: { title: string; description: string }) {
  return (
    <div className="space-y-4">
      <Link
        href="/stats"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to Stats
      </Link>
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        <p className="text-muted-foreground">{description}</p>
      </div>
    </div>
  )
}
