import TimetableClient from "./TimetableClient"
import { supabase } from "@/lib/supabase"

export const dynamic = "force-dynamic"
export const revalidate = 3600
export const metadata = { robots: "noindex, nofollow" }

type ICalEvent = {
  uid: string
  summary: string
  dtstart: Date
  dtend: Date
  location?: string
  description?: string
}

async function fetchICalEvents(): Promise<ICalEvent[]> {
  const url = process.env.ICAL_TIMETABLE_URL
  if (!url) return []

  try {
    const res = await fetch(url, { next: { revalidate: 3600 } })
    if (!res.ok) return []
    const text = await res.text()

    const events: ICalEvent[] = []
    const vevents = text.split("BEGIN:VEVENT").slice(1)

    for (const vevent of vevents) {
      function getProp(prop: string): string {
        const match = vevent.match(new RegExp(`${prop}[^:]*:([^\\r\\n]+)`))
        return match ? match[1].trim() : ""
      }

      function parseDate(raw: string): Date | null {
        if (!raw) return null
        const d = raw.replace("Z", "")
        if (d.length === 8) {
          return new Date(`${d.slice(0, 4)}-${d.slice(4, 6)}-${d.slice(6, 8)}T00:00:00Z`)
        }
        return new Date(`${d.slice(0, 4)}-${d.slice(4, 6)}-${d.slice(6, 8)}T${d.slice(9, 11)}:${d.slice(11, 13)}:${d.slice(13, 15)}${raw.endsWith("Z") ? "Z" : ""}`)
      }

      const uid = getProp("UID")
      const summary = getProp("SUMMARY")
      const rawStart = getProp("DTSTART")
      const rawEnd = getProp("DTEND")
      const location = getProp("LOCATION") || undefined
      const description = getProp("DESCRIPTION") || undefined

      const dtstart = parseDate(rawStart)
      const dtend = parseDate(rawEnd)
      if (!uid || !summary || !dtstart || !dtend) continue

      events.push({ uid, summary, dtstart, dtend, location, description })
    }

    events.sort((a, b) => a.dtstart.getTime() - b.dtstart.getTime())
    return events
  } catch {
    return []
  }
}

export default async function TimetablePage() {
  const [events, customResult] = await Promise.all([
    fetchICalEvents(),
    supabase
      .from("calendar_events")
      .select("*")
      .eq("is_deleted", false)
      .eq("event_type", "timetable")
      .order("start_at", { ascending: true }),
  ])

  const hasUrl = !!process.env.ICAL_TIMETABLE_URL
  const customEvents = customResult.data ?? []

  return <TimetableClient events={events} hasUrl={hasUrl} customEvents={customEvents} />
}
