// API route that serves the CV as a PDF download.
// On Vercel the static Isaac_Adjei_CV.pdf is always served — it is regenerated
// from cv.html locally and committed whenever the CV changes, so it is always
// up to date. The Puppeteer live-generation path is kept as a bonus for local
// dev but is not relied on in production (Vercel Hobby has a 10 s timeout that
// Chromium startup reliably exceeds).

import { readFileSync } from "fs"
import { join } from "path"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET() {
  // Always serve the static PDF — it is committed alongside cv.html and is
  // regenerated every time the CV is updated, so it is never stale.
  try {
    const pdfPath = join(process.cwd(), "public", "resume", "Isaac_Adjei_CV.pdf")
    const pdf = readFileSync(pdfPath)

    return new Response(pdf, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="Isaac_Adjei_CV.pdf"',
        "Cache-Control": "no-store",
      },
    })
  } catch (err) {
    console.error("CV PDF serve failed:", err)
    return Response.json({ error: "Failed to serve CV PDF." }, { status: 500 })
  }
}
