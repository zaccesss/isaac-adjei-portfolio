"use client"

import { useState } from "react"
import { CalendarDays, MapPin, Clock, Info, ChevronDown, ChevronUp, ChevronLeft, ChevronRight } from "lucide-react"

type Attendance = "present" | "absent" | "late"

function attendanceKey(uid: string, date: Date) {
  return `tt_att_${uid}_${date.toISOString().slice(0, 10)}`
}
function notesKey(uid: string, date: Date) {
  return `tt_note_${uid}_${date.toISOString().slice(0, 10)}`
}

function EventCard({ e }: { e: ICalEvent }) {
  const [att, setAtt] = useState<Attendance | null>(
    () => localStorage.getItem(attendanceKey(e.uid, e.dtstart)) as Attendance | null
  )
  const [note, setNote] = useState(
    () => localStorage.getItem(notesKey(e.uid, e.dtstart)) ?? ""
  )
  const [showNote, setShowNote] = useState(false)

  function mark(status: Attendance) {
    const next = att === status ? null : status
    if (next) localStorage.setItem(attendanceKey(e.uid, e.dtstart), next)
    else localStorage.removeItem(attendanceKey(e.uid, e.dtstart))
    setAtt(next)
  }

  function saveNote(v: string) {
    setNote(v)
    if (v.trim()) localStorage.setItem(notesKey(e.uid, e.dtstart), v)
    else localStorage.removeItem(notesKey(e.uid, e.dtstart))
  }

  const attColour: Record<Attendance, string> = {
    present: "bg-green-500/15 text-green-600 border-green-500/30",
    absent:  "bg-red-500/15 text-red-600 border-red-500/30",
    late:    "bg-amber-500/15 text-amber-600 border-amber-500/30",
  }

  return (
    <div className="rounded-xl border border-border/60 bg-card px-4 py-3 space-y-2 hover:border-primary/30 transition-colors">
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
      <div className="flex items-center gap-1.5 pt-0.5">
        {(["present", "late", "absent"] as Attendance[]).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => mark(s)}
            className={`text-[10px] font-mono px-2 py-0.5 rounded border transition-colors ${att === s ? attColour[s] : "border-border/50 text-muted-foreground hover:border-primary/40"}`}
          >
            {s}
          </button>
        ))}
        <button
          type="button"
          onClick={() => setShowNote((v) => !v)}
          className="ml-auto flex items-center gap-1 text-[10px] font-mono text-muted-foreground hover:text-foreground transition-colors"
        >
          {showNote ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          note
        </button>
      </div>
      {showNote && (
        <textarea
          className="w-full text-xs rounded-lg border border-border bg-muted/30 px-3 py-2 resize-none focus:outline-none focus:ring-1 focus:ring-primary/50 placeholder:text-muted-foreground/50"
          rows={2}
          placeholder="Add a note for this session..."
          value={note}
          onChange={(ev) => saveNote(ev.target.value)}
        />
      )}
    </div>
  )
}

