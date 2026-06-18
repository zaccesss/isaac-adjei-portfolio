// Skeleton shown while the tags index page loads.
export default function TagsLoading() {
  return (
    <div className="container max-w-3xl py-24 space-y-8">
      <div className="space-y-3">
        <div className="h-10 w-32 bg-muted rounded animate-pulse" />
        <div className="h-3 w-72 bg-muted rounded animate-pulse" />
      </div>
      <div className="h-10 w-full bg-muted rounded-lg animate-pulse" />
      <div className="flex flex-wrap gap-2">
        {Array.from({ length: 24 }).map((_, i) => (
          <div
            key={i}
            className="h-7 bg-muted rounded-full animate-pulse"
            style={{ width: `${60 + (i % 5) * 20}px` }}
          />
        ))}
      </div>
    </div>
  )
}
