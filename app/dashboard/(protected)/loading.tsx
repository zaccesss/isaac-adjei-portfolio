// Skeleton shown while a protected dashboard section loads.

export default function DashboardLoading() {
  return (
    <div className="flex h-screen">
      <div className="w-64 border-r border-border bg-card shrink-0 animate-pulse hidden md:block" />
      <div className="flex-1 p-4 md:p-8 space-y-4">
        <div className="h-8 w-48 bg-muted rounded animate-pulse" />
        <div className="h-4 w-full bg-muted rounded animate-pulse" />
        <div className="h-4 w-3/4 bg-muted rounded animate-pulse" />
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-32 bg-muted rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  )
}
