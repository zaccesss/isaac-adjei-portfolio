// Skeleton shown while the skills page loads.

export default function SkillsLoading() {
  return (
    <div className="container py-24 space-y-14">
      <div className="space-y-3 text-center">
        <div className="h-10 w-32 bg-muted rounded animate-pulse mx-auto" />
        <div className="h-5 w-80 bg-muted rounded animate-pulse mx-auto" />
      </div>
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="space-y-4">
          <div className="h-6 w-40 bg-muted rounded animate-pulse" />
          <div className="flex flex-wrap gap-3">
            {Array.from({ length: 8 }).map((_, j) => (
              <div key={j} className="h-[88px] w-[70px] sm:w-[88px] bg-muted rounded-xl animate-pulse" />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
