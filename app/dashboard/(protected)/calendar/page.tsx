import CalendarClient from "./CalendarClient"
import { getIcalFeeds } from "@/app/dashboard/actions"
import { supabase } from "@/lib/supabase"

export const dynamic = "force-dynamic"
export const revalidate = 3600
export const metadata = { robots: "noindex, nofollow" }

export type CalendarEvent = {
  uid: string
  summary: string
  dtstart: Date
  dtend: Date
  location?: string
  description?: string
  feedColor: string
  feedName: string
}

function parseDate(raw: string): Date | null {
  if (!raw) return null
  const d = raw.replace("Z", "")
  if (d.length === 8) {
    return new Date(`${d.slice(0, 4)}-${d.slice(4, 6)}-${d.slice(6, 8)}T00:00:00`)
  }
  return new Date(
    `${d.slice(0, 4)}-${d.slice(4, 6)}-${d.slice(6, 8)}T${d.slice(9, 11)}:${d.slice(11, 13)}:${d.slice(13, 15)}${raw.endsWith("Z") ? "Z" : ""}`
  )
}

async function fetchFeed(url: string, feedName: string, feedColor: string): Promise<CalendarEvent[]> {
  try {
    const res = await fetch(url, { next: { revalidate: 3600 } })
    if (!res.ok) return []
    const text = await res.text()
    const events: CalendarEvent[] = []

    for (const vevent of text.split("BEGIN:VEVENT").slice(1)) {
      function getProp(prop: string): string {
        const match = vevent.match(new RegExp(`${prop}[^:]*:([^\\r\\n]+)`))
        return match ? match[1].trim() : ""
      }

      const uid = getProp("UID")
      const summary = getProp("SUMMARY")
      const dtstart = parseDate(getProp("DTSTART"))
      const dtend = parseDate(getProp("DTEND"))
      const location = getProp("LOCATION") || undefined
      const description = getProp("DESCRIPTION") || undefined

      if (!uid || !summary || !dtstart || !dtend) continue
      events.push({ uid, summary, dtstart, dtend, location, description, feedColor, feedName })
    }

    return events
  } catch {
    return []
  }
}

export default async function CalendarPage() {
  const [feeds, customResult] = await Promise.all([
    getIcalFeeds(),
    supabase.from("calendar_events").select("*").eq("is_deleted", false).order("start_at", { ascending: true }),
  ])

  const allEvents = (await Promise.all(feeds.map((f) => fetchFeed(f.url, f.name, f.color)))).flat()
  allEvents.sort((a, b) => a.dtstart.getTime() - b.dtstart.getTime())

  const customEvents = customResult.data ?? []

  return <CalendarClient events={allEvents} feeds={feeds} customEvents={customEvents} />
}
