// I gather every tracked area for a time window (the last N hours) and reduce it to the figures the digest
// summary and templates need. One shared gatherer so the weekly email and the daily Discord digest stay
// consistent and comprehensive. Window-based counts use the applied_date/date/created_at columns; the
// deadlines, calendar events and expiring items look forward from today regardless of the window, since
// those are "coming up" nudges rather than "what happened this period".
import { supabase } from "@/lib/supabase"
import { getExpiringItems } from "@/lib/vault-expiry-check"
import { posts } from "@/data/blog"
import { tilEntries } from "@/data/til"
import type { DigestFacts } from "@/lib/digest-ai-summary"

export type DigestData = {
  facts: DigestFacts
  appliedList: { company: string; role: string; url: string | null }[]
  followUps: { name: string; last_contact: string | null }[]
  expiring: { name: string; type: string; daysLeft: number }[]
}

const INTERVIEW_STATUSES = new Set([
  "Interview",
  "Assessment Centre",
  "Video Interview",
  "Face-to-face Interview",
  "Telephone Interview",
])

const round1 = (n: number): number => Math.round(n * 10) / 10

// PRIVACY: I only ever describe an expiring vault item to the AI by its TYPE, never its name, and never
// its secret value (the value column is not read anywhere in this flow). So the summary can nudge "an API
// key expires soon" without any of my vault contents leaving the database for an external model. The full
// item names stay in the email and Discord below, which only I see.
const TYPE_LABELS: Record<string, string> = {
  api_key: "an API key",
  password: "a password",
  card: "a card",
  passport: "a passport",
  warranty: "a warranty",
}
const humanizeType = (t: string): string => TYPE_LABELS[t] ?? "an item"

