// Dynamic project detail page. Each project's id is used as the URL slug.
// generateStaticParams pre-builds a page for every project at build time.
// generateMetadata returns the correct <title> and description for each project.

import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { projects } from "@/data/projects"
import ProjectDetail from "@/components/projects/ProjectDetail"

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  return projects.map((project) => ({ slug: project.id }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const project = projects.find((p) => p.id === slug)
  if (!project) return {}
  return {
    title: project.title,
    description: project.description,
    alternates: {
      canonical: `https://isaacadjei.me/projects/${slug}`,
    },
  }
}

export default async function ProjectPage({ params }: Props) {
  const { slug } = await params
  const project = projects.find((p) => p.id === slug)
  if (!project) notFound()
  return <ProjectDetail project={project} />
}
