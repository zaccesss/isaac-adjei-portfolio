// Skeleton shown while a TIL slug page loads.
export default function TILSlugLoading() {
  return (
    <div className="container max-w-2xl py-24 space-y-8">
      <div className="h-3 w-20 bg-muted rounded animate-pulse" />
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="h-5 w-16 bg-muted rounded-full animate-pulse" />
          <div className="h-3 w-24 bg-muted rounded animate-pulse" />
        </div>
        <div className="h-8 w-3/4 bg-muted rounded animate-pulse" />
      </div>
      <div className="space-y-2">
        <div className="h-3 w-full bg-muted rounded animate-pulse" />
        <div className="h-3 w-5/6 bg-muted rounded animate-pulse" />
        <div className="h-3 w-4/6 bg-muted rounded animate-pulse" />
      </div>
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="h-4 w-1/3 bg-muted rounded animate-pulse" />
            <div className="h-3 w-full bg-muted rounded animate-pulse" />
            <div className="h-3 w-5/6 bg-muted rounded animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  )
}
