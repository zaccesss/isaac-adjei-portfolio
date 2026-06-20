// Lenovo laptop presence written to Redis by a daemon on the laptop. Data logic lives in
// lib/live-status (getLenovo) so the SSE stream can read it in-process.
import { NextResponse } from "next/server"
import { getLenovo } from "@/lib/live-status"

export async function GET() {
  return NextResponse.json(await getLenovo(), { headers: { "Cache-Control": "no-store" } })
}
