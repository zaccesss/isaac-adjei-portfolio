import { readFileSync } from "fs"
import { join } from "path"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const docxPath = join(process.cwd(), "public", "resume", "cv-devops.docx")
    const docx = readFileSync(docxPath)

    return new Response(docx, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": 'attachment; filename="Isaac_Adjei_CV_DevOps_Cloud.docx"',
        "Cache-Control": "no-store",
      },
    })
  } catch (err) {
    console.error("CV Word serve failed:", err)
    return Response.json({ error: "Failed to serve CV Word document." }, { status: 500 })
  }
}
