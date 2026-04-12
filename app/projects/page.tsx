import type { Metadata } from "next"
import { projects } from "@/data/projects"
import ProjectGrid from "@/components/projects/ProjectGrid"

export const metadata: Metadata = {
  title: "Projects",
  description: "A collection of my engineering projects — from embedded systems to web applications.",
}

export default function ProjectsPage() {
  return (
    <div className="container py-24 space-y-10">
      <div className="space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">Projects</h1>
        <p className="text-lg text-muted-foreground max-w-2xl">
          Things I&apos;ve built — embedded systems, electronics, software, and more.
        </p>
      </div>
      <ProjectGrid projects={projects} />
    </div>
  )
}
