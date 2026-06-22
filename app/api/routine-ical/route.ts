import { NextResponse } from "next/server"
import { buildRoutineIcal } from "@/lib/routine-ical"

// I serve the weekly routine as an iCal feed that Apple Calendar and Google Calendar can subscribe to.
// The feed body lives in lib/routine-ical.ts so the dashboard calendar can build it in-process instead
// of fetching this endpoint over the network - a same-origin SSR fetch looped through Cloudflare and
// returned nothing in production, leaving the routine invisible on the dashboard calendar.

export function GET() {
  return new NextResponse(buildRoutineIcal(), {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
      "Content-Disposition": "attachment; filename=\"routine.ics\"",
    },
  })
}
