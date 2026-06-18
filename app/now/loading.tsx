// Skeleton shown while the now page loads.

export default function NowLoading() {
  return (
    <div className="container max-w-2xl py-24 space-y-14">
      <div className="space-y-3">
        <div className="h-10 w-24 bg-muted rounded animate-pulse" />
        <div className="h-5 w-64 bg-muted rounded animate-pulse" />
      </div>
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="space-y-3">
          <div className="h-6 w-36 bg-muted rounded animate-pulse" />
          <div className="h-4 w-full bg-muted rounded animate-pulse" />
          <div className="h-4 w-4/5 bg-muted rounded animate-pulse" />
          <div className="h-4 w-3/4 bg-muted rounded animate-pulse" />
        </div>
      ))}
    </div>
  )
}
