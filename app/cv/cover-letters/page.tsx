// I list all seven cover letter variants so recruiters can download a ready-to-send PDF or an editable Word version for each discipline.

import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft, ExternalLink, FileText, Download, Edit3, Laptop, Wrench, BarChart3, Cloud, TrendingUp, Lock, File } from "lucide-react"
import { Button } from "@/components/ui/button"

export const metadata: Metadata = {
  title: "Cover Letter Templates",
  description: "Tailored cover letter templates for Software Engineering, Embedded Systems, Data/AI, DevOps, Quant and Cybersecurity roles.",
  alternates: {
    canonical: "https://www.isaacadjei.me/cv/cover-letters",
  },
}

const coverLetters = [
  {
    id: "general",
    title: "General Engineering",
    description: "Versatile cover letter suitable for any engineering or technology role",
    path: "/resume/cover-letter-general.html",
    icon: File,
    isPrimary: true,
  },
  {
    id: "software",
    title: "Software Engineering",
    description: "Highlights full-stack development, modern frameworks and software architecture skills",
    path: "/resume/cover-letter-software.html",
    icon: Laptop,
  },
  {
    id: "embedded",
    title: "Embedded Systems",
    description: "Focuses on hardware-software integration, microcontrollers and IoT experience",
    path: "/resume/cover-letter-embedded.html",
    icon: Wrench,
  },
  {
    id: "data",
    title: "Data & AI Engineering",
    description: "Emphasises machine learning, data pipelines and analytics capabilities",
    path: "/resume/cover-letter-data.html",
    icon: BarChart3,
  },
  {
    id: "devops",
    title: "DevOps & Cloud",
    description: "Showcases infrastructure, CI/CD and cloud platform expertise",
    path: "/resume/cover-letter-devops.html",
    icon: Cloud,
  },
  {
    id: "quant",
    title: "Quantitative Developer",
    description: "Targets quantitative finance roles with emphasis on algorithms and performance",
    path: "/resume/cover-letter-quant.html",
    icon: TrendingUp,
  },
  {
    id: "security",
    title: "Cybersecurity",
    description: "Highlights security mindset, secure coding practices and audit experience",
    path: "/resume/cover-letter-security.html",
    icon: Lock,
  },
]

export default function CoverLettersPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container max-w-5xl py-8 px-4">
          <div className="flex items-center gap-4">
            <Button asChild variant="ghost" size="sm">
              <Link href="/cv">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Main CV
              </Link>
            </Button>
          </div>
          <div className="mt-6">
            <h1 className="text-3xl font-bold tracking-tight">Cover Letter Templates</h1>
            <p className="text-muted-foreground mt-2 max-w-2xl">
              Tailored cover letters for each engineering discipline. Download as PDF to send or as Word to customise.
            </p>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="container max-w-5xl py-6 px-4">
        <div className="rounded-lg border bg-muted/30 p-4 flex items-start gap-3">
          <Edit3 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
          <div className="text-sm">
            <p className="font-medium">How to use:</p>
            <ol className="text-muted-foreground mt-1 space-y-1 list-decimal list-inside">
              <li>Download the Word (.docx) version to customise with company name and role title</li>
              <li>Or download the PDF version to send directly</li>
              <li>Replace all highlighted placeholders before sending</li>
            </ol>
          </div>
        </div>
      </div>

      {/* Cover Letter Grid */}
      <div className="container max-w-5xl pb-12 px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {coverLetters.map((letter) => (
            <div
              key={letter.id}
              className={`group rounded-lg border p-5 hover:shadow-md transition-all ${
                letter.isPrimary ? "bg-primary/5 border-primary/20" : "bg-card"
              }`}
            >
              <div className="flex items-start gap-4">
                <div className="rounded-lg bg-primary/10 p-3 shrink-0">
                  <letter.icon className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h2 className="font-semibold group-hover:text-primary transition-colors">
                      {letter.title}
                    </h2>
                    {letter.isPrimary && (
                      <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                        Default
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {letter.description}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button asChild variant="default" size="sm">
                      <a href={letter.path} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="mr-2 h-4 w-4" />
                        View
                      </a>
                    </Button>
                    <Button asChild variant="outline" size="sm">
                      <a href={`/api/cover-letter/${letter.id}/pdf`} download>
                        <Download className="mr-2 h-4 w-4" />
                        PDF
                      </a>
                    </Button>
                    <Button asChild variant="outline" size="sm">
                      <a href={`/api/cover-letter/${letter.id}/docx`} download>
                        <FileText className="mr-2 h-4 w-4" />
                        Word
                      </a>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Back to CV */}
        <div className="mt-8 flex justify-center">
          <Button asChild variant="outline">
            <Link href="/cv">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Return to Main CV
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
