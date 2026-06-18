// Skeleton shown while a tag results page loads.
export default function TagSlugLoading() {
  return (
    <div className="container max-w-3xl py-24 space-y-8">
      <div className="h-3 w-16 bg-muted rounded animate-pulse" />
      <div className="space-y-2">
        <div className="h-8 w-48 bg-muted rounded animate-pulse" />
        <div className="h-3 w-40 bg-muted rounded animate-pulse" />
      </div>
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="space-y-3">
          <div className="h-4 w-28 bg-muted rounded animate-pulse" />
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, j) => (
              <div key={j} className="h-14 w-full bg-muted rounded-lg animate-pulse" />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
