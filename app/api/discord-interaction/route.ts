// Discord interactions endpoint for the personal OS bot - slash commands, owner-only.
// Discord signs every request with Ed25519 and requires a reply within 3 seconds, so anything that touches
// the database defers (type 5) and finishes via a followup edit; /ping and /help reply instantly. The
// endpoint is public (Discord calls it), so commands are gated to my own Discord user id (DISCORD_OWNER_ID).
// Guarded on DISCORD_PUBLIC_KEY - 401 when unset.
import { after } from "next/server"
import { webcrypto } from "node:crypto"
import { gatherDigestData, type DigestData } from "@/lib/digest-facts"
import { getExpiringItems } from "@/lib/vault-expiry-check"
import { supabase } from "@/lib/supabase"

export const dynamic = "force-dynamic"

const DISCORD_API = "https://discord.com/api/v10"

function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2)
  for (let i = 0; i < bytes.length; i++) bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16)
  return bytes
}

// Verify the Ed25519 signature Discord sends, using built-in WebCrypto (no extra dependency).
async function verifySignature(publicKeyHex: string, signatureHex: string, timestamp: string, body: string): Promise<boolean> {
  try {
    const key = await webcrypto.subtle.importKey("raw", hexToBytes(publicKeyHex), { name: "Ed25519" }, false, ["verify"])
    return await webcrypto.subtle.verify("Ed25519", key, hexToBytes(signatureHex), new TextEncoder().encode(timestamp + body))
  } catch {
    return false
  }
}

// Edit the deferred reply once the data is ready. The interaction token authorises this for 15 minutes.
async function followup(token: string, content: string) {
  const appId = process.env.DISCORD_APPLICATION_ID
  if (!appId) return
  await fetch(`${DISCORD_API}/webhooks/${appId}/${token}/messages/@original`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content: content.slice(0, 2000) }),
  }).catch(() => {})
}

// Today's date in my timezone, so a late-night check-in still lands on the right day.
const localToday = (): string => new Date().toLocaleDateString("en-CA", { timeZone: "Europe/London" })

const HELP = [
  "**Personal OS - commands**",
  "",
  "**Status**",
  "`/today` · `/week` - full summary",
  "`/goals` - active goals",
  "`/applications` - pipeline + recent",
  "`/deadlines` - coursework due (3 weeks)",
  "`/calendar` - events (next 7 days)",
  "`/contacts` - follow-ups due",
  "`/vault` - keys/cards/docs expiring",
  "`/coding` - hours today + this week",
  "`/fitness` - recent workouts",
  "`/weight` - current weight + goal",
  "",
  "**Habits & streaks**",
  "`/habit list` · `/habit done name:Gym`",
  "`/streak status` · `/streak log name:Gym`",
  "",
  "**Quick log**",
  "`/log weight kg:75.5`",
  "`/log study minutes:60 subject:Maths`",
  "`/log diary text:… mood:…`",
  "",
  "`/ping` · `/help`",
].join("\n")

type CommandOption = { name: string; type: number; value?: string | number; options?: CommandOption[] }

function summaryLine(data: DigestData, label: string): string {
  const f = data.facts
  return [
    `**${label}**`,
    `Applied ${f.applied} · Interviews ${f.interviews} · Offers ${f.offers}`,
    `Coding ${f.codingHours}h · Study ${f.studyHours}h`,
    `Streaks ${f.streakCheckIns}/${f.activeStreaks} · Habits ${f.habitCheckIns}/${f.activeHabits}`,
    `Goals done ${f.goalsDone}, in progress ${f.goalsInProgress}`,
    f.workouts > 0 ? `Workouts ${f.workouts} (${f.workoutDistanceKm}km)` : "",
    f.deadlinesDueSoon > 0 ? `Deadlines due soon: ${f.deadlinesDueSoon}${f.nextDeadline ? `, nearest ${f.nextDeadline}` : ""}` : "",
    f.followUpsDue > 0 ? `Follow-ups due: ${f.followUpsDue}` : "",
    data.expiring.length > 0 ? `Expiring soon: ${data.expiring.length}` : "",
  ]
    .filter(Boolean)
    .join("\n")
}

const INTERVIEW_STATUSES = new Set([
  "Interview",
  "Assessment Centre",
  "Video Interview",
  "Face-to-face Interview",
  "Telephone Interview",
])

// ─── Read commands ───────────────────────────────────────────

async function goalsCommand(): Promise<string> {
  const { data } = await supabase.from("goals").select("title,status,category").order("updated_at", { ascending: false })
  if (!data?.length) return "No goals yet."
  const done = data.filter((g) => g.status === "done").length
  const active = data.filter((g) => g.status !== "done")
  const lines = active.slice(0, 15).map((g) => `• ${g.title}${g.category ? ` _(${g.category})_` : ""}`)
  return `**Goals - ${active.length} active, ${done} done**\n${lines.join("\n") || "All done. 🎉"}`
}

