// One shared iCal parser for the dashboard calendar and the university timetable. There used to be
// two hand-rolled copies that disagreed (different all-day handling, the timetable one did not even
// unfold lines), and both mis-parsed timezone-qualified stamps.
//
// The important fix: a DATE-TIME with no trailing Z and a TZID (or no zone at all) is a WALL-CLOCK
// time in that zone, NOT UTC. The old code built `new Date("2026-06-22T04:15:00")`, which the server
// (UTC on Vercel) read as 04:15 UTC; the browser then rendered it in Europe/London (BST) as 05:15 and
// pushed boundary events off the visible week, so the Routine and Timetable feeds appeared empty
// while UTC `...Z` feeds (e.g. the football one) worked. We now convert the wall-clock time in its
// zone to the correct absolute instant, so every feed lands on the right day and time.

export type ICalEvent = {
  uid: string
  summary: string
  dtstart: Date
  dtend: Date
  allDay: boolean
  location?: string
  description?: string
}

const DEFAULT_TZ = "Europe/London"

// RFC 5545 line unfolding: a CRLF (or LF) followed by a single space or tab continues the line.
export function unfoldIcal(text: string): string {
  return text.replace(/\r?\n[ \t]/g, "")
}

// RFC 5545 TEXT unescaping: \n or \N -> newline, \, -> comma, \; -> semicolon, \\ -> backslash.
export function unescapeIcalText(s: string): string {
  return s.replace(/\\([\\;,nN])/g, (_, c) => (c === "n" || c === "N" ? "\n" : c))
}

// Read one property from a VEVENT block. Anchored to the start of a line (so DTSTART does not match
// inside an X- line or a longer property name) and returns the TZID parameter when present.
export function getIcalProp(vevent: string, prop: string): { value: string; tzid?: string } | null {
  const re = new RegExp(`^${prop}((?:;[^:\\r\\n]*)?):([^\\r\\n]+)`, "m")
  const m = vevent.match(re)
  if (!m) return null
  const tzid = m[1].match(/TZID=([^;:]+)/i)?.[1]
  return { value: m[2].trim(), tzid }
}

// Offset (ms) between a timezone's wall clock and UTC at a given instant.
function tzOffsetMs(instant: number, timeZone: string): number {
  const dtf = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hourCycle: "h23",
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", second: "2-digit",
  })
  const parts = dtf.formatToParts(new Date(instant))
  const get = (t: string) => Number(parts.find((p) => p.type === t)?.value)
  const asUTC = Date.UTC(get("year"), get("month") - 1, get("day"), get("hour"), get("minute"), get("second"))
  return asUTC - instant
}

// Convert a wall-clock time in `timeZone` to the correct UTC instant (DST-aware).
function wallClockToUTC(y: number, mo: number, d: number, h: number, mi: number, s: number, timeZone: string): Date {
  const guess = Date.UTC(y, mo - 1, d, h, mi, s)
  return new Date(guess - tzOffsetMs(guess, timeZone))
}

// Parse an iCal DATE or DATE-TIME value. `tzid` is the property's TZID parameter, if any.
export function parseICalDate(raw: string, tzid?: string): { date: Date; allDay: boolean } | null {
  if (!raw) return null
  const v = raw.trim()

  // All-day DATE value: YYYYMMDD. Anchor to local noon so the calendar day is unambiguous whatever
  // the viewer's timezone, and flag it so callers do not have to infer all-day from a 00:00 clock.
  if (/^\d{8}$/.test(v)) {
    return { date: new Date(+v.slice(0, 4), +v.slice(4, 6) - 1, +v.slice(6, 8), 12, 0, 0), allDay: true }
  }

  const m = v.match(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})(Z)?$/)
  if (!m) return null
  const [, ys, mos, ds, hs, mis, ss, z] = m
  const y = +ys, mo = +mos, d = +ds, h = +hs, mi = +mis, s = +ss
  if (z) {
    // Absolute UTC.
    return { date: new Date(Date.UTC(y, mo - 1, d, h, mi, s)), allDay: false }
  }
  // Floating or TZID-qualified: a wall-clock time in the named zone (default Europe/London for this
  // London-based dashboard), converted to the correct absolute instant.
  return { date: wallClockToUTC(y, mo, d, h, mi, s, tzid || DEFAULT_TZ), allDay: false }
}

const DAY_NAME_TO_NUM: Record<string, number> = { SU: 0, MO: 1, TU: 2, WE: 3, TH: 4, FR: 5, SA: 6 }

