// Skeleton shown while the uses page loads.

export default function UsesLoading() {
  return (
    <div className="container max-w-2xl py-24 space-y-14">
      <div className="space-y-3">
        <div className="h-10 w-24 bg-muted rounded animate-pulse" />
        <div className="h-5 w-72 bg-muted rounded animate-pulse" />
      </div>
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="space-y-4">
          <div className="h-6 w-32 bg-muted rounded animate-pulse" />
          {Array.from({ length: 3 }).map((_, j) => (
            <div key={j} className="flex gap-3">
              <div className="h-10 w-10 shrink-0 bg-muted rounded-lg animate-pulse" />
              <div className="flex-1 space-y-1.5">
                <div className="h-4 w-32 bg-muted rounded animate-pulse" />
                <div className="h-4 w-full bg-muted rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}
