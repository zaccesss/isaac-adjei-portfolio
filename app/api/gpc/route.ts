// Gaming PC presence (CPU/GPU/game) written to Redis by a Windows daemon. Data logic lives in
// lib/live-status (getGpc); the combined /api/live-status snapshot reads it via a shared mget,
// but this per-device route stays for the lab page's gaming panel.
import { NextResponse } from "next/server"
import { getGpc } from "@/lib/live-status"
import { cdnCache } from "@/lib/cdn-cache"

export async function GET() {
  // 45s edge cache against the gaming panel's 30s poll (TTL above the poll interval so polls
  // share the edge copy); the gpc daemon only writes every 60s, so this loses no freshness.
  return NextResponse.json(await getGpc(), { headers: cdnCache(45) })
}
