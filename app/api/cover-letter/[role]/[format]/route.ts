// I serve cover letters as binary file downloads from /public/resume so Next.js
// does not need to generate them at runtime. The [role]/[format] segments let one
// route handle all combinations without duplicating response logic.
// force-dynamic prevents Next.js caching the binary response at the edge.
import { readFileSync } from "fs"
import { join } from "path"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const VALID_ROLES = ["general", "software", "embedded", "devops", "data", "quant", "security"]
const ROLE_LABELS: Record<string, string> = {
  general: "General_Engineering",
  software: "Software_Engineering",
  embedded: "Embedded_Systems",
  devops: "DevOps_Cloud",
  data: "Data_AI_Engineering",
  quant: "Quantitative_Developer",
  security: "Cybersecurity",
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ role: string; format: string }> }
) {
  const { role, format } = await params

  if (!VALID_ROLES.includes(role)) {
    return Response.json({ error: "Invalid role." }, { status: 404 })
  }

  if (format === "pdf") {
    try {
      const file = readFileSync(join(process.cwd(), "public", "resume", `cover-letter-${role}.pdf`))
      return new Response(file, {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="Isaac_Adjei_Cover_Letter_${ROLE_LABELS[role]}.pdf"`,
          "Cache-Control": "no-store",
        },
      })
    } catch {
      return Response.json({ error: "PDF not found." }, { status: 404 })
    }
  }

  if (format === "docx") {
    try {
      const file = readFileSync(join(process.cwd(), "public", "resume", `cover-letter-${role}.docx`))
      return new Response(file, {
        headers: {
          "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          "Content-Disposition": `attachment; filename="Isaac_Adjei_Cover_Letter_${ROLE_LABELS[role]}.docx"`,
          "Cache-Control": "no-store",
        },
      })
    } catch {
      return Response.json({ error: "DOCX not found." }, { status: 404 })
    }
  }

  return Response.json({ error: "Invalid format. Use pdf or docx." }, { status: 400 })
}
