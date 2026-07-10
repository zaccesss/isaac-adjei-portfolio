// Skeleton shown while the experience page loads.

import IAMark from "@/components/shared/marks/IAMark"

export default function ExperienceLoading() {
  return (
    <div className="container max-w-3xl py-24 space-y-10">
      <div className="space-y-3">
        <IAMark size={40} className="text-muted-foreground/50 animate-pulse" />
        <div className="h-5 w-64 bg-muted rounded animate-pulse" />
      </div>
      <div className="space-y-8">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex gap-4">
            <div className="h-10 w-10 shrink-0 bg-muted rounded-lg animate-pulse" />
            <div className="flex-1 space-y-2">
              <div className="h-5 w-48 bg-muted rounded animate-pulse" />
              <div className="h-4 w-32 bg-muted rounded animate-pulse" />
              <div className="h-4 w-full bg-muted rounded animate-pulse" />
              <div className="h-4 w-3/4 bg-muted rounded animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
