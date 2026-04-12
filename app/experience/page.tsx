import type { Metadata } from "next"
import { experiences } from "@/data/experience"
import ExperienceTimeline from "@/components/sections/ExperienceTimeline"

export const metadata: Metadata = {
  title: "Experience",
  description: "My work experience, internships, and virtual programmes.",
}

export default function ExperiencePage() {
  return (
    <div className="container max-w-3xl py-24 space-y-10">
      <div className="space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">Experience</h1>
        <p className="text-lg text-muted-foreground">
          Work history, internships, and professional programmes.
        </p>
      </div>
      <ExperienceTimeline experiences={experiences} />
    </div>
  )
}