async function applicationsCommand(): Promise<string> {
  const { data } = await supabase
    .from("applications")
    .select("company,role,status,applied_date")
    .not("status", "in", '("Not Applied","Not Interested","scraped")')
    .order("applied_date", { ascending: false, nullsFirst: false })
    .limit(100)
  if (!data?.length) return "No live applications."
  const interviews = data.filter((a) => INTERVIEW_STATUSES.has(a.status as string)).length
  const offers = data.filter((a) => a.status === "Offer Received").length
  const recent = data.slice(0, 6).map((a) => `• **${a.company}** - ${a.role} _(${a.status})_`)
  return `**Applications - ${data.length} live · ${interviews} interviewing · ${offers} offers**\n${recent.join("\n")}`
}

async function deadlinesCommand(): Promise<string> {
  const today = localToday()
  const horizon = new Date(Date.now() + 21 * 86_400_000).toISOString().slice(0, 10)
  const { data } = await supabase
    .from("uni_deadlines")
    .select("title,due_date,status")
    .gte("due_date", today)
    .lte("due_date", horizon)
    .neq("status", "graded")
    .order("due_date", { ascending: true })
    .limit(10)
  if (!data?.length) return "**Deadlines** - nothing due in the next three weeks. 🎉"
  const lines = data.map((d) => {
    const days = Math.max(0, Math.ceil((new Date(d.due_date as string).getTime() - Date.now()) / 86_400_000))
    return `• **${d.title}** - ${days === 0 ? "due today" : `${days}d`} (${d.due_date})`
  })
  return `**Upcoming deadlines**\n${lines.join("\n")}`
}

async function calendarCommand(): Promise<string> {
  const now = new Date()
  const in7 = new Date(now.getTime() + 7 * 86_400_000).toISOString()
  const { data } = await supabase
    .from("calendar_events")
    .select("title,start_at")
    .eq("is_deleted", false)
    .gte("start_at", now.toISOString())
    .lte("start_at", in7)
    .order("start_at", { ascending: true })
    .limit(10)
  if (!data?.length) return "**Calendar** - nothing in the next 7 days."
  const lines = data.map((e) => {
    const d = new Date(e.start_at as string)
    const day = d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", timeZone: "Europe/London" })
    const time = d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/London" })
    return `• **${e.title}** - ${day} ${time}`
  })
  return `**Next 7 days**\n${lines.join("\n")}`
}

async function contactsCommand(): Promise<string> {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 86_400_000).toISOString().slice(0, 10)
  const { data } = await supabase
    .from("contacts")
    .select("name,last_contact,follow_up")
    .or(`follow_up.eq.true,last_contact.lt.${thirtyDaysAgo}`)
    .order("last_contact", { ascending: true, nullsFirst: true })
    .limit(10)
  if (!data?.length) return "**Contacts** - nobody is due a follow-up. 👍"
  const lines = data.map((c) => `• ${c.name}${c.last_contact ? ` _(last ${c.last_contact})_` : " _(no contact logged)_"}`)
  return `**Follow-ups due**\n${lines.join("\n")}`
}

async function vaultCommand(): Promise<string> {
  const items = await getExpiringItems()
  if (!items.length) return "**Vault** - nothing expiring soon. 🔐"
  const lines = items.slice(0, 12).map((i) => `• ${i.name} _(${i.type})_ - ${i.daysLeft < 0 ? "expired" : `${i.daysLeft}d`}`)
  return `**Expiring soon**\n${lines.join("\n")}`
}

async function codingCommand(): Promise<string> {
  const today = localToday()
  const weekAgo = new Date(Date.now() - 7 * 86_400_000).toISOString().slice(0, 10)
  const { data } = await supabase.from("wakatime_daily").select("date,total_seconds").gte("date", weekAgo)
  const rows = data ?? []
  const todaySec = rows.filter((r) => r.date === today).reduce((a, r) => a + (r.total_seconds ?? 0), 0)
  const weekSec = rows.reduce((a, r) => a + (r.total_seconds ?? 0), 0)
  const h = (s: number) => (s / 3600).toFixed(1)
  return `**Coding**\nToday: ${h(todaySec)}h\nLast 7 days: ${h(weekSec)}h`
}

