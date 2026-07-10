// Skeleton shown while the changelog page loads.

import IAMark from "@/components/shared/marks/IAMark"

export default function ChangelogLoading() {
  return (
    <div className="container max-w-2xl py-24 space-y-14">
      <div className="space-y-3">
        <IAMark size={40} className="text-muted-foreground/50 animate-pulse" />
        <div className="h-5 w-72 bg-muted rounded animate-pulse" />
      </div>
      <div className="space-y-8">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="space-y-3">
            <div className="h-6 w-32 bg-muted rounded animate-pulse" />
            <div className="h-4 w-full bg-muted rounded animate-pulse" />
            <div className="h-4 w-5/6 bg-muted rounded animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  )
}