export async function gatherDigestData(hoursBack: number, period: string): Promise<DigestData> {
  const now = new Date()
  const since = new Date(now.getTime() - hoursBack * 3_600_000)
  const sinceIso = since.toISOString()
  const sinceDate = sinceIso.slice(0, 10)
  const today = now.toISOString().slice(0, 10)
  const horizon = new Date(now.getTime() + 14 * 86_400_000).toISOString().slice(0, 10)
  const in7 = new Date(now.getTime() + 7 * 86_400_000).toISOString()
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 86_400_000).toISOString().slice(0, 10)

  const [
    goalsR,
    appsR,
    streaksR,
    habitLogsR,
    habitsR,
    codingR,
    studyR,
    faithR,
    fitnessR,
    deadlinesR,
    diaryR,
    followR,
    eventsR,
    readsR,
    osR,
    weightR,
    weightGoalR,
    expiring,
  ] = await Promise.all([
    supabase.from("goals").select("status,updated_at").gte("updated_at", sinceIso),
    supabase
      .from("applications")
      .select("company,role,status,url,applied_date")
      .not("status", "in", '("Not Applied","Not Interested","scraped")')
      .gte("applied_date", sinceDate),
    supabase.from("streak_logs").select("streak_id,date").gte("date", sinceDate),
    supabase.from("habit_logs").select("habit_id,date").gte("date", sinceDate),
    supabase.from("habits").select("id", { count: "exact", head: true }).eq("active", true),
    supabase.from("wakatime_daily").select("date,total_seconds,languages").gte("date", sinceDate),
    supabase.from("study_sessions").select("duration_m,date").gte("date", sinceDate),
    supabase.from("faith_entries").select("id,date").gte("date", sinceDate),
    supabase.from("strava_activities").select("distance_m,start_date").gte("start_date", sinceIso),
    supabase
      .from("uni_deadlines")
      .select("title,due_date,status")
      .gte("due_date", today)
      .lte("due_date", horizon)
      .neq("status", "graded")
      .order("due_date", { ascending: true }),
    supabase.from("diary").select("mood,created_at").gte("created_at", sinceIso).order("created_at", { ascending: false }),
    supabase
      .from("contacts")
      .select("name,last_contact,follow_up")
      .or(`follow_up.eq.true,last_contact.lt.${thirtyDaysAgo}`)
      .order("last_contact", { ascending: true, nullsFirst: true })
      .limit(10),
    supabase
      .from("calendar_events")
      .select("title,start_at")
      .eq("is_deleted", false)
      .gte("start_at", now.toISOString())
      .lte("start_at", in7)
      .order("start_at", { ascending: true })
      .limit(20),
    supabase.from("blog_read_events").select("id", { count: "exact", head: true }).gte("created_at", sinceIso),
    supabase.from("opensource_contributions").select("id", { count: "exact", head: true }).gte("created_at", sinceIso),
    supabase.from("body_metrics").select("value,date").eq("metric", "weight_kg").order("date", { ascending: false }).limit(90),
    supabase.from("config").select("value").eq("key", "weight_goal").maybeSingle(),
    getExpiringItems(),
  ])

  const goals = goalsR.data ?? []
  const apps = appsR.data ?? []
  const streakLogs = streaksR.data ?? []
  const habitLogs = habitLogsR.data ?? []
  const coding = codingR.data ?? []
  const study = studyR.data ?? []
  const faith = faithR.data ?? []
  const fitness = fitnessR.data ?? []
  const deadlines = deadlinesR.data ?? []
  const diary = diaryR.data ?? []
  const followUps = (followR.data ?? []).map((c) => ({ name: c.name as string, last_contact: c.last_contact as string | null }))
  const events = eventsR.data ?? []

  // Coding hours and the top languages for the window
  const codingSeconds = coding.reduce((a, r) => a + (r.total_seconds ?? 0), 0)
  const langAgg: Record<string, number> = {}
  for (const r of coding) {
    for (const l of ((r.languages as { name: string; total_seconds: number }[] | null) ?? [])) {
      langAgg[l.name] = (langAgg[l.name] ?? 0) + (l.total_seconds ?? 0)
    }
  }
  const topLanguages = Object.entries(langAgg)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([n]) => n)
    .join(", ")

  const studyMinutes = study.reduce((a, r) => a + (r.duration_m ?? 0), 0)
  const fitnessMetres = fitness.reduce((a, r) => a + (r.distance_m ?? 0), 0)

  const nextDl = deadlines[0] as { title: string; due_date: string } | undefined
  const nextDeadline = nextDl
    ? `${nextDl.title} (${Math.max(0, Math.ceil((new Date(nextDl.due_date).getTime() - now.getTime()) / 86_400_000))}d)`
    : null

  const nextEv = events[0] as { title: string; start_at: string } | undefined
  const nextEvent = nextEv
    ? `${nextEv.title} (${Math.max(0, Math.ceil((new Date(nextEv.start_at).getTime() - now.getTime()) / 86_400_000))}d)`
    : null

  // Weight: latest logged value, and the change across the window (current minus the oldest log in it).
  const weightLogs = (weightR.data ?? []) as { value: number; date: string }[]
  const currentWeight = weightLogs[0]?.value ?? null
  const windowWeights = weightLogs.filter((w) => w.date >= sinceDate)
  const weightChange =
    currentWeight != null && windowWeights.length >= 2 ? round1(currentWeight - windowWeights[windowWeights.length - 1].value) : null

  // Weight-loss goal projection: how far to target, and a date estimated from the last 28 days' rate.
  const goal = (weightGoalR.data?.value as { startWeight: number; targetWeight: number; targetDate: string } | undefined) ?? null
  let weightGoal: string | null = null
  if (goal && currentWeight != null) {
    const remaining = round1(currentWeight - goal.targetWeight)
    const fmt = (d: Date) => d.toLocaleDateString("en-GB", { day: "numeric", month: "short" })
    if (remaining <= 0) {
      weightGoal = `reached your ${goal.targetWeight}kg goal`
    } else {
      const cutoff28 = new Date(now.getTime() - 28 * 86_400_000).toISOString().slice(0, 10)
      const recent28 = weightLogs.filter((w) => w.date >= cutoff28)
      const oldest28 = recent28[recent28.length - 1]
      let ratePerWeek: number | null = null
      if (oldest28 && oldest28.date < weightLogs[0].date) {
        const days = (new Date(weightLogs[0].date).getTime() - new Date(oldest28.date).getTime()) / 86_400_000
        if (days >= 3) ratePerWeek = ((oldest28.value - currentWeight) / days) * 7
      }
      if (ratePerWeek != null && ratePerWeek > 0) {
        const projected = new Date(now.getTime() + (remaining / ratePerWeek) * 7 * 86_400_000)
        const onTrack = projected <= new Date(goal.targetDate)
        weightGoal = `${remaining}kg to your ${goal.targetWeight}kg goal, ${onTrack ? "on track for" : "behind, projected"} ${fmt(projected)} (target ${fmt(new Date(goal.targetDate))})`
      } else {
        weightGoal = `${remaining}kg to your ${goal.targetWeight}kg goal`
      }
    }
  }

  // Posts and TILs published in the window, from the static content (their dates are the publish dates).
  const published =
    posts.filter((p) => (p as { date?: string }).date && new Date((p as { date: string }).date) >= since).length +
    tilEntries.filter((t) => (t as { date?: string }).date && new Date((t as { date: string }).date) >= since).length

  const expiringSoon =
    expiring.length > 0
      ? expiring.slice(0, 3).map((e) => `${humanizeType(e.type)} in ${e.daysLeft < 0 ? "now (expired)" : `${e.daysLeft}d`}`).join(", ")
      : null

  const facts: DigestFacts = {
    period,
    applied: apps.length,
    interviews: apps.filter((a) => INTERVIEW_STATUSES.has(a.status as string)).length,
    offers: apps.filter((a) => a.status === "Offer Received").length,
    goalsUpdated: goals.length,
    goalsDone: goals.filter((g) => g.status === "done").length,
    goalsInProgress: goals.filter((g) => g.status !== "done").length,
    streakCheckIns: streakLogs.length,
    activeStreaks: new Set(streakLogs.map((l) => l.streak_id)).size,
    habitCheckIns: habitLogs.length,
    activeHabits: habitsR.count ?? 0,
    codingHours: round1(codingSeconds / 3600),
    topLanguages,
    studyHours: round1(studyMinutes / 60),
    faithEntries: faith.length,
    workouts: fitness.length,
    workoutDistanceKm: round1(fitnessMetres / 1000),
    deadlinesDueSoon: deadlines.length,
    nextDeadline,
    diaryEntries: diary.length,
    latestMood: (diary[0]?.mood as string | null) ?? null,
    followUpsDue: followUps.length,
    expiringItems: expiring.length,
    expiringSoon,
    upcomingEvents: events.length,
    nextEvent,
    reads: readsR.count ?? 0,
    published,
    openSource: osR.count ?? 0,
    currentWeight,
    weightChange,
    weightGoal,
  }

  const appliedList = apps
    .slice(0, 5)
    .map((a) => ({ company: a.company as string, role: a.role as string, url: (a.url as string | null) ?? null }))
  const expiringList = expiring.slice(0, 5).map((e) => ({ name: e.name, type: e.type, daysLeft: e.daysLeft }))

  return { facts, appliedList, followUps, expiring: expiringList }
}
