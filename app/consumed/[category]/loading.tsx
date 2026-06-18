// Skeleton shown while a consumed category page loads.
export default function ConsumedCategoryLoading() {
  return (
    <div className="container max-w-5xl py-24 space-y-8">
      <div className="h-3 w-20 bg-muted rounded animate-pulse" />
      <div className="space-y-2">
        <div className="h-8 w-40 bg-muted rounded animate-pulse" />
        <div className="h-3 w-56 bg-muted rounded animate-pulse" />
      </div>
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-32 w-full bg-muted rounded-xl animate-pulse" />
        ))}
      </div>
    </div>
  )
}
