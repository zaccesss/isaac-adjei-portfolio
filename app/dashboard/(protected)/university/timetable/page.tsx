import TimetableClient from "./TimetableClient"
import { supabase } from "@/lib/supabase"
import { parseVEvents } from "@/lib/ical"

export const dynamic = "force-dynamic"
export const revalidate = 3600
export const metadata = { title: "Timetable", robots: "noindex, nofollow" }

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
    // webcal:// is just http(s) for calendars; fetch() cannot open the scheme, so swap it.
    const res = await fetch(url.replace(/^webcals?:\/\//i, "https://"), { next: { revalidate: 3600 } })
    if (!res.ok) return []
    return parseVEvents(await res.text()).map((e) => ({
      uid: e.uid,
      summary: e.summary,
      dtstart: e.dtstart,
      dtend: e.dtend,
      location: e.location,
      description: e.description,
    }))
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