// Expand a FREQ=WEEKLY|DAILY|MONTHLY RRULE into concrete start/end pairs inside [windowStart, windowEnd].
// Returns [] for patterns we do not handle, so the caller can fall back to the single anchor occurrence.
export function expandRRule(
  dtstart: Date, dtend: Date, rrule: string, windowStart: Date, windowEnd: Date,
): Array<{ start: Date; end: Date }> {
  const freq = rrule.match(/FREQ=(\w+)/)?.[1]
  if (!freq || !["WEEKLY", "DAILY", "MONTHLY"].includes(freq)) return []
  const duration = dtend.getTime() - dtstart.getTime()
  const interval = parseInt(rrule.match(/INTERVAL=(\d+)/)?.[1] ?? "1", 10) || 1
  const untilRaw = rrule.match(/UNTIL=([^;]+)/)?.[1]
  // UNTIL is an absolute, usually Z-suffixed (UTC), instant. A date-only UNTIL bounds the
  // whole calendar day, so I push it to end-of-day UTC. I compare instants with getTime()
  // below so the cutoff is evaluated in UTC, never against a local wall-clock reading.
  const untilParsed = untilRaw ? parseICalDate(untilRaw) : null
  const until = untilParsed
    ? (untilParsed.allDay ? untilParsed.date.getTime() + 86400000 - 1 : untilParsed.date.getTime())
    : null
  const countMatch = rrule.match(/COUNT=(\d+)/)
  const maxCount = countMatch ? parseInt(countMatch[1], 10) : Infinity

  const results: Array<{ start: Date; end: Date }> = []
  const push = (start: Date) => {
    if (start < dtstart) return
    if (until !== null && start.getTime() > until) return
    if (start < windowStart || start > windowEnd) return
    results.push({ start, end: new Date(start.getTime() + duration) })
  }

  if (freq === "DAILY") {
    const cur = new Date(dtstart)
    for (let i = 0; cur <= windowEnd && results.length < maxCount && i < 1000; i++) {
      if (cur >= windowStart) push(new Date(cur))
      cur.setDate(cur.getDate() + interval)
    }
  } else if (freq === "MONTHLY") {
    const cur = new Date(dtstart)
    for (let i = 0; cur <= windowEnd && results.length < maxCount && i < 600; i++) {
      if (cur >= windowStart) push(new Date(cur))
      cur.setMonth(cur.getMonth() + interval)
    }
  } else {
    // WEEKLY
    const bydays = (rrule.match(/BYDAY=([^;]+)/)?.[1]?.split(",").map((x) => DAY_NAME_TO_NUM[x.trim()]).filter((n) => n !== undefined)) ?? [dtstart.getDay()]
    const anchorDay = dtstart.getDay()
    const cursor = new Date(windowStart)
    cursor.setDate(cursor.getDate() - 7 * interval)
    while (cursor.getDay() !== anchorDay) cursor.setDate(cursor.getDate() - 1)
    for (let week = 0; cursor <= windowEnd && results.length < maxCount; week++) {
      for (const dayNum of bydays) {
        const occ = new Date(cursor)
        occ.setDate(occ.getDate() + ((dayNum - anchorDay + 7) % 7))
        occ.setHours(dtstart.getHours(), dtstart.getMinutes(), dtstart.getSeconds(), 0)
        push(occ)
      }
      cursor.setDate(cursor.getDate() + 7 * interval)
      if (week > 300) break
    }
  }
  results.sort((a, b) => a.start.getTime() - b.start.getTime())
  return results
}

// Parse all VEVENTs from an iCal document. RRULE recurrences are expanded inside the given window;
// rruleWindow defaults to 60 days back / 400 days ahead.
export function parseVEvents(
  rawText: string,
  rruleWindow?: { start: Date; end: Date },
): Array<ICalEvent & { recurrenceId?: string }> {
  const text = unfoldIcal(rawText)
  const winStart = rruleWindow?.start ?? new Date(Date.now() - 60 * 86400000)
  const winEnd = rruleWindow?.end ?? new Date(Date.now() + 400 * 86400000)
  const out: Array<ICalEvent & { recurrenceId?: string }> = []

  for (const vevent of text.split("BEGIN:VEVENT").slice(1)) {
    const uid = getIcalProp(vevent, "UID")?.value ?? ""
    const summaryProp = getIcalProp(vevent, "SUMMARY")
    const summary = summaryProp ? unescapeIcalText(summaryProp.value) : ""
    const startProp = getIcalProp(vevent, "DTSTART")
    const endProp = getIcalProp(vevent, "DTEND")
    const start = startProp ? parseICalDate(startProp.value, startProp.tzid) : null
    const end = endProp ? parseICalDate(endProp.value, endProp.tzid) : null
    if (!uid || !summary || !start || !end) continue

    const location = getIcalProp(vevent, "LOCATION")?.value
    const description = getIcalProp(vevent, "DESCRIPTION")?.value
    const base: ICalEvent = {
      uid,
      summary,
      dtstart: start.date,
      dtend: end.date,
      allDay: start.allDay,
      location: location ? unescapeIcalText(location) : undefined,
      description: description ? unescapeIcalText(description) : undefined,
    }

    const rrule = getIcalProp(vevent, "RRULE")?.value
    if (rrule) {
      const occ = expandRRule(start.date, end.date, rrule, winStart, winEnd)
      if (occ.length > 0) {
        occ.forEach(({ start: s, end: e }, i) => out.push({ ...base, uid: `${uid}-${i}`, dtstart: s, dtend: e, recurrenceId: s.toISOString() }))
        continue
      }
    }
    out.push(base)
  }

  out.sort((a, b) => a.dtstart.getTime() - b.dtstart.getTime())
  return out
}
