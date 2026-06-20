"use client"

import { useState, useRef, useEffect, useTransition } from "react"
import { CalendarDays, MapPin, Clock, Info, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Plus, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { createCalendarEvent } from "@/app/dashboard/actions"

// ── types ─────────────────────────────────────────────────────────────────────

type Attendance = "present" | "absent" | "late"

type ICalEvent = {
  uid: string; summary: string; dtstart: Date; dtend: Date
  location?: string; description?: string
  isCustom?: boolean
}

export type CustomEvent = {
  id: string
  title: string
  start_at: string
  end_at: string
  location?: string
  description?: string
  colour: string
  all_day: boolean
}

type View = "day" | "week" | "month" | "year"

// ── helpers ───────────────────────────────────────────────────────────────────

const DAYS_SHORT = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
const DAYS_LONG = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
const MONTHS_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
const CELL_H = 56
const HOUR_START = 8
const HOUR_END = 21
const HOURS = Array.from({ length: HOUR_END - HOUR_START }, (_, i) => i + HOUR_START)

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}

function fmtTime(d: Date) {
  return new Date(d).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })
}

function fmtDate(d: Date) {
  const dt = new Date(d)
  return `${DAYS_SHORT[(dt.getDay() + 6) % 7]} ${dt.getDate()} ${MONTHS_SHORT[dt.getMonth()]}`
}

function isToday(d: Date) {
  const now = new Date()
  const dt = new Date(d)
  return dt.getDate() === now.getDate() && dt.getMonth() === now.getMonth() && dt.getFullYear() === now.getFullYear()
}

function isFuture(d: Date) {
  return new Date(d) >= new Date()
}

function getWeekStart(d: Date) {
  const copy = new Date(d)
  const dow = (copy.getDay() + 6) % 7
  copy.setDate(copy.getDate() - dow)
  copy.setHours(0, 0, 0, 0)
  return copy
}

function minsFromMidnight(d: Date) {
  return d.getHours() * 60 + d.getMinutes()
}

// ── attendance card (list views) ──────────────────────────────────────────────

function attendanceKey(uid: string, date: Date) {
  return `tt_att_${uid}_${date.toISOString().slice(0, 10)}`
}
function notesKey(uid: string, date: Date) {
  return `tt_note_${uid}_${date.toISOString().slice(0, 10)}`
}