// Compact event block for the week grid
function GridEvent({ e }: { e: ICalEvent }) {
  const [expanded, setExpanded] = useState(false)
  const [att, setAtt] = useState<Attendance | null>(
    () => localStorage.getItem(attendanceKey(e.uid, e.dtstart)) as Attendance | null
  )

  function mark(status: Attendance) {
    const next = att === status ? null : status
    if (next) localStorage.setItem(attendanceKey(e.uid, e.dtstart), next)
    else localStorage.removeItem(attendanceKey(e.uid, e.dtstart))
    setAtt(next)
  }

  const attDot: Record<Attendance, string> = {
    present: "bg-green-500",
    absent:  "bg-red-500",
    late:    "bg-amber-500",
  }

  return (
    <div
      className="absolute inset-x-0.5 rounded-md bg-primary/10 border border-primary/25 px-1.5 py-1 overflow-hidden cursor-pointer hover:bg-primary/15 transition-colors group"
      onClick={() => setExpanded((v) => !v)}
    >
      <div className="flex items-start gap-1">
        {att && <span className={`mt-1 w-1.5 h-1.5 rounded-full shrink-0 ${attDot[att]}`} />}
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-mono font-semibold truncate leading-tight text-foreground">{e.summary}</p>
          <p className="text-[9px] font-mono text-muted-foreground leading-tight">{fmtTime(e.dtstart)}</p>
          {e.location && <p className="text-[9px] font-mono text-muted-foreground/70 truncate leading-tight">{e.location}</p>}
        </div>
      </div>
      {expanded && (
        <div className="mt-1.5 pt-1.5 border-t border-primary/20 space-y-1" onClick={(ev) => ev.stopPropagation()}>
          <div className="flex gap-1">
            {(["present", "late", "absent"] as Attendance[]).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => mark(s)}
                className={`text-[9px] font-mono px-1.5 py-0.5 rounded border transition-colors ${
                  att === s
                    ? s === "present" ? "bg-green-500/15 text-green-600 border-green-500/30"
                    : s === "absent" ? "bg-red-500/15 text-red-600 border-red-500/30"
                    : "bg-amber-500/15 text-amber-600 border-amber-500/30"
                    : "border-border/50 text-muted-foreground hover:border-primary/40"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

type ICalEvent = {
  uid: string; summary: string; dtstart: Date; dtend: Date
  location?: string; description?: string
}

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
const HOUR_START = 8
const HOUR_END   = 21
const CELL_H     = 56  // px per hour

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

function startOfWeek(date: Date): Date {
  const d = new Date(date)
  const day = d.getDay()
  const diff = day === 0 ? -6 : 1 - day  // Monday
  d.setDate(d.getDate() + diff)
  d.setHours(0, 0, 0, 0)
  return d
}

function eventTopPct(dtstart: Date): number {
  const h = new Date(dtstart).getHours() + new Date(dtstart).getMinutes() / 60
  return Math.max(0, (h - HOUR_START) * CELL_H)
}

function eventHeightPx(dtstart: Date, dtend: Date): number {
  const durationH = (new Date(dtend).getTime() - new Date(dtstart).getTime()) / 3_600_000
  return Math.max(CELL_H / 4, durationH * CELL_H)
}

export default function TimetableClient({ events, hasUrl }: { events: ICalEvent[]; hasUrl: boolean }) {
  const [view, setView] = useState<"week" | "upcoming">("week")  // kept for future use
  const [weekOffset, setWeekOffset] = useState(0)

  const today = new Date()

  // Jump to the week containing the nearest event (past or future) if no events this week
  const baseWeek = (() => {
    const thisWeek = startOfWeek(today)
    if (events.length === 0) return thisWeek
    const thisWeekEnd = new Date(thisWeek); thisWeekEnd.setDate(thisWeekEnd.getDate() + 7)
    const hasThisWeek = events.some((e) => {
      const d = new Date(e.dtstart)
      return d >= thisWeek && d < thisWeekEnd
    })
    if (hasThisWeek) return thisWeek
    // Find nearest event
    const nearest = events.reduce((best, e) => {
      const diff = Math.abs(new Date(e.dtstart).getTime() - today.getTime())
      const bestDiff = Math.abs(new Date(best.dtstart).getTime() - today.getTime())
      return diff < bestDiff ? e : best
    })
    return startOfWeek(new Date(nearest.dtstart))
  })()

  const weekStart = new Date(baseWeek)
  weekStart.setDate(weekStart.getDate() + weekOffset * 7)
  const weekDays = Array.from({ length: 5 }, (_, i) => {
    const d = new Date(weekStart)
    d.setDate(weekStart.getDate() + i)
    return d
  })
  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekStart.getDate() + 5)

  const weekEvents = events.filter((e) => {
    const d = new Date(e.dtstart)
    return d >= weekStart && d < weekEnd
  })

  // Group by day index (0=Mon..4=Fri)
  const byDayIdx: ICalEvent[][] = [[], [], [], [], []]
  for (const e of weekEvents) {
    const dow = new Date(e.dtstart).getDay()  // 1=Mon..5=Fri
    const idx = dow - 1
    if (idx >= 0 && idx < 5) byDayIdx[idx].push(e)
  }

  // All events sorted, not filtered by future
  const upcomingEvents = [...events].sort((a, b) => new Date(a.dtstart).getTime() - new Date(b.dtstart).getTime())

  // Group upcoming by day
  const byDay = new Map<string, ICalEvent[]>()
  for (const e of upcomingEvents) {
    const key = new Date(e.dtstart).toDateString()
    if (!byDay.has(key)) byDay.set(key, [])
    byDay.get(key)!.push(e)
  }

  const hours = Array.from({ length: HOUR_END - HOUR_START }, (_, i) => HOUR_START + i)

  const weekLabel = `${weekDays[0].getDate()} ${MONTHS[weekDays[0].getMonth()]} - ${weekDays[4].getDate()} ${MONTHS[weekDays[4].getMonth()]} ${weekDays[4].getFullYear()}`

  return (
    <div className="p-6 space-y-8 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Timetable</h1>
          <p className="text-sm text-muted-foreground mt-0.5">University timetable synced from iCal</p>
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

      {/* Week calendar grid */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label="Previous week"
            onClick={() => setWeekOffset((v) => v - 1)}
            className="p-1 rounded hover:bg-muted transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="text-sm font-mono text-muted-foreground flex-1 text-center">{weekLabel}</span>
          <button
            type="button"
            aria-label="Next week"
            onClick={() => setWeekOffset((v) => v + 1)}
            className="p-1 rounded hover:bg-muted transition-colors"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          {weekOffset !== 0 && (
            <button
              type="button"
              onClick={() => setWeekOffset(0)}
              className="text-xs px-2 py-0.5 rounded border border-border text-muted-foreground hover:border-primary/40 transition-colors"
            >
              today
            </button>
          )}
        </div>

        <div className="rounded-xl border border-border/60 overflow-hidden bg-card">
          {/* Day headers */}
          <div className="grid border-b border-border/60" style={{ gridTemplateColumns: "3rem repeat(5, 1fr)" }}>
            <div className="border-r border-border/40 bg-muted/30" />
            {weekDays.map((d, i) => (
              <div
                key={i}
                className={`px-2 py-2 text-center border-r last:border-r-0 border-border/40 ${isToday(d) ? "bg-primary/8" : "bg-muted/20"}`}
              >
                <p className={`text-[10px] font-mono uppercase tracking-wide ${isToday(d) ? "text-primary font-semibold" : "text-muted-foreground"}`}>{DAYS[d.getDay()]}</p>
                <p className={`text-sm font-semibold ${isToday(d) ? "text-primary" : ""}`}>{d.getDate()}</p>
              </div>
            ))}
          </div>

          {/* Time grid */}
          <div className="flex overflow-y-auto" style={{ maxHeight: "55vh" }}>
            <div className="shrink-0 w-12 border-r border-border/40">
              {hours.map((h) => (
                <div key={h} style={{ height: CELL_H }} className="border-b border-border/30 flex items-start justify-end pr-1.5 pt-1">
                  <span className="text-[9px] font-mono text-muted-foreground/50">{String(h).padStart(2, "0")}:00</span>
                </div>
              ))}
            </div>
            {weekDays.map((_, dayIdx) => (
              <div
                key={dayIdx}
                className={`flex-1 border-r last:border-r-0 border-border/40 relative ${isToday(weekDays[dayIdx]) ? "bg-primary/[0.03]" : ""}`}
                style={{ minHeight: CELL_H * hours.length }}
              >
                {hours.map((h) => (
                  <div key={h} style={{ height: CELL_H }} className="border-b border-border/20" />
                ))}
                {byDayIdx[dayIdx].map((e) => (
                  <div
                    key={e.uid}
                    className="absolute inset-x-0"
                    style={{
                      top: eventTopPct(new Date(e.dtstart)),
                      height: eventHeightPx(new Date(e.dtstart), new Date(e.dtend)),
                    }}
                  >
                    <GridEvent e={e} />
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {weekEvents.length === 0 && hasUrl && (
          <p className="text-xs text-muted-foreground text-center py-1">No events this week - use the arrows to navigate to a term week</p>
        )}
      </div>

      {/* All events list */}
      {events.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">All events</h2>
          {events.length === 0 && hasUrl && (
            <div className="rounded-xl border border-dashed border-border/60 p-8 text-center text-muted-foreground text-sm">
              No events found in iCal feed.
            </div>
          )}
          {[...byDay.entries()].map(([dayKey, dayEvents]) => (
            <div key={dayKey} className="space-y-2">
              <div className="flex items-center gap-2">
                <CalendarDays className="h-3.5 w-3.5 text-muted-foreground" />
                <p className={`text-xs font-semibold uppercase tracking-wide ${isToday(new Date(dayKey)) ? "text-primary" : "text-muted-foreground"}`}>
                  {isToday(new Date(dayKey)) ? "Today" : fmtDate(new Date(dayKey))}
                </p>
              </div>
              {dayEvents.map((e) => <EventCard key={e.uid} e={e} />)}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
