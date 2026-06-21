// Gaming PC presence (CPU/GPU/game) written to Redis by a Windows daemon. Data logic lives in
// lib/live-status (getGpc); the combined /api/live-status snapshot reads it via a shared mget,
// but this per-device route stays for the lab page's gaming panel.
import { NextResponse } from "next/server"
import { getGpc } from "@/lib/live-status"
import { cdnCache } from "@/lib/cdn-cache"

export async function GET() {
  return NextResponse.json(await getGpc(), { headers: cdnCache(15) })
}
