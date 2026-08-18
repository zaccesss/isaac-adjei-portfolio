// Dynamic project detail page. Each project's id is used as the URL slug.
// generateStaticParams pre-builds a page for every project at build time.
// generateMetadata returns the correct <title> and description for each project.

import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { projects } from "@/data/projects"
import { supabase } from "@/lib/supabase"
import ProjectDetail from "@/components/projects/ProjectDetail"

// Real hand-logged frequency-response readings, currently only for the audio amplifier. Fetched
// at build time (this route is statically generated) since the readings are historical and do
// not change - a rebuild picks up any new readings logged since the last deploy.
const LAB_PROJECT_LABELS: Record<string, string> = {
  "audio-amplifier": "Two-Stage Audio Amplifier",
}

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
    title: `Project | ${project.title}`,
    description: project.description,
    alternates: {
      canonical: `https://www.isaacadjei.me/projects/${slug}`,
    },
    openGraph: {
      title: `Project | ${project.title}`,
      images: [`/api/og?title=${encodeURIComponent(project.title)}&description=${encodeURIComponent(project.description)}`],
    },
  }
}

export default async function ProjectPage({ params }: Props) {
  const { slug } = await params
  const project = projects.find((p) => p.id === slug)
  if (!project) notFound()

  const labLabel = LAB_PROJECT_LABELS[slug]
  const measurements = labLabel
    ? (
        await supabase
          .from("lab_measurements")
          .select("measurement_set, frequency_hz, magnitude_db, phase_deg")
          .eq("project_label", labLabel)
          .order("frequency_hz", { ascending: true })
      ).data ?? []
    : []

  return <ProjectDetail project={project} measurements={measurements} />
}
