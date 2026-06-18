// Skeleton shown while a consumed item detail page loads.
export default function ConsumedSlugLoading() {
  return (
    <div className="container max-w-2xl py-24 space-y-8">
      <div className="h-3 w-28 bg-muted rounded animate-pulse" />
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="h-5 w-16 bg-muted rounded-full animate-pulse" />
          <div className="h-3 w-20 bg-muted rounded animate-pulse" />
        </div>
        <div className="h-8 w-3/4 bg-muted rounded animate-pulse" />
        <div className="h-3 w-32 bg-muted rounded animate-pulse" />
      </div>
      <div className="h-48 w-full bg-muted rounded-xl animate-pulse" />
      <div className="space-y-2">
        <div className="h-3 w-full bg-muted rounded animate-pulse" />
        <div className="h-3 w-5/6 bg-muted rounded animate-pulse" />
        <div className="h-3 w-4/6 bg-muted rounded animate-pulse" />
      </div>
    </div>
  )
}
