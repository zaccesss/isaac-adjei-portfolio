// Skeleton shown while the notes page loads.

export default function NotesLoading() {
  return (
    <div className="container max-w-3xl py-24 space-y-16">
      <div className="space-y-3">
        <div className="h-10 w-28 bg-muted rounded animate-pulse" />
        <div className="h-5 w-80 bg-muted rounded animate-pulse" />
      </div>
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-32 bg-muted rounded-2xl animate-pulse" />
        ))}
      </div>
    </div>
  )
}