function EventCard({ e }: { e: ICalEvent }) {
  const [att, setAtt] = useState<Attendance | null>(
    () => typeof window !== "undefined" ? localStorage.getItem(attendanceKey(e.uid, e.dtstart)) as Attendance | null : null
  )
  const [note, setNote] = useState(
    () => typeof window !== "undefined" ? localStorage.getItem(notesKey(e.uid, e.dtstart)) ?? "" : ""
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
    <div className={`rounded-xl border bg-card px-4 py-3 space-y-2 hover:border-primary/30 transition-colors ${e.isCustom ? "border-violet-500/30 bg-violet-500/5" : "border-border/60"}`}>
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
        {e.isCustom && <span className="text-[10px] bg-violet-500/15 text-violet-600 px-1.5 py-0.5 rounded-full border border-violet-500/30">Custom</span>}
      </div>
      {!e.isCustom && (
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
      )}
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

// ── week/day time grid ────────────────────────────────────────────────────────

function layoutEvents(evs: ICalEvent[]) {
  const placed: { event: ICalEvent; col: number; cols: number }[] = []
  let maxEnd = 0
  let groupStart = 0

  for (let i = 0; i < evs.length; i++) {
    const e = evs[i]
    const start = minsFromMidnight(e.dtstart)
    const end = minsFromMidnight(e.dtend)
    if (start >= maxEnd) { groupStart = i }
    maxEnd = Math.max(maxEnd, end)
    const usedCols = placed.slice(groupStart).map((p) => {
      const s2 = minsFromMidnight(p.event.dtstart)
      const e2 = minsFromMidnight(p.event.dtend)
      return s2 < end && e2 > start ? p.col : -1
    })
    let col = 0
    while (usedCols.includes(col)) col++
    placed.push({ event: e, col, cols: 1 })
  }

  let i = 0
  while (i < placed.length) {
    let end = minsFromMidnight(placed[i].event.dtend)
    let j = i + 1
    while (j < placed.length) {
      const s2 = minsFromMidnight(placed[j].event.dtstart)
      if (s2 >= end) break
      end = Math.max(end, minsFromMidnight(placed[j].event.dtend))
      j++
    }
    const groupMax = placed.slice(i, j).reduce((m, p) => Math.max(m, p.col), 0) + 1
    for (let k = i; k < j; k++) placed[k].cols = groupMax
    i = j
  }
  return placed
}

function TimeGrid({ days, events }: { days: Date[]; events: ICalEvent[] }) {
  const today = new Date()
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!scrollRef.current) return
    const nowMins = today.getHours() * 60 + today.getMinutes()
    const scrollTo = Math.max(0, ((nowMins - HOUR_START * 60) / 60) * CELL_H - 100)
    scrollRef.current.scrollTop = scrollTo
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const timedByDay = days.map((day) =>
    events
      .filter((e) => isSameDay(e.dtstart, day))
      .sort((a, b) => a.dtstart.getTime() - b.dtstart.getTime())
  )

  return (
    <div ref={scrollRef} className="flex overflow-y-auto" style={{ maxHeight: "65vh" }}>
      {/* Hour labels */}
      <div className="w-14 shrink-0 flex flex-col">
        {HOURS.map((h) => (
          <div key={h} className="flex items-start justify-end pr-2 text-[10px] text-muted-foreground shrink-0" style={{ height: CELL_H }}>
            {`${h.toString().padStart(2, "0")}:00`}
          </div>
        ))}
      </div>

      {/* Day columns */}
      <div className="flex-1 grid relative" style={{ gridTemplateColumns: `repeat(${days.length}, 1fr)` }}>
        {days.map((day, di) => {
          const todayFlag = isSameDay(day, today)
          const placed = layoutEvents(timedByDay[di])
          const nowMins = todayFlag ? today.getHours() * 60 + today.getMinutes() : -1

          return (
            <div
              key={di}
              className={`relative border-l border-border ${todayFlag ? "bg-primary/[0.02]" : ""}`}
              style={{ height: CELL_H * HOURS.length }}
            >
              {HOURS.map((h) => (
                <div key={h} className="absolute w-full border-t border-border/30" style={{ top: (h - HOUR_START) * CELL_H }} />
              ))}

              {nowMins >= HOUR_START * 60 && nowMins < HOUR_END * 60 && (
                <div className="absolute w-full z-10" style={{ top: ((nowMins - HOUR_START * 60) / 60) * CELL_H }}>
                  <div className="relative">
                    <div className="absolute left-0 w-2 h-2 rounded-full bg-red-500 -translate-y-1" />
                    <div className="h-px bg-red-500" />
                  </div>
                </div>
              )}

              {placed.map(({ event, col, cols }) => {
                const startMins = minsFromMidnight(event.dtstart)
                const endMins = minsFromMidnight(event.dtend)
                const clampedStart = Math.max(startMins, HOUR_START * 60)
                const clampedEnd = Math.min(endMins, HOUR_END * 60)
                const duration = Math.max(clampedEnd - clampedStart, 20)
                const top = ((clampedStart - HOUR_START * 60) / 60) * CELL_H
                const height = (duration / 60) * CELL_H
                const width = `${100 / cols}%`
                const left = `${(col / cols) * 100}%`

                return (
                  <div key={event.uid} className="absolute px-0.5 py-0.5" style={{ top, height, left, width }}>
                    <div
                      className={`h-full rounded-lg px-1.5 py-1 overflow-hidden text-[10px] leading-snug font-medium shadow-sm ${
                        event.isCustom
                          ? "bg-violet-500/15 border border-violet-500/30 text-violet-700 dark:text-violet-300"
                          : "bg-primary/15 border border-primary/30 text-primary"
                      }`}
                    >
                      <div className="font-semibold truncate">{event.summary}</div>
                      {height > 32 && <div className="opacity-80 truncate">{fmtTime(event.dtstart)} - {fmtTime(event.dtend)}</div>}
                      {height > 52 && event.location && <div className="opacity-75 truncate">📍 {event.location}</div>}
                    </div>
                  </div>
                )
              })}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── day view ──────────────────────────────────────────────────────────────────

function DayView({ events, cursor, onPrev, onNext }: { events: ICalEvent[]; cursor: Date; onPrev: () => void; onNext: () => void }) {
  const today = new Date()
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <Button size="icon" variant="ghost" className="h-7 w-7" title="Previous day" onClick={onPrev}><ChevronLeft className="h-4 w-4" /></Button>
        <span className={`font-semibold flex-1 text-center text-sm ${isSameDay(cursor, today) ? "text-primary" : ""}`}>
          {cursor.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
        </span>
        <Button size="icon" variant="ghost" className="h-7 w-7" title="Next day" onClick={onNext}><ChevronRight className="h-4 w-4" /></Button>
      </div>
      <div className="border border-border rounded-xl overflow-hidden bg-card">
        {/* Day header */}
        <div className="flex border-b border-border">
          <div className="w-14 shrink-0" />
          <div className={`flex-1 text-center py-2 border-l border-border ${isSameDay(cursor, today) ? "bg-primary/5" : ""}`}>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{DAYS_LONG[cursor.getDay()]}</p>
            <span className={`w-7 h-7 inline-flex items-center justify-center rounded-full text-sm font-semibold mx-auto mt-0.5 ${isSameDay(cursor, today) ? "bg-primary text-primary-foreground" : ""}`}>
              {cursor.getDate()}
            </span>
          </div>
        </div>
        <TimeGrid days={[cursor]} events={events} />
      </div>
    </div>
  )
}

// ── week view ─────────────────────────────────────────────────────────────────

function WeekView({ events, cursor, onPrev, onNext }: { events: ICalEvent[]; cursor: Date; onPrev: () => void; onNext: () => void }) {
  const weekStart = getWeekStart(cursor)
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart)
    d.setDate(weekStart.getDate() + i)
    return d
  })
  const today = new Date()
  const rangeLabel = `${days[0].getDate()} ${MONTHS_SHORT[days[0].getMonth()]} - ${days[6].getDate()} ${MONTHS_SHORT[days[6].getMonth()]} ${days[6].getFullYear()}`

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <Button size="icon" variant="ghost" className="h-7 w-7" title="Previous week" onClick={onPrev}><ChevronLeft className="h-4 w-4" /></Button>
        <span className="font-semibold flex-1 text-center text-sm">{rangeLabel}</span>
        <Button size="icon" variant="ghost" className="h-7 w-7" title="Next week" onClick={onNext}><ChevronRight className="h-4 w-4" /></Button>
      </div>
      <div className="border border-border rounded-xl overflow-hidden bg-card">
        <div className="flex border-b border-border">
          <div className="w-14 shrink-0" />
          {days.map((day, i) => {
            const todayFlag = isSameDay(day, today)
            return (
              <div key={i} className={`flex-1 text-center py-2 border-l border-border first:border-l-0 ${todayFlag ? "bg-primary/5" : ""}`}>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{DAYS_SHORT[i]}</p>
                <span className={`w-7 h-7 inline-flex items-center justify-center rounded-full text-sm font-semibold mx-auto mt-0.5 ${todayFlag ? "bg-primary text-primary-foreground" : ""}`}>
                  {day.getDate()}
                </span>
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

function MonthView({ events, cursor, onPrev, onNext }: { events: ICalEvent[]; cursor: Date; onPrev: () => void; onNext: () => void }) {
  const [selectedDay, setSelectedDay] = useState<Date | null>(null)
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
  const selectedEvents = selectedDay ? events.filter((e) => isSameDay(e.dtstart, selectedDay)) : []

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <Button size="icon" variant="ghost" className="h-7 w-7" title="Previous month" onClick={onPrev}><ChevronLeft className="h-4 w-4" /></Button>
        <span className="font-semibold flex-1 text-center">{MONTHS[month]} {year}</span>
        <Button size="icon" variant="ghost" className="h-7 w-7" title="Next month" onClick={onNext}><ChevronRight className="h-4 w-4" /></Button>
      </div>
      <div className="border border-border rounded-xl overflow-hidden">
        <div className="grid grid-cols-7 bg-muted/50">
          {DAYS_SHORT.map((d) => (
            <div key={d} className="text-center text-[10px] font-medium text-muted-foreground py-2">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-px bg-border">
          {cells.map((cell, i) => {
            if (!cell) return <div key={i} className="bg-muted/20 min-h-[64px]" />
            const dayEvs = events.filter((e) => isSameDay(e.dtstart, cell))
            const todayFlag = isSameDay(cell, today)
            const isSelected = selectedDay && isSameDay(cell, selectedDay)
            return (
              <button
                key={i}
                type="button"
                title={`${cell.getDate()} ${MONTHS[cell.getMonth()]}`}
                onClick={() => setSelectedDay(isSelected ? null : cell)}
                className={`bg-card min-h-[64px] p-1 flex flex-col gap-0.5 text-left hover:bg-muted/40 transition-colors ${isSelected ? "ring-1 ring-inset ring-primary" : ""}`}
              >
                <span className={`text-xs font-medium self-start leading-none w-5 h-5 flex items-center justify-center rounded-full ${todayFlag ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}>
                  {cell.getDate()}
                </span>
                {dayEvs.slice(0, 2).map((e) => (
                  <div
                    key={e.uid}
                    className={`w-full text-[10px] px-1 py-0.5 rounded truncate font-medium ${e.isCustom ? "bg-violet-500/15 text-violet-700 dark:text-violet-300" : "bg-primary/15 text-primary"}`}
                    title={e.summary}
                  >
                    {e.summary}
                  </div>
                ))}
                {dayEvs.length > 2 && (
                  <span className="text-[10px] text-muted-foreground px-1">+{dayEvs.length - 2} more</span>
                )}
              </button>
            )
          })}
        </div>
      </div>
      {selectedDay && (
        <div className="border border-border rounded-xl p-4 bg-card space-y-3">
          <p className="text-sm font-semibold">{selectedDay.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })}</p>
          {selectedEvents.length === 0 ? (
            <p className="text-sm text-muted-foreground">No events on this day.</p>
          ) : (
            <div className="space-y-2">
              {selectedEvents.map((e) => <EventCard key={e.uid} e={e} />)}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ── year view ─────────────────────────────────────────────────────────────────

function YearView({ events, cursor, onPrev, onNext, onMonthClick }: {
  events: ICalEvent[]
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

// ── add event mini-form ───────────────────────────────────────────────────────

function AddEventForm({ onClose }: { onClose: () => void }) {
  const [title, setTitle] = useState("")
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [startTime, setStartTime] = useState("09:00")
  const [endTime, setEndTime] = useState("10:00")
  const [saving, setSaving] = useState(false)
  const [, startTransition] = useTransition()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    setSaving(true)
    startTransition(async () => {
      await createCalendarEvent({
        title: title.trim(),
        start_at: `${date}T${startTime}:00`,
        end_at: `${date}T${endTime}:00`,
        colour: "#8b5cf6",
        all_day: false,
        event_type: "timetable",
      })
      setSaving(false)
      onClose()
    })
  }

  return (
    <div className="border border-violet-500/30 rounded-xl p-4 bg-violet-500/5">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-medium">Add timetable event</p>
        <button type="button" title="Close" onClick={onClose} className="text-muted-foreground hover:text-foreground">
          <X className="h-4 w-4" />
        </button>
      </div>
      <form onSubmit={handleSubmit} className="flex flex-col gap-2">
        <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Event title" required className="h-8 text-sm" autoFocus />
        <div className="flex gap-2">
          <input
            type="date"
            value={date}
            title="Event date"
            aria-label="Event date"
            onChange={(e) => setDate(e.target.value)}
            className="flex-1 h-8 rounded-md border border-input bg-transparent px-2 py-1 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />
          <input
            type="time"
            value={startTime}
            title="Start time"
            aria-label="Start time"
            onChange={(e) => setStartTime(e.target.value)}
            className="w-24 h-8 rounded-md border border-input bg-transparent px-2 py-1 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />
          <input
            type="time"
            value={endTime}
            title="End time"
            aria-label="End time"
            onChange={(e) => setEndTime(e.target.value)}
            className="w-24 h-8 rounded-md border border-input bg-transparent px-2 py-1 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />
        </div>
        <div className="flex justify-end gap-2 pt-1">
          <Button type="button" variant="ghost" size="sm" onClick={onClose}>Cancel</Button>
          <Button type="submit" size="sm" disabled={saving || !title.trim()}>{saving ? "Adding..." : "Add event"}</Button>
        </div>
      </form>
    </div>
  )
}

// ── main component ────────────────────────────────────────────────────────────

export default function TimetableClient({
  events,
  hasUrl,
  customEvents = [],
}: {
  events: ICalEvent[]
  hasUrl: boolean
  customEvents?: CustomEvent[]
}) {
  const [view, setView] = useState<View>("week")
  const [cursor, setCursor] = useState(() => new Date())
  const [showAddForm, setShowAddForm] = useState(false)

  // Merge custom events into the ICalEvent format
  const mergedCustom: ICalEvent[] = customEvents.map((ce) => ({
    uid: ce.id,
    summary: ce.title,
    dtstart: new Date(ce.start_at),
    dtend: new Date(ce.end_at),
    location: ce.location,
    description: ce.description,
    isCustom: true,
  }))

  const allEvents = [...events, ...mergedCustom]

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

  // Upcoming fallback for when there are no events in the current grid window
  const upcomingEvents = allEvents.filter((e) => isFuture(e.dtstart)).slice(0, 20)

  // Group upcoming by day
  const byDay = new Map<string, ICalEvent[]>()
  for (const e of upcomingEvents) {
    const key = new Date(e.dtstart).toDateString()
    if (!byDay.has(key)) byDay.set(key, [])
    byDay.get(key)!.push(e)
  }

  return (
    <div className="p-6 space-y-5 max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-2xl font-bold">Timetable</h1>
          <p className="text-sm text-muted-foreground mt-0.5">University timetable</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowAddForm((v) => !v)}
            className="h-7 text-xs gap-1"
          >
            <Plus className="h-3 w-3" />
            Add event
          </Button>
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
            onClick={() => { setCursor(new Date()) }}
            title="Jump to today"
            className="px-3 py-1.5 text-xs border border-border rounded-md hover:bg-muted transition-colors font-medium"
          >
            Today
          </button>
        </div>
      </div>

      {showAddForm && <AddEventForm onClose={() => setShowAddForm(false)} />}

      {!hasUrl && allEvents.length === 0 && (
        <div className="flex items-start gap-2 rounded-lg bg-blue-500/10 border border-blue-500/20 px-4 py-3 text-sm text-blue-600">
          <Info className="h-4 w-4 shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">No timetable URL configured</p>
            <p className="text-xs mt-0.5 text-blue-500">Add <code className="bg-blue-500/10 px-1 rounded">ICAL_TIMETABLE_URL</code> to your Vercel environment variables with your university iCal feed URL.</p>
          </div>
        </div>
      )}

      {/* Grid views */}
      {view === "day" && (
        <DayView events={allEvents} cursor={cursor} onPrev={() => advance(-1)} onNext={() => advance(1)} />
      )}
      {view === "week" && (
        <WeekView events={allEvents} cursor={cursor} onPrev={() => advance(-1)} onNext={() => advance(1)} />
      )}
      {view === "month" && (
        <MonthView events={allEvents} cursor={cursor} onPrev={() => advance(-1)} onNext={() => advance(1)} />
      )}
      {view === "year" && (
        <YearView
          events={allEvents}
          cursor={cursor}
          onPrev={() => advance(-1)}
          onNext={() => advance(1)}
          onMonthClick={(mi) => {
            setCursor((prev) => new Date(prev.getFullYear(), mi, 1))
            setView("month")
          }}
        />
      )}

      {/* Upcoming fallback shown when no grid view has events */}
      {(view === "week" || view === "day") && upcomingEvents.length > 0 && allEvents.filter((e) => {
        const ws = getWeekStart(cursor)
        const we = new Date(ws)
        we.setDate(ws.getDate() + (view === "week" ? 7 : 1))
        return e.dtstart >= ws && e.dtstart < we
      }).length === 0 && (
        <div className="space-y-4">
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Upcoming sessions</p>
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
