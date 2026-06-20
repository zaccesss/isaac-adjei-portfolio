// Gaming PC presence (CPU/GPU/game) written to Redis by a Windows daemon. Data logic lives
// in lib/live-status (getGpc) so the SSE stream can read it in-process.
import { NextResponse } from "next/server"
import { getGpc } from "@/lib/live-status"

export async function GET() {
  return NextResponse.json(await getGpc(), {
    headers: { "Cache-Control": "public, max-age=10, stale-while-revalidate=20" },
  })
}
