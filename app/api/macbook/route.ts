// MacBook presence (battery, weather, location) written to Redis by a macOS daemon. Data logic
// lives in lib/live-status (getMacbook); the combined /api/live-status snapshot reads it via a
// shared mget, but this per-device route stays for the lab page and direct fetches.
import { NextResponse } from "next/server"
import { getMacbook } from "@/lib/live-status"
import { cdnCache } from "@/lib/cdn-cache"

export async function GET() {
  return NextResponse.json(await getMacbook(), { headers: cdnCache(15) })
}
