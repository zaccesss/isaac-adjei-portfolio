// Skeleton shown while the lab terminal page loads.

export default function LabLoading() {
  return (
    <div className="container max-w-3xl py-24 space-y-8">
      <div className="space-y-3">
        <div className="h-10 w-20 bg-muted rounded animate-pulse" />
        <div className="h-5 w-72 bg-muted rounded animate-pulse" />
      </div>
      <div className="rounded-xl border border-border overflow-hidden">
        <div className="h-10 bg-muted/60 border-b border-border flex items-center px-4 gap-2">
          <div className="h-3 w-3 rounded-full bg-muted-foreground/20 animate-pulse" />
          <div className="h-3 w-3 rounded-full bg-muted-foreground/20 animate-pulse" />
          <div className="h-3 w-3 rounded-full bg-muted-foreground/20 animate-pulse" />
        </div>
        <div className="h-[400px] sm:h-[500px] bg-zinc-950 p-4 space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-4 bg-zinc-800 rounded animate-pulse" style={{ width: `${60 + i * 15}%` }} />
          ))}
        </div>
      </div>
    </div>
  )
}
