"use client"

import { useState } from "react"
import { CalendarDays, MapPin, Clock, Info } from "lucide-react"

type ICalEvent = {
  uid: string; summary: string; dtstart: Date; dtend: Date
  location?: string; description?: string
}

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

function fmtTime(d: Date) {
  return new Date(d).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })
}

function fmtDate(d: Date) {
  const dt = new Date(d)
  return `${DAYS[dt.getDay()]} ${dt.getDate()} ${MONTHS[dt.getMonth()]}`
}

function isToday(d: Date) {
  const now = new Date()
  const dt = new Date(d)
  return dt.getDate() === now.getDate() && dt.getMonth() === now.getMonth() && dt.getFullYear() === now.getFullYear()
}

function isFuture(d: Date) {
  return new Date(d) >= new Date()
}

export default function TimetableClient({ events, hasUrl }: { events: ICalEvent[]; hasUrl: boolean }) {
  const [view, setView] = useState<"week" | "upcoming">("upcoming")

  const today = new Date()
  const weekStart = new Date(today)
  weekStart.setDate(today.getDate() - today.getDay() + 1) // Monday
  weekStart.setHours(0, 0, 0, 0)
  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekStart.getDate() + 7)

  const weekEvents = events.filter((e) => {
    const d = new Date(e.dtstart)
    return d >= weekStart && d < weekEnd
  })

  const upcomingEvents = events.filter((e) => isFuture(e.dtstart)).slice(0, 20)

  const displayEvents = view === "week" ? weekEvents : upcomingEvents

  // Group by day
  const byDay = new Map<string, ICalEvent[]>()
  for (const e of displayEvents) {
    const key = new Date(e.dtstart).toDateString()
    if (!byDay.has(key)) byDay.set(key, [])
    byDay.get(key)!.push(e)
  }

  return (
    <div className="p-6 space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Timetable</h1>
          <p className="text-sm text-muted-foreground mt-0.5">University timetable synced from iCal</p>
        </div>
        <div className="flex gap-1">
          {[["upcoming", "Upcoming"], ["week", "This week"]].map(([v, l]) => (
            <button key={v} onClick={() => setView(v as "week" | "upcoming")} className={`text-xs px-3 py-1 rounded-full border transition-colors ${view === v ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:border-primary/40"}`}>{l}</button>
          ))}
        </div>
      </div>

      {!hasUrl && (
        <div className="flex items-start gap-2 rounded-lg bg-blue-500/10 border border-blue-500/20 px-4 py-3 text-sm text-blue-600">
          <Info className="h-4 w-4 shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">No timetable URL configured</p>
            <p className="text-xs mt-0.5 text-blue-500">Add <code className="bg-blue-500/10 px-1 rounded">ICAL_TIMETABLE_URL</code> to your Vercel environment variables with your university iCal feed URL.</p>
          </div>
        </div>
      )}

      {hasUrl && events.length === 0 && (
        <div className="rounded-xl border border-dashed border-border/60 p-8 text-center text-muted-foreground text-sm">
          No events found in iCal feed.
        </div>
      )}

      {displayEvents.length > 0 && (
        <div className="space-y-4">
          {[...byDay.entries()].map(([dayKey, dayEvents]) => (
            <div key={dayKey} className="space-y-2">
              <div className="flex items-center gap-2">
                <CalendarDays className="h-3.5 w-3.5 text-muted-foreground" />
                <p className={`text-xs font-semibold uppercase tracking-wide ${isToday(new Date(dayKey)) ? "text-primary" : "text-muted-foreground"}`}>
                  {isToday(new Date(dayKey)) ? "Today" : fmtDate(new Date(dayKey))}
                </p>
              </div>
              {dayEvents.map((e) => (
                <div key={e.uid} className="rounded-xl border border-border/60 bg-card px-4 py-3 space-y-1 hover:border-primary/30 transition-colors">
                  <p className="text-sm font-medium">{e.summary}</p>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {fmtTime(e.dtstart)} - {fmtTime(e.dtend)}
                    </span>
                    {e.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {e.location}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
