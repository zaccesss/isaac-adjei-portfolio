"use client"

import { useState, useRef, useEffect, useTransition } from "react"
import { motion } from "framer-motion"
import { dashboardPage } from "@/lib/animations"
import { ChevronLeft, ChevronRight, Plus, X, Settings2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import DashboardBreadcrumb from "@/app/dashboard/components/DashboardBreadcrumb"
import type { CalendarEvent } from "./page"
import type { IcalFeed } from "@/app/dashboard/actions"
import { saveIcalFeeds } from "@/app/dashboard/actions"

// ── helpers ──────────────────────────────────────────────────────────────────

type View = "day" | "week" | "month" | "year"

const DAYS_SHORT = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
const MONTHS_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
const HOURS = Array.from({ length: 24 }, (_, i) => i)
const FEED_COLORS = ["#6366f1", "#22c55e", "#f59e0b", "#ec4899", "#14b8a6", "#ef4444", "#8b5cf6", "#f97316"]

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}

function formatTime(d: Date) {
  return d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })
}

function isAllDay(e: CalendarEvent) {
  return e.dtstart.getHours() === 0 && e.dtstart.getMinutes() === 0 &&
    e.dtend.getHours() === 0 && e.dtend.getMinutes() === 0
}

function minutesFromMidnight(d: Date) {
  return d.getHours() * 60 + d.getMinutes()
}

function getWeekStart(d: Date) {
  const copy = new Date(d)
  const dow = (copy.getDay() + 6) % 7
  copy.setDate(copy.getDate() - dow)
  copy.setHours(0, 0, 0, 0)
  return copy
}

// ── event tooltip ─────────────────────────────────────────────────────────────

function EventTooltip({ event, onClose }: { event: CalendarEvent; onClose: () => void }) {
  return (
    <div className="absolute z-20 w-56 bg-card border border-border rounded-xl shadow-lg p-3 text-xs space-y-1.5 top-full left-0 mt-1">
      <div className="flex items-start justify-between gap-2">
        <p className="font-semibold text-sm leading-snug">{event.summary}</p>
        <button type="button" onClick={onClose} title="Close" className="text-muted-foreground hover:text-foreground shrink-0 mt-0.5">
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
      {!isAllDay(event) && (
        <p className="text-muted-foreground">{formatTime(event.dtstart)} – {formatTime(event.dtend)}</p>
      )}
      {event.location && <p className="text-muted-foreground">📍 {event.location}</p>}
      {event.description && <p className="text-muted-foreground line-clamp-3">{event.description}</p>}
      <div className="flex items-center gap-1 pt-0.5">
        <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: event.feedColor }} />
        <span className="text-muted-foreground">{event.feedName}</span>
      </div>
    </div>
  )
}

// Apple Calendar-style gradient from a feed colour
function feedGradient(color: string): string {
  return `linear-gradient(135deg, ${color}dd 0%, ${color} 100%)`
}

function EventPill({ event, compact = false }: { event: CalendarEvent; compact?: boolean }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        title={event.summary}
        className={`w-full text-left rounded-md truncate text-white font-medium shadow-sm ${compact ? "text-[10px] px-1 py-0.5" : "text-xs px-1.5 py-0.5"}`}
        style={{ background: feedGradient(event.feedColor) }}
      >
        {!isAllDay(event) && !compact && <span className="opacity-80">{formatTime(event.dtstart)} </span>}
        {event.summary}
      </button>
      {open && <EventTooltip event={event} onClose={() => setOpen(false)} />}
    </div>
  )
}

// ── time grid (shared by day + week) ─────────────────────────────────────────

const CELL_HEIGHT = 56 // px per hour — matches Apple Calendar proportions

