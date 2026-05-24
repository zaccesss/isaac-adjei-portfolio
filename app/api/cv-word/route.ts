// API route that generates and serves the CV as a Word document (.docx) download.
// I read cv.html fresh on every request so the download always reflects the latest CV content.

import { readFileSync } from "fs"
import { join } from "path"
import { NextResponse } from "next/server"
// @ts-expect-error no types for html-to-docx
import HTMLtoDOCX from "html-to-docx"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET() {
  try {
    // I read the HTML source fresh each time so the DOCX always matches the current CV
    const html = readFileSync(join(process.cwd(), "public", "resume", "cv.html"), "utf-8")

    const buffer = await HTMLtoDOCX(html, null, {
      table: { row: { cantSplit: true } },
      footer: false,
      pageNumber: false,
    })

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": 'attachment; filename="Isaac_Adjei_CV.docx"',
        "Cache-Control": "no-store",
      },
    })
  } catch (err) {
    console.error("CV Word generation failed:", err)
    return NextResponse.json({ error: "Failed to generate CV Word document." }, { status: 500 })
  }
}
