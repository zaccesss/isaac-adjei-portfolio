// Skeleton shown while the search page loads.
export default function SearchLoading() {
  return (
    <div className="container max-w-3xl py-24 space-y-10">
      <div className="space-y-3">
        <div className="h-10 w-48 bg-muted rounded animate-pulse" />
        <div className="h-3 w-64 bg-muted rounded animate-pulse" />
      </div>
      <div className="h-10 w-full bg-muted rounded-lg animate-pulse" />
      <div className="space-y-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-16 w-full bg-muted rounded-lg animate-pulse" />
        ))}
      </div>
    </div>
  )
}
