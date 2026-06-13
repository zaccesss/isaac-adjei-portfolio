"use client"

// I display my primary CV in an iframe and offer PDF, Word and print download options.
// The iframe embeds /resume/cv.html directly - security headers allow same-origin framing.
// Print opens the HTML in a new tab so the browser's native print dialog works.

import Link from "next/link"
import { Download, FileText, Printer, ExternalLink, ChevronRight, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import ShareButton from "@/components/shared/ShareButton"

export default function CVPage() {
  const handlePrint = () => {
    // I open the HTML file in a new tab and trigger print from there because
    // calling iframe.contentWindow.print() is blocked by same-origin scripting
    // restrictions in some browsers even when the frame is same-origin.
    const win = window.open("/resume/cv.html", "_blank")
    win?.addEventListener("load", () => win.print())
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header Section */}
      <div className="border-b bg-card">
        <div className="container max-w-5xl py-8 px-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Curriculum Vitae</h1>
              <p className="text-muted-foreground mt-1">
                Electronic Engineering & Computer Science student at Aston University
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button asChild variant="default" size="sm">
                <a href="/api/cv-pdf" download>
                  <Download className="mr-2 h-4 w-4" />
                  PDF
                </a>
              </Button>
              <Button asChild variant="outline" size="sm">
                <a href="/api/cv-word" download>
                  <FileText className="mr-2 h-4 w-4" />
                  Word
                </a>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrint}
              >
                <Printer className="mr-2 h-4 w-4" />
                Print
              </Button>
              <Button asChild variant="outline" size="sm">
                <a href="/resume/cv.html" target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  HTML
                </a>
              </Button>
              <ShareButton title="Isaac (Zac) Adjei - CV" />
            </div>
          </div>
        </div>
      </div>

      {/* CV Preview */}
      <div className="container max-w-5xl py-8 px-4">
        <div className="rounded-lg border bg-white shadow-sm overflow-hidden">
          <iframe
            src="/resume/cv.html"
            className="w-full h-[800px] md:h-[1000px]"
            title="Isaac (Zac) Adjei CV"
          />
        </div>

        {/* CV Picker Card */}
        <div className="mt-8 rounded-lg border bg-card p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="rounded-lg bg-primary/10 p-3">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Looking for a specific role?</h2>
                <p className="text-sm text-muted-foreground mt-1 max-w-lg">
                  I have tailored CVs for different engineering specialisations.
                  Select the version that best matches the position you are recruiting for.
                </p>
              </div>
            </div>
            <Button asChild variant="outline" className="shrink-0">
              <Link href="/cv/cv-picker">
                Browse Role-Specific CVs
                <ChevronRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>

        {/* Cover Letters Card */}
        <div className="mt-4 rounded-lg border bg-card p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="rounded-lg bg-secondary p-3">
                <Mail className="h-6 w-6 text-secondary-foreground" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Need a cover letter?</h2>
                <p className="text-sm text-muted-foreground mt-1 max-w-lg">
                  Download tailored cover letter templates for each specialisation.
                  Edit in Word to personalise for your application.
                </p>
              </div>
            </div>
            <Button asChild variant="outline" className="shrink-0">
              <Link href="/cv/cover-letters">
                Browse Cover Letters
                <ChevronRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>

      </div>
    </div>
  )
}
