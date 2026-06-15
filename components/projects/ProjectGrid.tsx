"use client"

// I combine ProjectFilter, pagination and the project grid in one component.
// I derive the filtered list from the full projects array every render - no extra state needed.
// If no projects match the selected category, a short message is shown instead of an empty grid.

import { useState } from "react"
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react"
import { type Project } from "@/data/projects"
import ProjectCard from "./ProjectCard"
import ProjectFilter from "./ProjectFilter"

type Category = Project["category"] | "all"

const PER_PAGE = 9

interface Props {
  projects: Project[]
}

export default function ProjectGrid({ projects }: Props) {
  const [filter, setFilter] = useState<Category>("all")
  const [page, setPage] = useState(1)

  const filtered = filter === "all" ? projects : projects.filter((p) => p.category === filter)
  const totalPages = Math.ceil(filtered.length / PER_PAGE)
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE)

  function handleFilter(next: Category) {
    setFilter(next)
    setPage(1)
  }

  return (
    <div className="space-y-8">
      <ProjectFilter active={filter} onChange={handleFilter} />

      {filtered.length === 0 ? (
        <p className="text-muted-foreground text-center py-16">No projects in this category yet.</p>
      ) : (
        <>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {paginated.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-1 pt-4">
              <button type="button" onClick={() => setPage(1)} disabled={page === 1} aria-label="First page" className="p-2 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-muted/40 disabled:opacity-40 disabled:pointer-events-none transition-colors">
                <ChevronsLeft className="h-4 w-4" />
              </button>
              <button type="button" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} aria-label="Previous page" className="p-2 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-muted/40 disabled:opacity-40 disabled:pointer-events-none transition-colors">
                <ChevronLeft className="h-4 w-4" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                <button key={n} type="button" onClick={() => setPage(n)} aria-label={`Page ${n}`} aria-current={n === page ? "page" : undefined} className={`min-w-[2rem] h-8 px-2 rounded-lg border text-sm font-medium transition-colors ${n === page ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:text-foreground hover:bg-muted/40"}`}>
                  {n}
                </button>
              ))}
              <button type="button" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} aria-label="Next page" className="p-2 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-muted/40 disabled:opacity-40 disabled:pointer-events-none transition-colors">
                <ChevronRight className="h-4 w-4" />
              </button>
              <button type="button" onClick={() => setPage(totalPages)} disabled={page === totalPages} aria-label="Last page" className="p-2 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-muted/40 disabled:opacity-40 disabled:pointer-events-none transition-colors">
                <ChevronsRight className="h-4 w-4" />
              </button>
            </div>
          )}

          <p className="text-center text-xs text-muted-foreground">
            Showing {(page - 1) * PER_PAGE + 1}-{Math.min(page * PER_PAGE, filtered.length)} of {filtered.length} projects
          </p>
        </>
      )}
    </div>
  )
}
