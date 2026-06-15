// I present all six role-specific CV variants as a grid so recruiters can immediately download the version most relevant to the position they are hiring for.
// CV Picker sub-page - shows all role-specific CV options
// Linked from the main CV page for visitors wanting a tailored CV

import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft, Download, ExternalLink, FileText, Laptop, Wrench, BarChart3, Cloud, TrendingUp, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"

export const metadata: Metadata = {
  title: "Role-Specific CVs",
  description: "Tailored CVs for Software Engineering, Embedded Systems, Data/AI, DevOps, Quant and Cybersecurity roles.",
  alternates: {
    canonical: "https://www.isaacadjei.me/cv/cv-picker",
  },
}

const cvOptions = [
  {
    id: "software",
    title: "Software Engineering",
    description: "Full-stack web development, React, Next.js, TypeScript, cloud deployment, Node.js and databases.",
    path: "/resume/cv-software.html",
    icon: Laptop,
  },
  {
    id: "embedded",
    title: "Embedded Systems",
    description: "Microcontrollers, Arduino, STM32, PCB design, IoT, hardware-software integration and firmware.",
    path: "/resume/cv-embedded.html",
    icon: Wrench,
  },
  {
    id: "data",
    title: "Data & AI Engineering",
    description: "Python, TensorFlow, PyTorch, data pipelines, machine learning, analytics, SQL and big data.",
    path: "/resume/cv-data.html",
    icon: BarChart3,
  },
  {
    id: "devops",
    title: "DevOps & Cloud",
    description: "AWS, Docker, Kubernetes, CI/CD, infrastructure as code, Terraform and cloud architecture.",
    path: "/resume/cv-devops.html",
    icon: Cloud,
  },
  {
    id: "quant",
    title: "Quantitative Developer",
    description: "C++, Python, algorithm design, high-performance computing, mathematical modelling and HFT.",
    path: "/resume/cv-quant.html",
    icon: TrendingUp,
  },
  {
    id: "security",
    title: "Cybersecurity",
    description: "Secure coding, JWT auth, RBAC, audit logging, vulnerability awareness and penetration testing.",
    path: "/resume/cv-security.html",
    icon: Lock,
  },
]

export default function CVPickerPage() {
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
            <h1 className="text-3xl font-bold tracking-tight">Role-Specific CVs</h1>
            <p className="text-muted-foreground mt-2 max-w-2xl">
              I have tailored my CV to highlight different skill sets for specific engineering roles.
              Please select the version most relevant to the position you are recruiting for.
            </p>
          </div>
        </div>
      </div>

      {/* CV Grid */}
      <div className="container max-w-5xl py-12 px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {cvOptions.map((cv) => (
            <div
              key={cv.id}
              className="group rounded-lg border bg-card p-6 hover:shadow-md transition-all"
            >
              <div className="flex items-start gap-4">
                <div className="rounded-lg bg-primary/10 p-3 shrink-0">
                  <cv.icon className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-xl font-semibold group-hover:text-primary transition-colors">
                    {cv.title}
                  </h2>
                  <p className="text-sm text-muted-foreground mt-2">
                    {cv.description}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button asChild variant="default" size="sm">
                      <a href={cv.path} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="mr-2 h-4 w-4" />
                        View HTML
                      </a>
                    </Button>
                    <Button asChild variant="outline" size="sm">
                      <a href={`/api/cv-${cv.id}-pdf`} download>
                        <Download className="mr-2 h-4 w-4" />
                        PDF
                      </a>
                    </Button>
                    <Button asChild variant="outline" size="sm">
                      <a href={`/api/cv-${cv.id}-word`} download>
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

        {/* General CV Note */}
        <div className="mt-12 rounded-lg border bg-muted/50 p-6 text-center">
          <FileText className="mx-auto h-8 w-8 text-muted-foreground mb-3" />
          <h3 className="font-semibold">Prefer the general version?</h3>
          <p className="text-sm text-muted-foreground mt-1 mb-4">
            My main CV covers all engineering disciplines comprehensively.
          </p>
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
