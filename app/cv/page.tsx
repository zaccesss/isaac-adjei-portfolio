import type { Metadata } from "next"
import { readFileSync } from "fs"
import { join } from "path"
import CVViewer from "@/components/cv/CVViewer"

export const metadata: Metadata = {
  title: "CV | Isaac Adjei",
  description: "View and print Isaac Adjei's CV.",
}

export default function CVPage() {
  const cvHtml = readFileSync(join(process.cwd(), "public", "resume", "cv.html"), "utf-8")
  return <CVViewer cvHtml={cvHtml} />
}
