// CV page - reads cv.html from the public folder at request time (server component)
// and passes the raw HTML string down to CVViewer which renders it in an iframe.
// Reading the file on the server avoids a client-side fetch and keeps the CV private
// from direct public URL access when needed.

import type { Metadata } from "next"
import { readFileSync } from "fs"
import { join } from "path"
import CVViewer from "@/components/cv/CVViewer"

export const metadata: Metadata = {
  title: "CV | Isaac Adjei",
  description: "View and print Isaac Adjei's CV.",
  alternates: {
    canonical: "https://www.isaacadjei.me/cv",
  },
}

export default function CVPage() {
  const cvHtml = readFileSync(join(process.cwd(), "public", "resume", "cv.html"), "utf-8")
  return <CVViewer cvHtml={cvHtml} />
}
