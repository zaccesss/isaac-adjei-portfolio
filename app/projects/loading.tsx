// Skeleton shown while the projects listing page loads.

import IAMark from "@/components/shared/marks/IAMark"

export default function ProjectsLoading() {
  return (
    <div className="container py-24 space-y-10">
      <div className="space-y-3">
        <IAMark size={40} className="text-muted-foreground/50 animate-pulse" />
        <div className="h-5 w-72 bg-muted rounded animate-pulse" />
      </div>
      <div className="flex gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-8 w-20 bg-muted rounded-full animate-pulse" />
        ))}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-64 bg-muted rounded-2xl animate-pulse" />
        ))}
      </div>
    </div>
  )
}
