// Experience page - splits the experiences array into professional entries
// and volunteering entries by ID, then renders each group in its own timeline.
// The IDs are hardcoded in a Set here since the volunteering split is specific to this page.

import type { Metadata } from "next"
import Link from "next/link"
import { Download, ArrowRight } from "lucide-react"
import { experiences, isExperienceVisible } from "@/data/experience"
import ExperienceTimeline from "@/components/sections/ExperienceTimeline"
import { Button } from "@/components/ui/button"

// This page is static by default; a visibleFrom-gated entry (see data/experience.ts) needs the
// real clock re-checked periodically rather than only at build time or it stays hidden past its
// date until the next deploy. An hourly revalidate is the cheap way to get that self-correcting
// without making every visit a full dynamic render, matching how live-status caching already
// balances freshness against Vercel Fluid Compute cost on this site.
export const revalidate = 3600

export const metadata: Metadata = {
  title: "Experience",
  description: "My work experience, internships and virtual programmes.",
  alternates: {
    canonical: "https://www.isaacadjei.me/experience",
  },
  openGraph: {
    images: ["/api/og?title=Experience&description=My%20work%20experience%2C%20internships%20and%20professional%20programmes%2E"],
  },
}

export default function ExperiencePage() {
  const volunteeringIds = new Set(["targetjobs-judge", "cancer-research-volunteer"])
  const visibleExperiences = experiences.filter(isExperienceVisible)
  const professionalExperiences = visibleExperiences.filter((exp) => !volunteeringIds.has(exp.id))
  const volunteeringExperiences = visibleExperiences.filter((exp) => volunteeringIds.has(exp.id))

  return (
    <div className="container max-w-3xl py-24 space-y-10">
      <div className="space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">Experience</h1>
        <p className="text-lg text-muted-foreground">
          Work history, internships, professional programmes and volunteering.
        </p>
      </div>
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight">Professional Experience</h2>
        <ExperienceTimeline experiences={professionalExperiences} />
      </div>

      <div className="space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight">Volunteering</h2>
        <ExperienceTimeline experiences={volunteeringExperiences} />
      </div>

      <div className="flex flex-col sm:flex-row gap-3 pt-4 justify-center">
        <Button
          asChild
          size="lg"
          className="bg-gray-900 text-white hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100"
        >
          <a href="/api/cv-pdf">
            <Download className="mr-2 h-4 w-4" />
            Download CV
          </a>
        </Button>
        <Button asChild size="lg" variant="outline">
          <Link href="/projects">
            View My Work
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
        <Button asChild size="lg">
          <Link href="/contact">
            Get in touch
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  )
}
