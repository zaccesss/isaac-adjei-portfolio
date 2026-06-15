// I serve the general software engineering CV as a Word (.docx) download; force-dynamic prevents Next.js caching the binary at the edge.
// API route that serves the CV as a Word document (.docx) download.

import { readFileSync } from "fs"
import { join } from "path"
import { NextResponse } from "next/server"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const docxPath = join(process.cwd(), "public", "resume", "Isaac_Adjei_CV.docx")
    const buffer = readFileSync(docxPath)

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": 'attachment; filename="Isaac_Adjei_CV.docx"',
        "Cache-Control": "no-store",
      },
    })
  } catch (err) {
    console.error("CV Word download failed:", err)
    return NextResponse.json({ error: "Failed to download CV Word document." }, { status: 500 })
  }
}
