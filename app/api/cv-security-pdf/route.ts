import { readFileSync } from "fs"
import { join } from "path"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const pdfPath = join(process.cwd(), "public", "resume", "cv-security.pdf")
    const pdf = readFileSync(pdfPath)

    return new Response(pdf, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="Isaac_Adjei_CV_Cybersecurity.pdf"',
        "Cache-Control": "no-store",
      },
    })
  } catch (err) {
    console.error("CV PDF serve failed:", err)
    return Response.json({ error: "Failed to serve CV PDF." }, { status: 500 })
  }
}
