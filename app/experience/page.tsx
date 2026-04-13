import type { Metadata } from "next"
import { Download } from "lucide-react"
import { experiences } from "@/data/experience"
import ExperienceTimeline from "@/components/sections/ExperienceTimeline"
import { Button } from "@/components/ui/button"

export const metadata: Metadata = {
  title: "Experience",
  description: "My work experience, internships and virtual programmes.",
}

export default function ExperiencePage() {
  return (
    <div className="container max-w-3xl py-24 space-y-10">
      <div className="space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">Experience</h1>
        <p className="text-lg text-muted-foreground">
          Work history, internships and professional programmes.
        </p>
        <div className="pt-2">
          <Button asChild className="bg-gray-900 text-white hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100">
            <a href="/resume/Isaac_Adjei_CV.pdf" download>
              <Download className="mr-2 h-4 w-4" />
              Download CV
            </a>
          </Button>
        </div>
      </div>
      <ExperienceTimeline experiences={experiences} />
    </div>
  )
}
