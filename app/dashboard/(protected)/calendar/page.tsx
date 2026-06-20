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

const DAY_NAME_TO_NUM: Record<string, number> = { SU: 0, MO: 1, TU: 2, WE: 3, TH: 4, FR: 5, SA: 6 }

// Expand a FREQ=WEEKLY RRULE into concrete Date pairs within a window.
// Returns [] for any RRULE pattern we don't handle (non-weekly).
function expandWeeklyRRule(
  dtstart: Date,
  dtend: Date,
  rrule: string,
  windowStart: Date,
  windowEnd: Date,
): Array<{ start: Date; end: Date }> {
  if (!rrule.includes("FREQ=WEEKLY")) return []
  const duration = dtend.getTime() - dtstart.getTime()

  // Parse BYDAY - e.g. "MO,TU,WE,TH,FR" or "FR"
  const bydayMatch = rrule.match(/BYDAY=([^;]+)/)
  const bydays = bydayMatch
    ? bydayMatch[1].split(",").map((d) => DAY_NAME_TO_NUM[d.trim()]).filter((n) => n !== undefined)
    : [dtstart.getDay()]

  // Parse INTERVAL (default 1)
  const intervalMatch = rrule.match(/INTERVAL=(\d+)/)
  const interval = intervalMatch ? parseInt(intervalMatch[1]) : 1

  // Parse UNTIL if present
  const untilMatch = rrule.match(/UNTIL=([^;]+)/)
  const until = untilMatch ? parseDate(untilMatch[1]) : null

  const results: Array<{ start: Date; end: Date }> = []

  // Walk week by week from windowStart - interval weeks back (to catch events in progress)
  const cursor = new Date(windowStart)
  cursor.setDate(cursor.getDate() - 7 * interval)
  // Snap cursor back to the anchor week
  const anchorDay = dtstart.getDay()
  while (cursor.getDay() !== anchorDay) cursor.setDate(cursor.getDate() - 1)

  // Iterate week by week
  for (let week = 0; cursor <= windowEnd; week++) {
    for (const dayNum of bydays) {
      const diff = (dayNum - anchorDay + 7) % 7
      const occDate = new Date(cursor)
      occDate.setDate(occDate.getDate() + diff)

      // Set time from dtstart
      occDate.setHours(dtstart.getHours(), dtstart.getMinutes(), dtstart.getSeconds(), 0)

      if (until && occDate > until) continue
      if (occDate < windowStart || occDate > windowEnd) continue
      // Must not be before the DTSTART anchor
      if (occDate < dtstart) continue

      const occEnd = new Date(occDate.getTime() + duration)
      results.push({ start: occDate, end: occEnd })
    }
    cursor.setDate(cursor.getDate() + 7 * interval)
    if (week > 200) break // safety
  }

  return results
}

// Window for RRULE expansion: 60 days back to 400 days ahead
const RRULE_WINDOW_START = new Date(Date.now() - 60 * 86400000)
const RRULE_WINDOW_END = new Date(Date.now() + 400 * 86400000)

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
      const rrule = getProp("RRULE")

      if (!uid || !summary || !dtstart || !dtend) continue

      if (rrule) {
        // Expand recurring events into concrete occurrences
        const occurrences = expandWeeklyRRule(dtstart, dtend, rrule, RRULE_WINDOW_START, RRULE_WINDOW_END)
        if (occurrences.length > 0) {
          occurrences.forEach(({ start, end }, i) => {
            events.push({ uid: `${uid}-${i}`, summary, dtstart: start, dtend: end, location, description, feedColor, feedName })
          })
        } else {
          // Fallback: include the anchor occurrence as-is
          events.push({ uid, summary, dtstart, dtend, location, description, feedColor, feedName })
        }
      } else {
        events.push({ uid, summary, dtstart, dtend, location, description, feedColor, feedName })
      }
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
