import { notFound } from "next/navigation"
import { getProject, getProjectTasks } from "../../../actions"
import ProjectDetailClient from "./ProjectDetailClient"

export const dynamic = "force-dynamic"

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const project = await getProject(id)
  return { title: project ? `Projects | ${project.name}` : "Project", robots: "noindex, nofollow" }
}

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const project = await getProject(id)
  if (!project) notFound()
  const tasks = await getProjectTasks(id)
  return <ProjectDetailClient project={project} tasks={tasks} />
}
