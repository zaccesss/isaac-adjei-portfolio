// Skeleton shown while the research and publications page loads.

export default function RespubLoading() {
  return (
    <div className="container max-w-3xl py-24 space-y-16">
      <div className="space-y-4">
        <div className="h-10 w-56 bg-muted rounded animate-pulse" />
        <div className="h-5 w-full bg-muted rounded animate-pulse" />
        <div className="h-5 w-3/4 bg-muted rounded animate-pulse" />
      </div>
      <div className="space-y-6">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="h-48 bg-muted rounded-2xl animate-pulse" />
        ))}
      </div>
    </div>
  )
}
