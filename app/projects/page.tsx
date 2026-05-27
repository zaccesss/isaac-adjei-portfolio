// Projects listing page - shows all projects with category filtering via ProjectGrid.

import type { Metadata } from "next"
import { projects } from "@/data/projects"
import ProjectGrid from "@/components/projects/ProjectGrid"
import ShareButton from "@/components/shared/ShareButton"

export const metadata: Metadata = {
  title: "Projects",
  description:
    "A collection of my engineering projects - from embedded systems to web applications.",
  alternates: {
    canonical: "https://www.isaacadjei.me/projects",
  },
  openGraph: {
    images: ["/api/og?title=Projects&description=A%20collection%20of%20my%20engineering%20projects%20%E2%80%94%20from%20embedded%20systems%20to%20web%20applications%2E"],
  },
}

export default function ProjectsPage() {
  return (
    <div className="container py-24 space-y-10">
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <h1 className="text-4xl font-bold tracking-tight">Projects</h1>
          <ShareButton title="Projects — Isaac Adjei" />
        </div>
        <p className="text-lg text-muted-foreground max-w-2xl">
          Things I&apos;ve built - embedded systems, electronics, software and more.
        </p>
      </div>
      <ProjectGrid projects={projects} />

      <p className="text-sm text-muted-foreground text-center pt-4">
        More projects and courses available on{" "}
        <a
          href="https://github.com/zaccesss"
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline font-medium"
        >
          GitHub
        </a>{" "}
        and{" "}
        <a
          href="https://github.com/zaccesss?tab=projects"
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline font-medium"
        >
          GitHub Projects
        </a>
        .
      </p>
    </div>
  )
}
