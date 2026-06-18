// Skeleton shown while the consumed overview page loads.
export default function ConsumedLoading() {
  return (
    <div className="container max-w-5xl py-24 space-y-8">
      <div className="space-y-3">
        <div className="h-10 w-48 bg-muted rounded animate-pulse" />
        <div className="h-3 w-72 bg-muted rounded animate-pulse" />
      </div>
      <div className="flex gap-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-8 w-20 bg-muted rounded-full animate-pulse" />
        ))}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-40 w-full bg-muted rounded-xl animate-pulse" />
        ))}
      </div>
    </div>
  )
}
