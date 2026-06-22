import CalendarClient from "./CalendarClient"
import { getIcalFeeds } from "@/app/dashboard/actions"
import { supabase } from "@/lib/supabase"
import { parseVEvents } from "@/lib/ical"

export const dynamic = "force-dynamic"
export const revalidate = 3600
export const metadata = { robots: "noindex, nofollow" }

export type CalendarEvent = {
  uid: string
  summary: string
  dtstart: Date
  dtend: Date
  allDay: boolean
  location?: string
  description?: string
  feedColor: string
  feedName: string
}

// Window for RRULE expansion: 60 days back to 400 days ahead.
const RRULE_WINDOW_START = new Date(Date.now() - 60 * 86400000)
const RRULE_WINDOW_END = new Date(Date.now() + 400 * 86400000)

async function fetchFeed(url: string, feedName: string, feedColor: string): Promise<CalendarEvent[]> {
  try {
    // Apple Calendar's "Subscribe" gives a webcal:// URL, which fetch() cannot open. webcal is just
    // http(s) for calendars, so swap the scheme - Apple (iCloud) and most providers serve the same
    // feed over TLS. Without this an Apple feed silently returns no events while https feeds work.
    let fetchUrl = url.replace(/^webcals?:\/\//i, "https://")
    // A same-origin feed (my self-hosted routine feed) silently returns nothing when the server fetches
    // it back through Cloudflare during SSR - the request loops out to the proxy and comes back empty,
    // which is why the World Cup feed (external) worked but Daily Routine never did. I route same-origin
    // feeds straight at the Vercel deployment, bypassing Cloudflare, and send a browser User-Agent.
    const internal = process.env.VERCEL_URL
    if (internal && /^https?:\/\/(www\.)?isaacadjei\.me\//i.test(fetchUrl)) {
      fetchUrl = fetchUrl.replace(/^https?:\/\/(www\.)?isaacadjei\.me/i, `https://${internal}`)
    }
    const res = await fetch(fetchUrl, {
      next: { revalidate: 3600 },
      headers: { "User-Agent": "Mozilla/5.0 (compatible; isaac-adjei-dashboard/1.0)" },
    })
    if (!res.ok) return []
    const events = parseVEvents(await res.text(), { start: RRULE_WINDOW_START, end: RRULE_WINDOW_END })
    return events.map((e) => ({
      uid: e.uid,
      summary: e.summary,
      dtstart: e.dtstart,
      dtend: e.dtend,
      allDay: e.allDay,
      location: e.location,
      description: e.description,
      feedColor,
      feedName,
    }))
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
