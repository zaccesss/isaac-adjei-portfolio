// Skeleton shown while a blog post loads.

export default function BlogPostLoading() {
  return (
    <div className="container max-w-2xl py-24 xl:max-w-5xl space-y-8">
      <div className="aspect-[21/9] w-full bg-muted rounded-2xl animate-pulse" />
      <div className="space-y-4">
        <div className="h-4 w-24 bg-muted rounded animate-pulse" />
        <div className="h-9 w-3/4 bg-muted rounded animate-pulse" />
        <div className="h-4 w-48 bg-muted rounded animate-pulse" />
      </div>
      <div className="space-y-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className={`h-4 bg-muted rounded animate-pulse ${i === 5 ? "w-2/3" : "w-full"}`} />
        ))}
      </div>
    </div>
  )
}
