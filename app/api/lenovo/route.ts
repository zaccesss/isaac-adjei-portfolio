// Lenovo laptop presence written to Redis by a daemon on the laptop. Data logic lives in
// lib/live-status (getLenovo); the combined /api/live-status snapshot reads it via a shared
// mget, but this per-device route stays for direct fetches.
import { NextResponse } from "next/server"
import { getLenovo } from "@/lib/live-status"

export async function GET() {
  return NextResponse.json(await getLenovo(), {
    headers: { "Cache-Control": "public, max-age=0, s-maxage=15, stale-while-revalidate=30" },
  })
}
