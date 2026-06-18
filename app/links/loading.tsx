// Skeleton shown while the links page loads.

export default function LinksLoading() {
  return (
    <div className="min-h-screen flex flex-col items-center px-4 py-16 space-y-8">
      <div className="h-20 w-20 rounded-full bg-muted animate-pulse" />
      <div className="space-y-2 text-center">
        <div className="h-7 w-36 bg-muted rounded animate-pulse mx-auto" />
        <div className="h-4 w-20 bg-muted rounded animate-pulse mx-auto" />
      </div>
      <div className="h-4 w-72 bg-muted rounded animate-pulse" />
      <div className="flex gap-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-9 w-9 rounded-full bg-muted animate-pulse" />
        ))}
      </div>
      <div className="w-full max-w-md space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-14 bg-muted rounded-xl animate-pulse" />
        ))}
      </div>
    </div>
  )
}