function TimeGrid({ days, events }: { days: Date[]; events: CalendarEvent[] }) {
  const today = new Date()
  const scrollRef = useRef<HTMLDivElement>(null)

  const timedByDay = days.map((day) =>
    events.filter((e) => isSameDay(e.dtstart, day) && !isAllDay(e)).sort((a, b) => a.dtstart.getTime() - b.dtstart.getTime())
  )

  useEffect(() => {
    if (!scrollRef.current) return
    const nowMins = today.getHours() * 60 + today.getMinutes()
    const scrollTo = Math.max(0, (nowMins / 60) * CELL_HEIGHT - 160)
    scrollRef.current.scrollTop = scrollTo
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // All-day events per day
  const allDayEvents = days.map((day) => events.filter((e) => isSameDay(e.dtstart, day) && isAllDay(e)))

  // Overlap layout: assign column index per event within a day
  function layoutEvents(evs: CalendarEvent[]) {
    const placed: { event: CalendarEvent; col: number; cols: number }[] = []
    let maxEnd = 0
    let groupCols = 0
    let groupStart = 0

    for (let i = 0; i < evs.length; i++) {
      const e = evs[i]
      const start = minutesFromMidnight(e.dtstart)
      const end = minutesFromMidnight(e.dtend)

      if (start >= maxEnd) {
        groupStart = i
        groupCols = 1
      }
      maxEnd = Math.max(maxEnd, end)

      const usedCols = placed.slice(groupStart).map((p) => {
        const s2 = minutesFromMidnight(p.event.dtstart)
        const e2 = minutesFromMidnight(p.event.dtend)
        return s2 < end && e2 > start ? p.col : -1
      })
      let col = 0
      while (usedCols.includes(col)) col++
      groupCols = Math.max(groupCols, col + 1)
      placed.push({ event: e, col, cols: 1 })
    }

    let i = 0
    while (i < placed.length) {
      const s = minutesFromMidnight(placed[i].event.dtstart)
      let end = minutesFromMidnight(placed[i].event.dtend)
      let j = i + 1
      while (j < placed.length) {
        const s2 = minutesFromMidnight(placed[j].event.dtstart)
        if (s2 >= end) break
        end = Math.max(end, minutesFromMidnight(placed[j].event.dtend))
        j++
      }
      const groupMax = placed.slice(i, j).reduce((m, p) => Math.max(m, p.col), 0) + 1
      for (let k = i; k < j; k++) placed[k].cols = groupMax
      i = j
    }

    return placed
  }

  return (
    <div className="flex flex-col">
      {/* All-day row */}
      {allDayEvents.some((d) => d.length > 0) && (
        <div className="flex border-b border-border">
          <div className="w-12 shrink-0 text-[10px] text-muted-foreground text-right pr-2 pt-1">all day</div>
          <div className="flex-1 grid" style={{ gridTemplateColumns: `repeat(${days.length}, 1fr)` }}>
            {allDayEvents.map((evs, i) => (
              <div key={i} className="border-l border-border p-0.5 flex flex-col gap-0.5">
                {evs.map((e) => <EventPill key={e.uid} event={e} compact />)}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Timed grid */}
      <div ref={scrollRef} className="flex overflow-y-auto" style={{ maxHeight: "60vh" }}>
        {/* Hour labels */}
        <div className="w-12 shrink-0 flex flex-col">
          {HOURS.map((h) => (
            <div
              key={h}
              className="flex items-start justify-end pr-2 text-[10px] text-muted-foreground shrink-0"
              style={{ height: CELL_HEIGHT }}
            >
              {h > 0 ? `${h.toString().padStart(2, "0")}:00` : ""}
            </div>
          ))}
        </div>

        {/* Day columns */}
        <div className="flex-1 grid relative" style={{ gridTemplateColumns: `repeat(${days.length}, 1fr)` }}>
          {days.map((day, di) => {
            const isToday = isSameDay(day, today)
            const placed = layoutEvents(timedByDay[di])
            const nowMins = isToday ? today.getHours() * 60 + today.getMinutes() : -1

            return (
              <div
                key={di}
                className={`relative border-l border-border ${isToday ? "bg-primary/[0.02]" : ""}`}
                style={{ height: CELL_HEIGHT * 24 }}
              >
                {/* Hour lines */}
                {HOURS.map((h) => (
                  <div key={h} className="absolute w-full border-t border-border/30" style={{ top: h * CELL_HEIGHT }} />
                ))}

                {/* Now line */}
                {nowMins >= 0 && (
                  <div className="absolute w-full z-10" style={{ top: (nowMins / 60) * CELL_HEIGHT }}>
                    <div className="relative">
                      <div className="absolute left-0 w-2 h-2 rounded-full bg-red-500 -translate-y-1" />
                      <div className="h-px bg-red-500" />
                    </div>
                  </div>
                )}

                {/* Events */}
                {placed.map(({ event, col, cols }) => {
                  const startMins = minutesFromMidnight(event.dtstart)
                  const endMins = minutesFromMidnight(event.dtend)
                  const duration = Math.max(endMins - startMins, 20)
                  const top = (startMins / 60) * CELL_HEIGHT
                  const height = (duration / 60) * CELL_HEIGHT
                  const width = `${100 / cols}%`
                  const left = `${(col / cols) * 100}%`

                  return (
                    <EventTimeBlock key={event.uid} event={event} top={top} height={height} left={left} width={width} />
                  )
                })}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function EventTimeBlock({ event, top, height, left, width }: { event: CalendarEvent; top: number; height: number; left: string; width: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="absolute px-0.5 py-0.5 z-5" style={{ top, height, left, width }}>
      <div className="relative h-full">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          title={event.summary}
          className="w-full h-full text-left rounded-lg text-white px-1.5 py-1 overflow-hidden text-[10px] leading-snug font-medium hover:brightness-110 transition-all shadow-sm"
          style={{ background: feedGradient(event.feedColor) }}
        >
          <div className="font-semibold truncate">{event.summary}</div>
          {height > 32 && <div className="opacity-80 truncate">{formatTime(event.dtstart)} - {formatTime(event.dtend)}</div>}
          {height > 52 && event.location && <div className="opacity-75 truncate">📍 {event.location}</div>}
        </button>
        {open && <EventTooltip event={event} onClose={() => setOpen(false)} />}
      </div>
    </div>
  )
}

// ── day view ──────────────────────────────────────────────────────────────────

function DayView({ events, cursor, onPrev, onNext }: { events: CalendarEvent[]; cursor: Date; onPrev: () => void; onNext: () => void }) {
  const today = new Date()
  const isToday = isSameDay(cursor, today)
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <Button size="icon" variant="ghost" className="h-7 w-7" title="Previous day" onClick={onPrev}><ChevronLeft className="h-4 w-4" /></Button>
        <span className={`font-semibold flex-1 text-center ${isToday ? "text-primary" : ""}`}>
          {cursor.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
        </span>
        <Button size="icon" variant="ghost" className="h-7 w-7" title="Next day" onClick={onNext}><ChevronRight className="h-4 w-4" /></Button>
      </div>
      <div className="border border-border rounded-xl overflow-hidden bg-card">
        <TimeGrid days={[cursor]} events={events} />
      </div>
    </div>
  )
}

// ── week view ─────────────────────────────────────────────────────────────────

function WeekView({ events, cursor, onPrev, onNext }: { events: CalendarEvent[]; cursor: Date; onPrev: () => void; onNext: () => void }) {
  const weekStart = getWeekStart(cursor)
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart)
    d.setDate(weekStart.getDate() + i)
    return d
  })
  const today = new Date()
  const rangeLabel = `${days[0].getDate()} ${MONTHS_SHORT[days[0].getMonth()]} – ${days[6].getDate()} ${MONTHS_SHORT[days[6].getMonth()]} ${days[6].getFullYear()}`

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <Button size="icon" variant="ghost" className="h-7 w-7" title="Previous week" onClick={onPrev}><ChevronLeft className="h-4 w-4" /></Button>
        <span className="font-semibold flex-1 text-center text-sm">{rangeLabel}</span>
        <Button size="icon" variant="ghost" className="h-7 w-7" title="Next week" onClick={onNext}><ChevronRight className="h-4 w-4" /></Button>
      </div>
      <div className="border border-border rounded-xl overflow-hidden bg-card">
        {/* Day headers */}
        <div className="flex border-b border-border">
          <div className="w-12 shrink-0" />
          {days.map((day, i) => {
            const isToday = isSameDay(day, today)
            return (
              <div key={i} className={`flex-1 text-center py-2 border-l border-border first:border-l-0 ${isToday ? "bg-primary/5" : ""}`}>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{DAYS_SHORT[i]}</p>
                <div className="flex items-center justify-center mt-0.5">
                  <span className={`w-7 h-7 flex items-center justify-center rounded-full text-sm font-semibold ${isToday ? "bg-primary text-primary-foreground" : ""}`}>
                    {day.getDate()}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
        <TimeGrid days={days} events={events} />
      </div>
    </div>
  )
}

// ── month view ────────────────────────────────────────────────────────────────

function MonthView({ events, cursor, onPrev, onNext, onDayClick }: {
  events: CalendarEvent[]
  cursor: Date
  onPrev: () => void
  onNext: () => void
  onDayClick: (d: Date) => void
}) {
  const year = cursor.getFullYear()
  const month = cursor.getMonth()
  const firstDay = new Date(year, month, 1)
  const startDow = (firstDay.getDay() + 6) % 7
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const cells: (Date | null)[] = [
    ...Array(startDow).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => new Date(year, month, i + 1)),
  ]
  while (cells.length % 7 !== 0) cells.push(null)

  const today = new Date()

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <Button size="icon" variant="ghost" className="h-7 w-7" title="Previous month" onClick={onPrev}><ChevronLeft className="h-4 w-4" /></Button>
        <span className="font-semibold flex-1 text-center">{MONTHS[month]} {year}</span>
        <Button size="icon" variant="ghost" className="h-7 w-7" title="Next month" onClick={onNext}><ChevronRight className="h-4 w-4" /></Button>
      </div>
      <div className="border border-border rounded-xl overflow-hidden">
        {/* Day-of-week header */}
        <div className="grid grid-cols-7 bg-muted/50">
          {DAYS_SHORT.map((d) => (
            <div key={d} className="text-center text-[10px] font-medium text-muted-foreground py-2">{d}</div>
          ))}
        </div>
        {/* Cells */}
        <div className="grid grid-cols-7 gap-px bg-border">
          {cells.map((cell, i) => {
            if (!cell) return <div key={i} className="bg-muted/20 min-h-[80px] sm:min-h-[96px]" />
            const dayEvs = events.filter((e) => isSameDay(e.dtstart, cell))
            const isToday = isSameDay(cell, today)
            return (
              <button
                key={i}
                type="button"
                title={`${cell.getDate()} ${MONTHS[cell.getMonth()]}`}
                onClick={() => onDayClick(cell)}
                className="bg-card min-h-[80px] sm:min-h-[96px] p-1 flex flex-col gap-0.5 text-left hover:bg-muted/40 transition-colors"
              >
                <span className={`text-xs font-medium self-start leading-none w-5 h-5 flex items-center justify-center rounded-full ${isToday ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}>
                  {cell.getDate()}
                </span>
                {dayEvs.slice(0, 3).map((e) => (
                  <div
                    key={e.uid}
                    className="w-full text-[10px] px-1 py-0.5 rounded-md truncate text-white font-medium shadow-sm"
                    style={{ background: feedGradient(e.feedColor) }}
                    title={e.summary}
                  >
                    {!isAllDay(e) && <span className="opacity-80">{formatTime(e.dtstart)} </span>}
                    {e.summary}
                  </div>
                ))}
                {dayEvs.length > 3 && (
                  <span className="text-[10px] text-muted-foreground px-1">+{dayEvs.length - 3} more</span>
                )}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ── year view ─────────────────────────────────────────────────────────────────

function YearView({ events, cursor, onPrev, onNext, onMonthClick }: {
  events: CalendarEvent[]
  cursor: Date
  onPrev: () => void
  onNext: () => void
  onMonthClick: (month: number) => void
}) {
  const year = cursor.getFullYear()
  const today = new Date()

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <Button size="icon" variant="ghost" className="h-7 w-7" title="Previous year" onClick={onPrev}><ChevronLeft className="h-4 w-4" /></Button>
        <span className="font-semibold flex-1 text-center">{year}</span>
        <Button size="icon" variant="ghost" className="h-7 w-7" title="Next year" onClick={onNext}><ChevronRight className="h-4 w-4" /></Button>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {MONTHS.map((monthName, mi) => {
          const firstDay = new Date(year, mi, 1)
          const startDow = (firstDay.getDay() + 6) % 7
          const daysInMonth = new Date(year, mi + 1, 0).getDate()
          const cells: (number | null)[] = [
            ...Array(startDow).fill(null),
            ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
          ]
          const monthEvents = events.filter((e) => e.dtstart.getFullYear() === year && e.dtstart.getMonth() === mi)
          const eventDays = new Set(monthEvents.map((e) => e.dtstart.getDate()))

          return (
            <button
              key={mi}
              type="button"
              onClick={() => onMonthClick(mi)}
              title={`View ${monthName} ${year}`}
              className={`p-3 rounded-xl border border-border bg-card text-left hover:shadow-sm transition-all ${today.getFullYear() === year && today.getMonth() === mi ? "ring-1 ring-primary" : ""}`}
            >
              <p className="text-xs font-semibold mb-2">{monthName}</p>
              <div className="grid grid-cols-7 gap-px text-[9px]">
                {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
                  <div key={i} className="text-center text-muted-foreground">{d}</div>
                ))}
                {cells.map((day, i) => (
                  <div key={i} className={`text-center w-4 h-4 rounded-full flex items-center justify-center leading-none ${
                    day && isSameDay(new Date(year, mi, day), today)
                      ? "bg-primary text-primary-foreground font-bold"
                      : day && eventDays.has(day)
                      ? "bg-primary/20 text-primary font-medium"
                      : "text-muted-foreground"
                  }`}>
                    {day ?? ""}
                  </div>
                ))}
              </div>
              {monthEvents.length > 0 && (
                <p className="text-[10px] text-muted-foreground mt-2">{monthEvents.length} event{monthEvents.length !== 1 ? "s" : ""}</p>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ── feed manager ──────────────────────────────────────────────────────────────

function FeedManager({ feeds, onClose }: { feeds: IcalFeed[]; onClose: () => void }) {
  const [localFeeds, setLocalFeeds] = useState<IcalFeed[]>(feeds.filter((f) => !f.url.startsWith("env:")))
  const [newUrl, setNewUrl] = useState("")
  const [newName, setNewName] = useState("")
  const [newColor, setNewColor] = useState(FEED_COLORS[localFeeds.length % FEED_COLORS.length])
  const [, startTransition] = useTransition()

  function addFeed() {
    if (!newUrl.trim() || !newName.trim()) return
    const feed: IcalFeed = { url: newUrl.trim(), name: newName.trim(), color: newColor }
    setLocalFeeds((f) => [...f, feed])
    setNewUrl("")
    setNewName("")
    setNewColor(FEED_COLORS[(localFeeds.length + 1) % FEED_COLORS.length])
    startTransition(() => void saveIcalFeeds([...localFeeds, feed]))
  }

  function removeFeed(url: string) {
    const updated = localFeeds.filter((f) => f.url !== url)
    setLocalFeeds(updated)
    startTransition(() => void saveIcalFeeds(updated))
  }

  return (
    <div className="border border-border rounded-xl p-4 bg-card flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="font-medium text-sm">Calendar feeds</p>
        <button type="button" title="Close settings" onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
      </div>

      {/* Existing feeds */}
      <div className="flex flex-col gap-2">
        {feeds.map((f) => {
          const isEnvFeed = !localFeeds.find((lf) => lf.url === f.url)
          return (
            <div key={f.url} className="flex items-center gap-2 text-sm">
              <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: f.color }} />
              <span className="flex-1 truncate">{f.name}</span>
              {isEnvFeed ? (
                <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">env</span>
              ) : (
                <button type="button" title={`Remove ${f.name}`} onClick={() => removeFeed(f.url)} className="text-muted-foreground hover:text-destructive transition-colors">
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          )
        })}
        {feeds.length === 0 && <p className="text-xs text-muted-foreground">No feeds yet.</p>}
      </div>

      {/* Add new feed */}
      <div className="flex flex-col gap-2 pt-2 border-t border-border">
        <p className="text-xs font-medium text-muted-foreground">Add feed</p>
        <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Feed name (e.g. Timetable)" className="h-8 text-sm" />
        <Input value={newUrl} onChange={(e) => setNewUrl(e.target.value)} placeholder="iCal URL (https://...)" className="h-8 font-mono text-xs" />
        <div className="flex items-center gap-2">
          <label className="text-xs text-muted-foreground">Colour:</label>
          <div className="flex gap-1">
            {FEED_COLORS.map((c) => (
              <button key={c} type="button" title={c} onClick={() => setNewColor(c)}
                className={`w-5 h-5 rounded-full transition-transform ${newColor === c ? "scale-125 ring-2 ring-offset-1 ring-foreground" : ""}`}
                style={{ backgroundColor: c }} />
            ))}
          </div>
        </div>
        <Button size="sm" onClick={addFeed} disabled={!newUrl.trim() || !newName.trim()} className="self-end">
          <Plus className="h-3.5 w-3.5 mr-1" />Add
        </Button>
      </div>
    </div>
  )
}

// ── main component ────────────────────────────────────────────────────────────

export default function CalendarClient({ events, feeds }: { events: CalendarEvent[]; feeds: IcalFeed[] }) {
  const [view, setView] = useState<View>("week")
  const [cursor, setCursor] = useState(() => new Date())
  const [showFeeds, setShowFeeds] = useState(false)
  const [gridKey, setGridKey] = useState(0)
  const [hiddenFeeds, setHiddenFeeds] = useState<Set<string>>(new Set())

  function toggleFeed(name: string) {
    setHiddenFeeds((prev) => {
      const next = new Set(prev)
      if (next.has(name)) next.delete(name)
      else next.add(name)
      return next
    })
  }

  const visibleEvents = hiddenFeeds.size === 0 ? events : events.filter((e) => !hiddenFeeds.has(e.feedName))

  function advance(delta: number) {
    setCursor((prev) => {
      const next = new Date(prev)
      if (view === "year") next.setFullYear(prev.getFullYear() + delta)
      else if (view === "month") next.setMonth(prev.getMonth() + delta)
      else if (view === "week") next.setDate(prev.getDate() + 7 * delta)
      else next.setDate(prev.getDate() + delta)
      return next
    })
  }

  function jumpToToday() {
    setCursor(new Date())
    setGridKey((k) => k + 1)
  }

  function onDayClick(d: Date) {
    setCursor(d)
    setView("day")
  }

  function onMonthClick(mi: number) {
    setCursor((prev) => new Date(prev.getFullYear(), mi, 1))
    setView("month")
  }

  return (
    <motion.div variants={dashboardPage} initial="hidden" animate="visible" className="flex flex-col gap-4 max-w-6xl">
      <DashboardBreadcrumb crumbs={[{ label: "Calendar" }]} />

      {/* Toolbar */}
      <div className="flex items-center gap-2 flex-wrap">
        <div>
          <h1 className="text-xl font-semibold">Calendar</h1>
          <p className="text-xs text-muted-foreground">Your schedule across all feeds</p>
        </div>

        <div className="ml-auto flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={jumpToToday}
            title="Jump to today"
            className="px-3 py-1.5 text-xs border border-border rounded-md hover:bg-muted transition-colors font-medium"
          >
            Today
          </button>

          {/* View switcher */}
          <div className="flex border border-border rounded-md overflow-hidden">
            {(["day", "week", "month", "year"] as View[]).map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setView(v)}
                title={`${v.charAt(0).toUpperCase() + v.slice(1)} view`}
                className={`px-3 py-1.5 text-xs font-medium transition-colors capitalize border-r border-border last:border-r-0 ${
                  view === v ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"
                }`}
              >
                {v}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setShowFeeds((s) => !s)}
            title="Manage calendar feeds"
            className={`p-1.5 rounded-md border transition-colors ${showFeeds ? "border-primary/40 bg-primary/10 text-primary" : "border-border text-muted-foreground hover:text-foreground hover:bg-muted"}`}
          >
            <Settings2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Feed manager */}
      {showFeeds && <FeedManager feeds={feeds} onClose={() => setShowFeeds(false)} />}

      {/* Feed legend — click to toggle a feed's visibility */}
      {feeds.length > 0 && !showFeeds && (
        <div className="flex items-center gap-2 flex-wrap">
          {feeds.map((f) => {
            const hidden = hiddenFeeds.has(f.name)
            return (
              <button
                key={f.url}
                type="button"
                title={hidden ? `Show ${f.name}` : `Hide ${f.name}`}
                onClick={() => toggleFeed(f.name)}
                className={`flex items-center gap-1.5 text-xs rounded-full px-2.5 py-1 border transition-all ${hidden ? "border-border/40 text-muted-foreground/40 line-through" : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"}`}
              >
                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: hidden ? "transparent" : f.color, border: hidden ? `1.5px solid ${f.color}` : "none" }} />
                {f.name}
              </button>
            )
          })}
          <span className="text-xs text-muted-foreground ml-auto">{visibleEvents.length} event{visibleEvents.length !== 1 ? "s" : ""}</span>
        </div>
      )}

      {/* No feeds placeholder */}
      {feeds.length === 0 && !showFeeds && (
        <div className="border border-dashed border-border rounded-xl p-10 text-center">
          <p className="text-sm font-medium mb-1">No calendar feeds</p>
          <p className="text-xs text-muted-foreground max-w-xs mx-auto mb-4">
            Add an iCal feed URL to see your events here. Your university timetable URL works automatically if <code className="font-mono bg-muted px-1 rounded">ICAL_TIMETABLE_URL</code> is set in Vercel.
          </p>
          <Button size="sm" variant="outline" onClick={() => setShowFeeds(true)}>
            <Plus className="h-3.5 w-3.5 mr-1" />Add feed
          </Button>
        </div>
      )}

      {/* Calendar views */}
      {feeds.length > 0 && (
        <>
          {view === "day" && <DayView key={gridKey} events={visibleEvents} cursor={cursor} onPrev={() => advance(-1)} onNext={() => advance(1)} />}
          {view === "week" && <WeekView key={gridKey} events={visibleEvents} cursor={cursor} onPrev={() => advance(-1)} onNext={() => advance(1)} />}
          {view === "month" && <MonthView events={visibleEvents} cursor={cursor} onPrev={() => advance(-1)} onNext={() => advance(1)} onDayClick={onDayClick} />}
          {view === "year" && <YearView events={visibleEvents} cursor={cursor} onPrev={() => advance(-1)} onNext={() => advance(1)} onMonthClick={onMonthClick} />}
        </>
      )}
    </motion.div>
  )
}
