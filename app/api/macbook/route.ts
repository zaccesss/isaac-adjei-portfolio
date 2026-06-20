// MacBook presence (battery, weather, location) written to Redis by a macOS daemon.
// Data logic lives in lib/live-status (getMacbook) so the SSE stream can read it in-process.
import { NextResponse } from "next/server"
import { getMacbook } from "@/lib/live-status"

export async function GET() {
  return NextResponse.json(await getMacbook(), { headers: { "Cache-Control": "no-store" } })
}
