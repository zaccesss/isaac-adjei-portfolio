// Lenovo laptop presence written to Redis by a daemon on the laptop. Data logic lives in
// lib/live-status (getLenovo); the combined /api/live-status snapshot reads it via a shared
// mget, but this per-device route stays for direct fetches.
import { NextResponse } from "next/server"
import { getLenovo } from "@/lib/live-status"
import { cdnCache } from "@/lib/cdn-cache"

export async function GET() {
  return NextResponse.json(await getLenovo(), { headers: cdnCache(15) })
}
