"use client"

import { useState } from "react"
import { type Project } from "@/data/projects"
import ProjectCard from "./ProjectCard"
import ProjectFilter from "./ProjectFilter"

type Category = Project["category"] | "all"

interface Props {
  projects: Project[]
}

export default function ProjectGrid({ projects }: Props) {
  const [filter, setFilter] = useState<Category>("all")

  const filtered = filter === "all" ? projects : projects.filter((p) => p.category === filter)

  return (
    <div className="space-y-8">
      <ProjectFilter active={filter} onChange={setFilter} />

      {filtered.length === 0 ? (
        <p className="text-muted-foreground text-center py-16">No projects in this category yet.</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </div>
  )
}