async function fitnessCommand(): Promise<string> {
  const sinceIso = new Date(Date.now() - 14 * 86_400_000).toISOString()
  const { data } = await supabase
    .from("strava_activities")
    .select("sport_type,distance_m,start_date")
    .gte("start_date", sinceIso)
    .order("start_date", { ascending: false })
    .limit(8)
  if (!data?.length) return "**Fitness** - no workouts in the last two weeks."
  const lines = data.map((a) => {
    const km = (((a.distance_m as number) ?? 0) / 1000).toFixed(1)
    const day = new Date(a.start_date as string).toLocaleDateString("en-GB", { day: "numeric", month: "short", timeZone: "Europe/London" })
    return `• ${a.sport_type ?? "Activity"} - ${km}km _(${day})_`
  })
  return `**Recent workouts**\n${lines.join("\n")}`
}

async function weightCommand(): Promise<string> {
  const { data: logs } = await supabase
    .from("body_metrics")
    .select("value,date")
    .eq("metric", "weight_kg")
    .order("date", { ascending: false })
    .limit(2)
  if (!logs?.length) return "**Weight** - nothing logged yet. Try `/log weight kg:75`."
  const current = logs[0].value as number
  const { data: goalRow } = await supabase.from("config").select("value").eq("key", "weight_goal").maybeSingle()
  const goal = goalRow?.value as { targetWeight: number } | undefined
  let line = `Current: **${current}kg**`
  if (logs[1]) line += ` (${(current - (logs[1].value as number)).toFixed(1)}kg since last)`
  if (goal?.targetWeight != null) {
    const rem = Number((current - goal.targetWeight).toFixed(1))
    line += `\nGoal: ${goal.targetWeight}kg (${rem <= 0 ? "reached 🎉" : `${rem}kg to go`})`
  }
  return `**Weight**\n${line}`
}

// ─── Habit / streak / log groups ─────────────────────────────

async function habitCommand(sub: CommandOption | undefined): Promise<string> {
  const today = localToday()
  if (sub?.name === "list") {
    const { data: habits } = await supabase.from("habits").select("id,name").eq("active", true).order("name")
    if (!habits?.length) return "No active habits."
    const { data: logs } = await supabase.from("habit_logs").select("habit_id").eq("date", today)
    const done = new Set((logs ?? []).map((l) => l.habit_id))
    const lines = habits.map((h) => `${done.has(h.id) ? "✅" : "⬜"} ${h.name}`)
    return `**Habits today (${habits.filter((h) => done.has(h.id)).length}/${habits.length})**\n${lines.join("\n")}`
  }
  if (sub?.name === "done") {
    const q = String(sub.options?.[0]?.value ?? "").trim()
    if (!q) return "Give me a name: `/habit done name:Gym`"
    const { data: matches } = await supabase.from("habits").select("id,name").eq("active", true).ilike("name", `%${q}%`).limit(5)
    if (!matches?.length) return `No active habit matching "${q}".`
    if (matches.length > 1) return `More than one matches "${q}": ${matches.map((m) => m.name).join(", ")}. Be more specific.`
    await supabase.from("habit_logs").upsert({ habit_id: matches[0].id, date: today, completed: true }, { onConflict: "habit_id,date" })
    return `✅ Marked **${matches[0].name}** done for today.`
  }
  return "Use `/habit list` or `/habit done name:…`."
}

async function streakCommand(sub: CommandOption | undefined): Promise<string> {
  const today = localToday()
  if (sub?.name === "status") {
    const { data: streaks } = await supabase.from("streaks").select("id,name").eq("active", true).order("order_index")
    if (!streaks?.length) return "No active streaks."
    const { data: logs } = await supabase.from("streak_logs").select("streak_id").eq("date", today)
    const done = new Set((logs ?? []).map((l) => l.streak_id))
    const lines = streaks.map((s) => `${done.has(s.id) ? "✅" : "⬜"} ${s.name}`)
    return `**Streaks today (${streaks.filter((s) => done.has(s.id)).length}/${streaks.length})**\n${lines.join("\n")}`
  }
  if (sub?.name === "log") {
    const q = String(sub.options?.[0]?.value ?? "").trim()
    if (!q) return "Give me a name: `/streak log name:Gym`"
    const { data: matches } = await supabase.from("streaks").select("id,name").eq("active", true).ilike("name", `%${q}%`).limit(5)
    if (!matches?.length) return `No active streak matching "${q}".`
    if (matches.length > 1) return `More than one matches "${q}": ${matches.map((m) => m.name).join(", ")}. Be more specific.`
    await supabase.from("streak_logs").upsert({ streak_id: matches[0].id, date: today, completed: true }, { onConflict: "streak_id,date" })
    return `✅ Logged **${matches[0].name}** for today.`
  }
  return "Use `/streak status` or `/streak log name:…`."
}

