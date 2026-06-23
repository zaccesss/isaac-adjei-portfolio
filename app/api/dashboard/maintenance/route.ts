// Read and toggle maintenance mode from Settings. Auth-guarded and uncached. POST writes the flag + custom
// message (and, if enabling, purges the Cloudflare cache via lib/maintenance) so it takes effect at once.
import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { getMaintenance, setMaintenance } from "@/lib/maintenance"

export const dynamic = "force-dynamic"

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "unauthorised" }, { status: 401 })
  return NextResponse.json(await getMaintenance(), { headers: { "Cache-Control": "no-store" } })
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "unauthorised" }, { status: 401 })
  const body = (await req.json().catch(() => ({}))) as { enabled?: boolean; message?: string }
  await setMaintenance({
    enabled: Boolean(body.enabled),
    message: typeof body.message === "string" ? body.message.slice(0, 500) : "",
  })
  return NextResponse.json({ ok: true }, { headers: { "Cache-Control": "no-store" } })
}
