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
  }
}

export default async function ProjectPage({ params }: Props) {
  const { slug } = await params
  const project = projects.find((p) => p.id === slug)
  if (!project) notFound()
  return <ProjectDetail project={project} />
}