async function logCommand(sub: CommandOption | undefined): Promise<string> {
  const today = localToday()
  const opt = (n: string) => sub?.options?.find((o) => o.name === n)?.value
  if (sub?.name === "weight") {
    const kg = Number(opt("kg"))
    if (!Number.isFinite(kg) || kg <= 0 || kg > 999) return "Give a weight in kg: `/log weight kg:75.5`"
    await supabase.from("body_metrics").insert({ date: today, metric: "weight_kg", value: kg, unit: "kg" })
    return `✅ Logged **${kg}kg** for today.`
  }
  if (sub?.name === "study") {
    const minutes = Math.round(Number(opt("minutes")))
    const subject = String(opt("subject") ?? "").trim()
    if (!Number.isFinite(minutes) || minutes <= 0) return "Give minutes: `/log study minutes:60 subject:Maths`"
    if (!subject) return "Give a subject: `/log study minutes:60 subject:Maths`"
    await supabase.from("study_sessions").insert({ date: today, subject, duration_m: minutes, productive: true })
    return `✅ Logged **${minutes}m** of ${subject}.`
  }
  if (sub?.name === "diary") {
    const text = String(opt("text") ?? "").trim()
    if (!text) return "Give some text: `/log diary text:Today I…`"
    const mood = String(opt("mood") ?? "neutral").trim() || "neutral"
    const title = text.length > 50 ? `${text.slice(0, 50)}…` : text
    await supabase.from("diary").insert({ title, content: text, mood })
    return "✅ Diary entry saved."
  }
  return "Use `/log weight`, `/log study` or `/log diary`."
}

const DEFERRED = new Set([
  "today",
  "week",
  "goals",
  "applications",
  "deadlines",
  "calendar",
  "contacts",
  "vault",
  "coding",
  "fitness",
  "weight",
  "habit",
  "streak",
  "log",
])

export async function POST(req: Request) {
  const publicKey = process.env.DISCORD_PUBLIC_KEY
  if (!publicKey) {
    return Response.json({ error: "discord not configured" }, { status: 401 })
  }

  const signature = req.headers.get("x-signature-ed25519")
  const timestamp = req.headers.get("x-signature-timestamp")
  const body = await req.text()

  if (!signature || !timestamp || !(await verifySignature(publicKey, signature, timestamp, body))) {
    return new Response("invalid request signature", { status: 401 })
  }

  const interaction = JSON.parse(body) as {
    type: number
    data?: { name?: string; options?: CommandOption[] }
    token: string
    member?: { user?: { id?: string } }
    user?: { id?: string }
  }

  // PING -> PONG. Discord uses this to verify the endpoint when I save the URL.
  if (interaction.type === 1) {
    return Response.json({ type: 1 })
  }

  // Slash command (type 2). Owner-only: this endpoint is public, so I check the invoking user id.
  if (interaction.type === 2) {
    const ownerId = process.env.DISCORD_OWNER_ID
    const userId = interaction.member?.user?.id ?? interaction.user?.id
    if (ownerId && userId !== ownerId) {
      return Response.json({ type: 4, data: { content: "Not authorised.", flags: 64 } })
    }

    const name = interaction.data?.name

    if (name === "ping") {
      return Response.json({ type: 4, data: { content: "Pong 🏓 the bot is alive." } })
    }
    if (name === "help") {
      return Response.json({ type: 4, data: { content: HELP } })
    }

    // Everything else reads (or writes) the database, so I defer and edit the reply once it is ready.
    if (name && DEFERRED.has(name)) {
      const token = interaction.token
      const sub = interaction.data?.options?.[0]
      after(async () => {
        let content = "Unknown command."
        try {
          switch (name) {
            case "today":
            case "week": {
              const hours = name === "week" ? 168 : 24
              const label = name === "week" ? "Past week" : "Today"
              const period = name === "week" ? "the past week" : "today"
              content = summaryLine(await gatherDigestData(hours, period), label)
              break
            }
            case "goals":
              content = await goalsCommand()
              break
            case "applications":
              content = await applicationsCommand()
              break
            case "deadlines":
              content = await deadlinesCommand()
              break
            case "calendar":
              content = await calendarCommand()
              break
            case "contacts":
              content = await contactsCommand()
              break
            case "vault":
              content = await vaultCommand()
              break
            case "coding":
              content = await codingCommand()
              break
            case "fitness":
              content = await fitnessCommand()
              break
            case "weight":
              content = await weightCommand()
              break
            case "habit":
              content = await habitCommand(sub)
              break
            case "streak":
              content = await streakCommand(sub)
              break
            case "log":
              content = await logCommand(sub)
              break
          }
        } catch {
          content = "Something went wrong running that one."
        }
        await followup(token, content)
      })
      return Response.json({ type: 5 })
    }

    return Response.json({ type: 4, data: { content: "Unknown command. Try `/help`.", flags: 64 } })
  }

  return new Response("unhandled interaction type", { status: 400 })
}
