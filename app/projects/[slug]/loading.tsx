// Skeleton shown while a project detail page loads.

export default function ProjectSlugLoading() {
  return (
    <div className="container max-w-3xl py-24 space-y-10">
      <div className="h-8 w-24 bg-muted rounded animate-pulse" />

      <div className="space-y-4">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="h-5 w-20 bg-muted rounded-full animate-pulse" />
          <div className="h-5 w-16 bg-muted rounded-full animate-pulse" />
          <div className="h-4 w-24 bg-muted rounded animate-pulse" />
        </div>
        <div className="h-10 w-2/3 bg-muted rounded animate-pulse" />
        <div className="h-5 w-full bg-muted rounded animate-pulse" />
        <div className="flex gap-3 pt-2">
          <div className="h-9 w-28 bg-muted rounded animate-pulse" />
          <div className="h-9 w-28 bg-muted rounded animate-pulse" />
        </div>
      </div>

      <div className="space-y-6">
        <div className="space-y-3">
          <div className="h-6 w-24 bg-muted rounded animate-pulse" />
          <div className="space-y-2">
            <div className="h-4 w-full bg-muted rounded animate-pulse" />
            <div className="h-4 w-5/6 bg-muted rounded animate-pulse" />
            <div className="h-4 w-4/6 bg-muted rounded animate-pulse" />
          </div>
        </div>

        <div className="space-y-3">
          <div className="h-6 w-32 bg-muted rounded animate-pulse" />
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-4 w-5/6 bg-muted rounded animate-pulse" />
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <div className="h-6 w-28 bg-muted rounded animate-pulse" />
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-6 w-16 bg-muted rounded-full animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
