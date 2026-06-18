// Skeleton shown while the TIL listing page loads.

export default function TILLoading() {
  return (
    <div className="container max-w-2xl py-24 space-y-12">
      <div className="space-y-3">
        <div className="h-10 w-16 bg-muted rounded animate-pulse" />
        <div className="h-5 w-64 bg-muted rounded animate-pulse" />
      </div>
      <div className="h-10 w-full bg-muted rounded-lg animate-pulse" />
      <div className="space-y-4">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 py-2 border-b border-border/40">
            <div className="h-5 w-16 bg-muted rounded-full animate-pulse shrink-0" />
            <div className="h-4 w-24 bg-muted rounded animate-pulse shrink-0" />
            <div className="h-4 flex-1 bg-muted rounded animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  )
}
