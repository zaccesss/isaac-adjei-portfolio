// Public virtual iCal feed for the daily routine.
// No auth required - this endpoint can be added as a calendar subscription URL.
// Each event uses RRULE:FREQ=WEEKLY so the feed repeats indefinitely from DTSTART.
import { NextResponse } from "next/server"

// DTSTART anchor: 2 June 2026 is a Tuesday - use the Monday of the current cycle (2 June 2026)
// All times are expressed in local UK time (Europe/London).
// Consumers that subscribe to this URL will see the events repeat weekly forever.

function uid(slug: string) {
  return `${slug}@routine.isaacadjei.com`
}

function dt(date: string, time: string) {
  // date: YYYYMMDD, time: HHMM -> YYYYMMDDTHHMMSS (local, no Z so the client treats as floating)
  return `${date}T${time}00`
}

// DTSTART anchor dates - the week of 2026-06-01 (Monday = 2026-06-01)
const MON = "20260601"
const FRI = "20260605"
const SAT = "20260606"
const SUN = "20260607"

type VEvent = {
  uid: string
  summary: string
  dtstart: string
  dtend: string
  rrule: string
  description?: string
  categories?: string
}

const events: VEvent[] = [
  // ── Mon-Fri recurring ──────────────────────────────────────────────────────
  {
    uid: uid("wake-prayer-devotion"),
    summary: "Wake up, prayer & devotion",
    dtstart: dt(MON, "0515"),
    dtend: dt(MON, "0600"),
    rrule: "FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR",
    categories: "Routine,Faith",
  },
  {
    uid: uid("gym"),
    summary: "Gym",
    dtstart: dt(MON, "0600"),
    dtend: dt(MON, "0700"),
    rrule: "FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR",
    categories: "Routine,Fitness",
  },
  {
    uid: uid("bible-study-reading"),
    summary: "Bible study & reading",
    dtstart: dt(MON, "0815"),
    dtend: dt(MON, "0915"),
    rrule: "FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR",
    categories: "Routine,Faith",
  },
  {
    uid: uid("evening-walk"),
    summary: "Evening walk",
    dtstart: dt(MON, "1800"),
    dtend: dt(MON, "1900"),
    rrule: "FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR",
    categories: "Routine,Fitness",
  },
  {
    uid: uid("sauna-steam-ice"),
    summary: "Sauna / steam / ice bath",
    dtstart: dt(MON, "1900"),
    dtend: dt(MON, "1930"),
    rrule: "FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR",
    categories: "Routine,Wellbeing",
  },
  {
    uid: uid("prayer-wind-down"),
    summary: "Prayer / wind down",
    dtstart: dt(MON, "2145"),
    dtend: dt(MON, "2200"),
    rrule: "FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR",
    categories: "Routine,Faith",
  },
  // ── Friday only ────────────────────────────────────────────────────────────
  {
    uid: uid("football"),
    summary: "Football",
    dtstart: dt(FRI, "2030"),
    dtend: dt(FRI, "2130"),
    rrule: "FREQ=WEEKLY;BYDAY=FR",
    categories: "Routine,Sport",
  },
  // ── Saturday ───────────────────────────────────────────────────────────────
  {
    uid: uid("hiit-cardio"),
    summary: "Full-Body HIIT + Cardio",
    dtstart: dt(SAT, "1045"),
    dtend: dt(SAT, "1200"),
    rrule: "FREQ=WEEKLY;BYDAY=SA",
    categories: "Routine,Fitness",
  },
  {
    uid: uid("swimming-sauna-ice"),
    summary: "Swimming / sauna / ice bath",
    dtstart: dt(SAT, "1200"),
    dtend: dt(SAT, "1300"),
    rrule: "FREQ=WEEKLY;BYDAY=SA",
    categories: "Routine,Wellbeing",
  },
  {
    uid: uid("weekly-reset-laundry"),
    summary: "Weekly reset + laundry",
    dtstart: dt(SAT, "1400"),
    dtend: dt(SAT, "1600"),
    rrule: "FREQ=WEEKLY;BYDAY=SA",
    categories: "Routine,Admin",
  },
  // ── Sunday ─────────────────────────────────────────────────────────────────
  {
    uid: uid("morning-walk"),
    summary: "Morning walk",
    dtstart: dt(SUN, "0930"),
    dtend: dt(SUN, "1030"),
    rrule: "FREQ=WEEKLY;BYDAY=SU",
    categories: "Routine,Fitness",
  },
  {
    uid: uid("church"),
    summary: "Church",
    dtstart: dt(SUN, "1100"),
    dtend: dt(SUN, "1300"),
    rrule: "FREQ=WEEKLY;BYDAY=SU",
    categories: "Routine,Faith",
  },
  {
    uid: uid("reflection-sunday-pam"),
    summary: "Reflection Sunday with Pam",
    dtstart: dt(SUN, "1800"),
    dtend: dt(SUN, "1900"),
    rrule: "FREQ=WEEKLY;BYDAY=SU",
    categories: "Routine,Relationships",
  },
]

function escapeIcal(str: string) {
  // RFC 5545 requires commas, semicolons and backslashes to be escaped in text values
  return str.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n")
}

function buildVEvent(e: VEvent): string {
  const lines = [
    "BEGIN:VEVENT",
    `UID:${e.uid}`,
    `DTSTART;TZID=Europe/London:${e.dtstart}`,
    `DTEND;TZID=Europe/London:${e.dtend}`,
    `RRULE:${e.rrule}`,
    `SUMMARY:${escapeIcal(e.summary)}`,
  ]
  if (e.description) lines.push(`DESCRIPTION:${escapeIcal(e.description)}`)
  if (e.categories) lines.push(`CATEGORIES:${e.categories}`)
  lines.push("END:VEVENT")
  return lines.join("\r\n")
}

export function GET() {
  const cal = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Isaac Adjei//Daily Routine//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "X-WR-CALNAME:Daily Routine",
    "X-WR-TIMEZONE:Europe/London",
    "X-WR-CALDESC:Isaac Adjei daily routine - recurring weekly schedule",
    ...events.map(buildVEvent),
    "END:VCALENDAR",
  ].join("\r\n")

  return new NextResponse(cal, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
      "Content-Disposition": "attachment; filename=\"routine.ics\"",
    },
  })
}
