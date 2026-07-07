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

// Mirror every bot write into the dashboard activity log, so /dashboard/activity shows what I did from
// Discord too. Best-effort: a logging failure must never break the command that triggered it.
async function logBotActivity(action: string, detail?: string): Promise<void> {
  try {
    await supabase.from("activity_log").insert({ action, detail: detail ? `${detail} (via Discord)` : "via Discord" })
  } catch {
    // best-effort only
  }
}

// Current and longest run of consecutive completed days from a set of YYYY-MM-DD log dates. Dates are
// stored as local day strings, so I compare them as plain UTC-midnight days (no timezone maths needed).
function streakLengths(dates: Iterable<string>, today: string): { current: number; longest: number } {
  const days = new Set(dates)
  const oneDay = 86_400_000
  const toMs = (d: string) => new Date(`${d}T00:00:00Z`).getTime()
  const toDay = (ms: number) => new Date(ms).toISOString().slice(0, 10)

  // Current run counts back from today, or from yesterday if today is not done yet (streak still alive).
  let current = 0
  let cursor = toMs(today)
  if (!days.has(today)) cursor -= oneDay
  while (days.has(toDay(cursor))) {
    current++
    cursor -= oneDay
  }

  // Longest run anywhere in the history.
  let longest = 0
  let run = 0
  let prev: number | null = null
  for (const d of [...days].sort()) {
    const t = toMs(d)
    run = prev !== null && t - prev === oneDay ? run + 1 : 1
    if (run > longest) longest = run
    prev = t
  }
  return { current, longest }
}

const HELP = [
  "**Personal OS - commands**",
  "",
  "**Status**",
  "`/today` · `/week` - full summary",
  "`/goal list` · `/goal add` · `/goal done` - goals",
  "`/app stats` · `/app add` · `/app status` - applications",
  "`/oss stats` · `/oss add` - open source",
  "`/uni deadline list` · `/uni book due` · `/uni submission list`",
  "`/calendar agenda` · `/calendar add title:… when:…`",
  "`/contact list` · `/contact add` · `/contact logged name:…`",
  "`/reminder list` · `/reminder add title:… when:…`",
  "`/vault` - keys/cards/docs expiring",
  "`/coding` - hours today + this week",
  "`/health meal log` · `/health med taken` · `/health fitness stats`",
  "",
  "**Habits & streaks**",
  "`/streak status` · `/streak all` · `/streak log name:Gym`",
  "`/streak undo name:Gym` · `/streak clear` · `/streak stats`",
  "`/habit list` · `/habit all` · `/habit done name:Gym`",
  "`/habit undo name:Gym` · `/habit stats`",
  "",
  "**Quick log**",
  "`/weight log kg:75.5` · `/weight undo` · `/weight stats`",
  "`/study log minutes:60 subject:Maths` · `/study stats`",
  "`/faith log type:bible` · `/faith stats`",
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

// PostgREST .or() filters are comma-separated, so strip characters that would break the filter string when
// I interpolate the owner's search term. It is my own input, so this is about robustness not security.
const safe = (s: string): string => s.replace(/[,()]/g, " ").trim()

async function goalCommand(sub: CommandOption | undefined): Promise<string> {
  const opt = (n: string) => sub?.options?.find((o) => o.name === n)?.value
  if (sub?.name === "add") {
    const title = String(opt("title") ?? "").trim()
    if (!title) return "Give a title: `/goal add title:Learn Rust`"
    const category = String(opt("category") ?? "Personal").trim() || "Personal"
    await supabase.from("goals").insert({ title, category, status: "not_started", progress: 0 })
    await logBotActivity("goal.create", title)
    return `✅ Added goal **${title}** _(${category})_.`
  }
  if (sub?.name === "done" || sub?.name === "delete" || sub?.name === "progress") {
    const q = String(opt("name") ?? "").trim()
    if (!q) return `Give me a name: \`/goal ${sub.name} name:…\``
    const { data: matches } = await supabase.from("goals").select("id,title").ilike("title", `%${q}%`).limit(5)
    if (!matches?.length) return `No goal matching "${q}".`
    if (matches.length > 1) return `More than one matches "${q}": ${matches.map((m) => m.title).join(", ")}. Be more specific.`
    const g = matches[0]
    if (sub.name === "done") {
      await supabase.from("goals").update({ status: "done", progress: 100 }).eq("id", g.id)
      await logBotActivity("goal.update", `${g.title} done`)
      return `✅ Marked goal **${g.title}** done.`
    }
    if (sub.name === "delete") {
      await supabase.from("goals").delete().eq("id", g.id)
      await logBotActivity("goal.delete", g.title)
      return `🗑️ Deleted goal **${g.title}**.`
    }
    const pct = Math.round(Number(opt("pct")))
    if (!Number.isFinite(pct)) return "Give a percentage: `/goal progress name:… pct:50`"
    const clamped = Math.max(0, Math.min(100, pct))
    const status = clamped >= 100 ? "done" : clamped > 0 ? "in_progress" : "not_started"
    await supabase.from("goals").update({ progress: clamped, status }).eq("id", g.id)
    await logBotActivity("goal.update", `${g.title} ${clamped}%`)
    return `📈 **${g.title}** now at **${clamped}%**.`
  }
  // list (default)
  const { data } = await supabase.from("goals").select("title,status,category").order("updated_at", { ascending: false })
  if (!data?.length) return "No goals yet. Add one with `/goal add title:…`"
  const done = data.filter((g) => g.status === "done").length
  const activeGoals = data.filter((g) => g.status !== "done")
  const lines = activeGoals.slice(0, 15).map((g) => `• ${g.title}${g.category ? ` _(${g.category})_` : ""}`)
  return `**Goals - ${activeGoals.length} active, ${done} done**\n${lines.join("\n") || "All done. 🎉"}`
}

async function appCommand(sub: CommandOption | undefined): Promise<string> {
  const opt = (n: string) => sub?.options?.find((o) => o.name === n)?.value
  if (sub?.name === "add") {
    const company = String(opt("company") ?? "").trim()
    const role = String(opt("role") ?? "").trim()
    if (!company || !role) return "Give company + role: `/app add company:Google role:SWE Intern`"
    const status = String(opt("status") ?? "Applied").trim() || "Applied"
    await supabase.from("applications").insert({ company, role, type: "Internship", status, applied_date: localToday() })
    await logBotActivity("application.create", `${company} - ${role}`)
    return `✅ Added **${company}** - ${role} _(${status})_.`
  }
  if (sub?.name === "status" || sub?.name === "delete") {
    const q = safe(String(opt("name") ?? ""))
    if (!q) return `Give a name: \`/app ${sub.name} name:Google\``
    const { data: matches } = await supabase.from("applications").select("id,company,role").or(`company.ilike.%${q}%,role.ilike.%${q}%`).limit(5)
    if (!matches?.length) return `No application matching "${q}".`
    if (matches.length > 1) return `More than one matches "${q}": ${matches.map((m) => `${m.company} (${m.role})`).join(", ")}. Be more specific.`
    const a = matches[0]
    if (sub.name === "delete") {
      await supabase.from("applications").delete().eq("id", a.id)
      await logBotActivity("application.delete", `${a.company} - ${a.role}`)
      return `🗑️ Deleted **${a.company}** - ${a.role}.`
    }
    const to = String(opt("to") ?? "").trim()
    if (!to) return "Usage: `/app status name:Google to:Interview`"
    await supabase.from("applications").update({ status: to }).eq("id", a.id)
    await logBotActivity("application.update", `${a.company} -> ${to}`)
    return `✅ **${a.company}** - ${a.role} is now _${to}_.`
  }
  if (sub?.name === "list") {
    const { data } = await supabase.from("applications").select("company,role,status").not("status", "in", '("Not Applied","Not Interested","scraped")').order("applied_date", { ascending: false, nullsFirst: false }).limit(10)
    if (!data?.length) return "No live applications."
    return `**Recent applications**\n${data.map((a) => `• **${a.company}** - ${a.role} _(${a.status})_`).join("\n")}`
  }
  // stats (default)
  const { data } = await supabase.from("applications").select("company,role,status").not("status", "in", '("Not Applied","Not Interested","scraped")').order("applied_date", { ascending: false, nullsFirst: false }).limit(1000)
  if (!data?.length) return "No live applications."
  const interviews = data.filter((a) => INTERVIEW_STATUSES.has(a.status as string)).length
  const offers = data.filter((a) => a.status === "Offer Received").length
  const recent = data.slice(0, 6).map((a) => `• **${a.company}** - ${a.role} _(${a.status})_`)
  return `**Applications - ${data.length} live · ${interviews} interviewing · ${offers} offers**\n${recent.join("\n")}`
}

async function ossCommand(sub: CommandOption | undefined): Promise<string> {
  const opt = (n: string) => sub?.options?.find((o) => o.name === n)?.value
  if (sub?.name === "add") {
    const repo = String(opt("repo") ?? "").trim()
    if (!repo) return "Give a repo: `/oss add repo:vercel/next.js title:Fix typo url:…`"
    const pr_title = String(opt("title") ?? "Contribution").trim() || "Contribution"
    const pr_url = String(opt("url") ?? "").trim() || null
    await supabase.from("opensource_contributions").insert({ repo, pr_title, pr_url, status: "open" })
    await logBotActivity("opensource.create", `${repo} - ${pr_title}`)
    return `✅ Logged contribution to **${repo}**: ${pr_title}.`
  }
  if (sub?.name === "delete") {
    const q = safe(String(opt("name") ?? ""))
    if (!q) return "Give a name: `/oss delete name:next.js`"
    const { data: matches } = await supabase.from("opensource_contributions").select("id,repo,pr_title").or(`repo.ilike.%${q}%,pr_title.ilike.%${q}%`).limit(5)
    if (!matches?.length) return `No contribution matching "${q}".`
    if (matches.length > 1) return `More than one matches "${q}": ${matches.map((m) => `${m.repo} (${m.pr_title})`).join(", ")}. Be more specific.`
    await supabase.from("opensource_contributions").delete().eq("id", matches[0].id)
    await logBotActivity("opensource.delete", `${matches[0].repo} - ${matches[0].pr_title}`)
    return `🗑️ Deleted contribution to **${matches[0].repo}**.`
  }
  if (sub?.name === "list") {
    const { data } = await supabase.from("opensource_contributions").select("repo,pr_title,status").order("submitted_at", { ascending: false }).limit(10)
    if (!data?.length) return "No contributions logged."
    return `**Recent contributions**\n${data.map((c) => `• **${c.repo}** - ${c.pr_title} _(${c.status})_`).join("\n")}`
  }
  // stats (default)
  const { data } = await supabase.from("opensource_contributions").select("status")
  const rows = data ?? []
  if (!rows.length) return "No contributions logged. Add one with `/oss add repo:…`"
  const by = new Map<string, number>()
  for (const r of rows) by.set(r.status, (by.get(r.status) ?? 0) + 1)
  const parts = [...by.entries()].map(([s, n]) => `${s}: **${n}**`)
  return `**Open source - ${rows.length} total**\n${parts.join(" · ")}`
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

// Parse "YYYY-MM-DD HH:MM" as London wall-clock time into a UTC ISO string, so an event or reminder I type
// in Discord fires at the time I meant even though the server runs on UTC.
function londonOffsetMinutes(d: Date): number {
  const utc = new Date(d.toLocaleString("en-US", { timeZone: "UTC" }))
  const lon = new Date(d.toLocaleString("en-US", { timeZone: "Europe/London" }))
  return Math.round((lon.getTime() - utc.getTime()) / 60000)
}
function parseWhenToUtc(s: string): string | null {
  const m = s.trim().match(/^(\d{4})-(\d{2})-(\d{2})[ T](\d{1,2}):(\d{2})$/)
  if (!m) return null
  const guess = Date.UTC(+m[1], +m[2] - 1, +m[3], +m[4], +m[5])
  if (Number.isNaN(guess)) return null
  return new Date(guess - londonOffsetMinutes(new Date(guess)) * 60_000).toISOString()
}

async function calendarCommand(sub: CommandOption | undefined): Promise<string> {
  const opt = (n: string) => sub?.options?.find((o) => o.name === n)?.value
  if (sub?.name === "add") {
    const title = String(opt("title") ?? "").trim()
    const when = parseWhenToUtc(String(opt("when") ?? ""))
    if (!title || !when) return "Usage: `/calendar add title:Dentist when:2026-07-20 14:00`"
    const end = new Date(new Date(when).getTime() + 60 * 60_000).toISOString()
    await supabase.from("calendar_events").insert({ title, start_at: when, end_at: end })
    await logBotActivity("calendar.create", title)
    return `✅ Added **${title}** to the calendar.`
  }
  if (sub?.name === "delete") {
    const q = String(opt("name") ?? "").trim()
    if (!q) return "Give a name: `/calendar delete name:Dentist`"
    const { data: matches } = await supabase.from("calendar_events").select("id,title").eq("is_deleted", false).ilike("title", `%${q}%`).limit(5)
    if (!matches?.length) return `No event matching "${q}".`
    if (matches.length > 1) return `More than one: ${matches.map((m) => m.title).join(", ")}. Be more specific.`
    await supabase.from("calendar_events").update({ is_deleted: true, deleted_at: new Date().toISOString() }).eq("id", matches[0].id)
    await logBotActivity("calendar.delete", matches[0].title)
    return `🗑️ Removed **${matches[0].title}** from the calendar.`
  }
  // agenda (default) - next 7 days
  const now = new Date()
  const in7 = new Date(now.getTime() + 7 * 86_400_000).toISOString()
  const { data } = await supabase.from("calendar_events").select("title,start_at").eq("is_deleted", false).gte("start_at", now.toISOString()).lte("start_at", in7).order("start_at", { ascending: true }).limit(10)
  if (!data?.length) return "**Calendar** - nothing in the next 7 days."
  const lines = data.map((e) => {
    const d = new Date(e.start_at as string)
    const day = d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", timeZone: "Europe/London" })
    const time = d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/London" })
    return `• **${e.title}** - ${day} ${time}`
  })
  return `**Next 7 days**\n${lines.join("\n")}`
}

async function contactCommand(sub: CommandOption | undefined): Promise<string> {
  const opt = (n: string) => sub?.options?.find((o) => o.name === n)?.value
  const today = localToday()
  if (sub?.name === "add") {
    const name = String(opt("name") ?? "").trim()
    if (!name) return "Give a name: `/contact add name:Jane Doe company:Google`"
    const company = String(opt("company") ?? "").trim() || null
    await supabase.from("contacts").insert({ name, company })
    await logBotActivity("contact.create", name)
    return `✅ Added contact **${name}**${company ? ` _(${company})_` : ""}.`
  }
  if (sub?.name === "logged" || sub?.name === "delete" || sub?.name === "find") {
    const q = String(opt("name") ?? "").trim()
    if (!q) return `Give a name: \`/contact ${sub.name} name:Jane\``
    const { data: matches } = await supabase.from("contacts").select("id,name,company,role,last_contact").ilike("name", `%${q}%`).limit(5)
    if (!matches?.length) return `No contact matching "${q}".`
    if (sub.name === "find") {
      return matches.map((m) => `**${m.name}**${m.company ? ` - ${m.company}` : ""}${m.role ? ` (${m.role})` : ""}${m.last_contact ? ` _(last ${m.last_contact})_` : ""}`).join("\n")
    }
    if (matches.length > 1) return `More than one: ${matches.map((m) => m.name).join(", ")}. Be more specific.`
    const c = matches[0]
    if (sub.name === "logged") {
      await supabase.from("contacts").update({ last_contact: today, follow_up: false }).eq("id", c.id)
      await logBotActivity("contact.update", `${c.name} contacted`)
      return `✅ Logged contact with **${c.name}** today.`
    }
    await supabase.from("contacts").delete().eq("id", c.id)
    await logBotActivity("contact.delete", c.name)
    return `🗑️ Deleted contact **${c.name}**.`
  }
  // list (default) - follow-ups due
  const thirtyDaysAgo = new Date(Date.now() - 30 * 86_400_000).toISOString().slice(0, 10)
  const { data } = await supabase.from("contacts").select("name,last_contact,follow_up").or(`follow_up.eq.true,last_contact.lt.${thirtyDaysAgo}`).order("last_contact", { ascending: true, nullsFirst: true }).limit(10)
  if (!data?.length) return "**Contacts** - nobody is due a follow-up. 👍"
  const lines = data.map((c) => `• ${c.name}${c.last_contact ? ` _(last ${c.last_contact})_` : " _(no contact logged)_"}`)
  return `**Follow-ups due**\n${lines.join("\n")}`
}

async function reminderCommand(sub: CommandOption | undefined): Promise<string> {
  const opt = (n: string) => sub?.options?.find((o) => o.name === n)?.value
  if (sub?.name === "add") {
    const title = String(opt("title") ?? "").trim()
    const when = parseWhenToUtc(String(opt("when") ?? ""))
    if (!title || !when) return "Usage: `/reminder add title:Call the bank when:2026-07-20 14:00`"
    await supabase.from("reminders").insert({ kind: "appointment", title, event_at: when, lead_minutes: [1440], channels: ["discord"] })
    await logBotActivity("reminder.create", title)
    return `✅ Reminder set for **${title}**.`
  }
  if (sub?.name === "done" || sub?.name === "delete") {
    const q = String(opt("name") ?? "").trim()
    if (!q) return `Give a name: \`/reminder ${sub.name} name:bank\``
    const { data: matches } = await supabase.from("reminders").select("id,title").ilike("title", `%${q}%`).limit(5)
    if (!matches?.length) return `No reminder matching "${q}".`
    if (matches.length > 1) return `More than one: ${matches.map((m) => m.title).join(", ")}. Be more specific.`
    if (sub.name === "delete") {
      await supabase.from("reminders").delete().eq("id", matches[0].id)
      await logBotActivity("reminder.delete", matches[0].title)
      return `🗑️ Deleted reminder **${matches[0].title}**.`
    }
    await supabase.from("reminders").update({ active: false }).eq("id", matches[0].id)
    await logBotActivity("reminder.update", `${matches[0].title} done`)
    return `✅ Marked reminder **${matches[0].title}** done.`
  }
  // list (default) - upcoming active reminders
  const { data } = await supabase.from("reminders").select("title,event_at").eq("active", true).gte("event_at", new Date().toISOString()).order("event_at", { ascending: true }).limit(10)
  if (!data?.length) return "**Reminders** - nothing upcoming."
  const lines = data.map((r) => {
    const d = new Date(r.event_at as string)
    const when = d.toLocaleString("en-GB", { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "Europe/London" })
    return `• **${r.title}** - ${when}`
  })
  return `**Upcoming reminders**\n${lines.join("\n")}`
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

// /health is a two-level command: sub is the group (meal / med / workout / fitness) and sub.options[0] is
// the actual subcommand, whose options hold the parameters.
async function healthCommand(sub: CommandOption | undefined): Promise<string> {
  const group = sub?.name
  const cmd = sub?.options?.[0]
  const opt = (n: string) => cmd?.options?.find((o) => o.name === n)?.value
  const today = localToday()

  if (group === "meal") {
    if (cmd?.name === "log") {
      const calories = Math.round(Number(opt("calories")))
      if (!Number.isFinite(calories) || calories <= 0) return "Usage: `/health meal log calories:600 name:Chicken rice protein:40`"
      const protein = Number(opt("protein"))
      const name = String(opt("name") ?? "").trim() || "meal"
      const meal = String(opt("meal") ?? "snack").trim() || "snack"
      await supabase.from("nutrition_logs").insert({ date: today, meal, name, calories, protein_g: Number.isFinite(protein) ? protein : null })
      await logBotActivity("nutrition.create", `${name} ${calories}kcal`)
      return `✅ Logged **${name}** - ${calories} kcal${Number.isFinite(protein) ? `, ${protein}g protein` : ""}.`
    }
    if (cmd?.name === "undo") {
      const { data: rows } = await supabase.from("nutrition_logs").select("id,name").eq("date", today).order("created_at", { ascending: false }).limit(1)
      if (!rows?.length) return "No meal logged today to undo."
      await supabase.from("nutrition_logs").delete().eq("id", rows[0].id)
      await logBotActivity("nutrition.delete", String(rows[0].name))
      return `↩️ Removed today's last meal (${rows[0].name}).`
    }
  }

  if (group === "workout") {
    if (cmd?.name === "log") {
      const type = String(opt("type") ?? "").trim()
      const minutes = Math.round(Number(opt("minutes")))
      if (!type || !Number.isFinite(minutes) || minutes <= 0) return "Usage: `/health workout log type:Run minutes:40`"
      await supabase.from("workout_logs").insert({ date: today, type, duration_min: minutes })
      await logBotActivity("workout.create", `${type} ${minutes}m`)
      return `✅ Logged **${type}** for ${minutes}m.`
    }
    if (cmd?.name === "undo") {
      const { data: rows } = await supabase.from("workout_logs").select("id,type").eq("date", today).order("created_at", { ascending: false }).limit(1)
      if (!rows?.length) return "No workout logged today to undo."
      await supabase.from("workout_logs").delete().eq("id", rows[0].id)
      await logBotActivity("workout.delete", String(rows[0].type))
      return `↩️ Removed today's last workout (${rows[0].type}).`
    }
  }

  if (group === "med") {
    const dayStart = `${today}T00:00:00`
    if (cmd?.name === "taken") {
      const q = String(opt("name") ?? "").trim()
      let query = supabase.from("medication_doses").select("id,name").eq("status", "sent").gte("sent_at", dayStart)
      if (q) query = query.ilike("name", `%${q}%`)
      const { data: rows } = await query.order("sent_at", { ascending: false }).limit(1)
      if (!rows?.length) return q ? `No pending dose today matching "${q}".` : "No pending doses today. 💊"
      await supabase.from("medication_doses").update({ status: "taken", taken_at: new Date().toISOString() }).eq("id", rows[0].id)
      await logBotActivity("medication.taken", String(rows[0].name))
      return `✅ Marked **${rows[0].name}** as taken.`
    }
    if (cmd?.name === "undo") {
      const { data: rows } = await supabase.from("medication_doses").select("id,name").eq("status", "taken").order("taken_at", { ascending: false }).limit(1)
      if (!rows?.length) return "No dose marked taken to undo."
      await supabase.from("medication_doses").update({ status: "sent", taken_at: null }).eq("id", rows[0].id)
      await logBotActivity("medication.undo", String(rows[0].name))
      return `↩️ Unmarked **${rows[0].name}**.`
    }
    const { data } = await supabase.from("medication_doses").select("name,scheduled_time,status").gte("sent_at", dayStart).order("scheduled_time")
    if (!data?.length) return "**Medication** - nothing scheduled today. 💊"
    return `**Doses today**\n${data.map((d) => `${d.status === "taken" ? "✅" : "⬜"} ${d.name}${d.scheduled_time ? ` - ${d.scheduled_time}` : ""}`).join("\n")}`
  }

  if (group === "fitness") {
    if (cmd?.name === "stats") {
      const { data } = await supabase.from("strava_activities").select("distance_m,moving_time_s,sport_type")
      const rows = data ?? []
      if (!rows.length) return "**Fitness** - no Strava activities yet."
      const km = (rows.reduce((a, r) => a + ((r.distance_m as number) ?? 0), 0) / 1000).toFixed(0)
      const hours = (rows.reduce((a, r) => a + ((r.moving_time_s as number) ?? 0), 0) / 3600).toFixed(0)
      const bySport = new Map<string, number>()
      for (const r of rows) bySport.set(r.sport_type as string, (bySport.get(r.sport_type as string) ?? 0) + 1)
      const sports = [...bySport.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5).map(([s, n]) => `${s}: ${n}`).join(", ")
      return `**Fitness (all time)**\n${rows.length} activities · ${km}km · ${hours}h moving\n${sports}`
    }
    return fitnessCommand()
  }

  return "Use `/health meal`, `/health med`, `/health workout` or `/health fitness`."
}

async function weightCommand(sub: CommandOption | undefined): Promise<string> {
  const today = localToday()

  if (sub?.name === "log") {
    const kg = Number(sub.options?.find((o) => o.name === "kg")?.value)
    if (!Number.isFinite(kg) || kg <= 0 || kg > 999) return "Give a weight in kg: `/weight log kg:75.5`"
    await supabase.from("body_metrics").insert({ date: today, metric: "weight_kg", value: kg, unit: "kg" })
    await logBotActivity("health.create", `Weight ${kg}kg`)
    return `✅ Logged **${kg}kg** for today.`
  }

  if (sub?.name === "undo") {
    const { data: rows } = await supabase
      .from("body_metrics")
      .select("id")
      .eq("metric", "weight_kg")
      .eq("date", today)
      .order("id", { ascending: false })
      .limit(1)
    if (!rows?.length) return "No weight logged today to undo."
    await supabase.from("body_metrics").delete().eq("id", rows[0].id)
    await logBotActivity("health.delete", "Weight (undo)")
    return "↩️ Removed today's weight entry."
  }

  // stats (the default when no subcommand, so a bare intent still shows the current figure)
  const { data: logs } = await supabase
    .from("body_metrics")
    .select("value,date")
    .eq("metric", "weight_kg")
    .order("date", { ascending: false })
    .limit(2)
  if (!logs?.length) return "**Weight** - nothing logged yet. Try `/weight log kg:75`."
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
  const { data: habits } = await supabase.from("habits").select("id,name").eq("active", true).order("name")
  const active = habits ?? []

  if (!sub || sub.name === "list") {
    if (!active.length) return "No active habits."
    const { data: logs } = await supabase.from("habit_logs").select("habit_id").eq("date", today)
    const done = new Set((logs ?? []).map((l) => l.habit_id))
    const lines = active.map((h) => `${done.has(h.id) ? "✅" : "⬜"} ${h.name}`)
    return `**Habits today (${active.filter((h) => done.has(h.id)).length}/${active.length})**\n${lines.join("\n")}`
  }

  if (sub.name === "all") {
    if (!active.length) return "No active habits to mark."
    const rows = active.map((h) => ({ habit_id: h.id, date: today, completed: true }))
    await supabase.from("habit_logs").upsert(rows, { onConflict: "habit_id,date" })
    await logBotActivity("habit.checkin", `Marked all ${active.length} habits done`)
    return `✅ Marked **all ${active.length}** habits done for today.`
  }

  if (sub.name === "stats") {
    if (!active.length) return "No active habits."
    const since = new Date(Date.now() - 7 * 86_400_000).toLocaleDateString("en-CA", { timeZone: "Europe/London" })
    const { data: logs } = await supabase.from("habit_logs").select("habit_id").gte("date", since)
    const counts = new Map<string, number>()
    for (const l of logs ?? []) counts.set(l.habit_id, (counts.get(l.habit_id) ?? 0) + 1)
    const total = [...counts.values()].reduce((a, b) => a + b, 0)
    const lines = active.map((h) => `• ${h.name} - **${counts.get(h.id) ?? 0}**/7`)
    return `**Habits - last 7 days (${total} check-ins)**\n${lines.join("\n")}`
  }

  if (sub.name === "done" || sub.name === "undo") {
    const q = String(sub.options?.[0]?.value ?? "").trim()
    if (!q) return `Give me a name: \`/habit ${sub.name} name:Gym\``
    const matches = active.filter((h) => h.name.toLowerCase().includes(q.toLowerCase()))
    if (!matches.length) return `No active habit matching "${q}".`
    if (matches.length > 1) return `More than one matches "${q}": ${matches.map((m) => m.name).join(", ")}. Be more specific.`
    const h = matches[0]
    if (sub.name === "done") {
      await supabase.from("habit_logs").upsert({ habit_id: h.id, date: today, completed: true }, { onConflict: "habit_id,date" })
      await logBotActivity("habit.checkin", h.name)
      return `✅ Marked **${h.name}** done for today.`
    }
    await supabase.from("habit_logs").delete().eq("habit_id", h.id).eq("date", today)
    await logBotActivity("habit.undo_checkin", h.name)
    return `↩️ Unmarked **${h.name}** for today.`
  }

  return "Use `/habit list`, `done name:…`, `all`, `undo name:…` or `stats`."
}

async function streakCommand(sub: CommandOption | undefined): Promise<string> {
  const today = localToday()
  const { data: streaks } = await supabase.from("streaks").select("id,name").eq("active", true).order("order_index")
  const active = streaks ?? []

  if (!sub || sub.name === "status") {
    if (!active.length) return "No active streaks."
    const { data: logs } = await supabase.from("streak_logs").select("streak_id").eq("date", today)
    const done = new Set((logs ?? []).map((l) => l.streak_id))
    const lines = active.map((s) => `${done.has(s.id) ? "✅" : "⬜"} ${s.name}`)
    return `**Streaks today (${active.filter((s) => done.has(s.id)).length}/${active.length})**\n${lines.join("\n")}`
  }

  if (sub.name === "all") {
    if (!active.length) return "No active streaks to log."
    const rows = active.map((s) => ({ streak_id: s.id, date: today, completed: true }))
    await supabase.from("streak_logs").upsert(rows, { onConflict: "streak_id,date" })
    await logBotActivity("streak.checkin", `Logged all ${active.length} streaks`)
    return `✅ Logged **all ${active.length}** streaks for today.`
  }

  if (sub.name === "clear") {
    const { data: logs } = await supabase.from("streak_logs").select("streak_id").eq("date", today)
    const n = (logs ?? []).length
    if (!n) return "No streak check-ins to clear for today."
    await supabase.from("streak_logs").delete().eq("date", today)
    await logBotActivity("streak.undo_checkin", `Cleared all ${n} streak check-ins`)
    return `↩️ Cleared **all ${n}** streak check-ins for today.`
  }

  if (sub.name === "stats") {
    if (!active.length) return "No active streaks."
    const { data: logs } = await supabase.from("streak_logs").select("streak_id,date").eq("completed", true)
    const byStreak = new Map<string, string[]>()
    for (const l of logs ?? []) {
      const arr = byStreak.get(l.streak_id) ?? []
      arr.push(l.date as string)
      byStreak.set(l.streak_id, arr)
    }
    const lines = active.map((s) => {
      const { current, longest } = streakLengths(byStreak.get(s.id) ?? [], today)
      return `• ${s.name} - **${current}**d now, ${longest}d best`
    })
    return `**Streak stats**\n${lines.join("\n")}`
  }

  if (sub.name === "log" || sub.name === "undo") {
    const q = String(sub.options?.[0]?.value ?? "").trim()
    if (!q) return `Give me a name: \`/streak ${sub.name} name:Gym\``
    const matches = active.filter((s) => s.name.toLowerCase().includes(q.toLowerCase()))
    if (!matches.length) return `No active streak matching "${q}".`
    if (matches.length > 1) return `More than one matches "${q}": ${matches.map((m) => m.name).join(", ")}. Be more specific.`
    const s = matches[0]
    if (sub.name === "log") {
      await supabase.from("streak_logs").upsert({ streak_id: s.id, date: today, completed: true }, { onConflict: "streak_id,date" })
      await logBotActivity("streak.checkin", s.name)
      return `✅ Logged **${s.name}** for today.`
    }
    await supabase.from("streak_logs").delete().eq("streak_id", s.id).eq("date", today)
    await logBotActivity("streak.undo_checkin", s.name)
    return `↩️ Removed today's check-in for **${s.name}**.`
  }

  return "Use `/streak status`, `log name:…`, `all`, `undo name:…`, `clear` or `stats`."
}

async function logCommand(sub: CommandOption | undefined): Promise<string> {
  const opt = (n: string) => sub?.options?.find((o) => o.name === n)?.value
  if (sub?.name === "diary") {
    const text = String(opt("text") ?? "").trim()
    if (!text) return "Give some text: `/log diary text:Today I…`"
    const mood = String(opt("mood") ?? "neutral").trim() || "neutral"
    const title = text.length > 50 ? `${text.slice(0, 50)}…` : text
    await supabase.from("diary").insert({ title, content: text, mood })
    await logBotActivity("diary.create", title)
    return "✅ Diary entry saved."
  }
  return "Use `/log diary`. Study moved to `/study log`, weight to `/weight log`."
}

async function studyCommand(sub: CommandOption | undefined): Promise<string> {
  const opt = (n: string) => sub?.options?.find((o) => o.name === n)?.value
  const today = localToday()
  if (sub?.name === "log") {
    const minutes = Math.round(Number(opt("minutes")))
    const subject = String(opt("subject") ?? "").trim()
    if (!Number.isFinite(minutes) || minutes <= 0) return "Give minutes: `/study log minutes:60 subject:Maths`"
    if (!subject) return "Give a subject: `/study log minutes:60 subject:Maths`"
    await supabase.from("study_sessions").insert({ date: today, subject, duration_m: minutes, productive: true })
    await logBotActivity("study.create", `${minutes}m of ${subject}`)
    return `✅ Logged **${minutes}m** of ${subject}.`
  }
  if (sub?.name === "undo") {
    const { data: rows } = await supabase.from("study_sessions").select("id,subject").eq("date", today).order("id", { ascending: false }).limit(1)
    if (!rows?.length) return "No study session logged today to undo."
    await supabase.from("study_sessions").delete().eq("id", rows[0].id)
    await logBotActivity("study.delete", String(rows[0].subject))
    return `↩️ Removed today's last study session (${rows[0].subject}).`
  }
  // stats (default) - last 7 days total and per subject
  const from = new Date(Date.now() - 7 * 86_400_000).toLocaleDateString("en-CA", { timeZone: "Europe/London" })
  const { data } = await supabase.from("study_sessions").select("subject,duration_m").gte("date", from)
  const rows = data ?? []
  const total = rows.reduce((a, r) => a + (r.duration_m ?? 0), 0)
  const bySub = new Map<string, number>()
  for (const r of rows) bySub.set(r.subject, (bySub.get(r.subject) ?? 0) + (r.duration_m ?? 0))
  const lines = [...bySub.entries()].sort((a, b) => b[1] - a[1]).map(([s, m]) => `• ${s} - ${(m / 60).toFixed(1)}h`)
  return `**Study - last 7 days (${(total / 60).toFixed(1)}h)**\n${lines.join("\n") || "nothing logged"}`
}

async function faithCommand(sub: CommandOption | undefined): Promise<string> {
  const opt = (n: string) => sub?.options?.find((o) => o.name === n)?.value
  const today = localToday()
  if (sub?.name === "log") {
    const type = String(opt("type") ?? "bible").trim() || "bible"
    const title = String(opt("title") ?? "").trim() || null
    await supabase.from("faith_entries").insert({ date: today, type, title, completed: true })
    await logBotActivity("faith.create", type)
    return `✅ Logged a **${type}** entry for today.`
  }
  if (sub?.name === "undo") {
    const { data: rows } = await supabase.from("faith_entries").select("id,type").eq("date", today).order("id", { ascending: false }).limit(1)
    if (!rows?.length) return "No faith entry logged today to undo."
    await supabase.from("faith_entries").delete().eq("id", rows[0].id)
    await logBotActivity("faith.delete", String(rows[0].type))
    return "↩️ Removed today's last faith entry."
  }
  // stats (default) - entry streak
  const { data } = await supabase.from("faith_entries").select("date").eq("completed", true)
  const dates = (data ?? []).map((r) => r.date as string)
  const { current, longest } = streakLengths(dates, today)
  return `**Faith** - **${current}**d current streak, ${longest}d best. ${dates.length} entries total.`
}

// /uni is a two-level command: sub is the group (deadline / book / submission) and sub.options[0] is the
// actual subcommand, whose options hold the parameters.
async function uniCommand(sub: CommandOption | undefined): Promise<string> {
  const group = sub?.name
  const cmd = sub?.options?.[0]
  const opt = (n: string) => cmd?.options?.find((o) => o.name === n)?.value
  const today = localToday()

  if (group === "deadline") {
    if (cmd?.name === "add") {
      const title = String(opt("title") ?? "").trim()
      const due = String(opt("due") ?? "").trim()
      if (!title || !due) return "Usage: `/uni deadline add title:Essay due:2026-05-01`"
      await supabase.from("uni_deadlines").insert({ title, due_date: due, status: "not_started" })
      await logBotActivity("deadline.create", title)
      return `✅ Added deadline **${title}** due ${due}.`
    }
    if (cmd?.name === "done") {
      const q = String(opt("name") ?? "").trim()
      if (!q) return "Give a name: `/uni deadline done name:Essay`"
      const { data: matches } = await supabase.from("uni_deadlines").select("id,title").ilike("title", `%${q}%`).neq("status", "graded").limit(5)
      if (!matches?.length) return `No deadline matching "${q}".`
      if (matches.length > 1) return `More than one: ${matches.map((m) => m.title).join(", ")}. Be more specific.`
      await supabase.from("uni_deadlines").update({ status: "submitted", submitted_at: new Date().toISOString() }).eq("id", matches[0].id)
      await logBotActivity("deadline.update", `${matches[0].title} submitted`)
      return `✅ Marked **${matches[0].title}** submitted.`
    }
    return deadlinesCommand()
  }

  if (group === "book") {
    if (cmd?.name === "add") {
      const title = String(opt("title") ?? "").trim()
      const due = String(opt("due") ?? "").trim()
      if (!title || !due) return "Usage: `/uni book add title:Clean Code due:2026-05-01`"
      await supabase.from("uni_library_books").insert({ title, due_date: due, borrowed_at: today })
      await logBotActivity("book.create", title)
      return `✅ Borrowed **${title}**, due ${due}.`
    }
    if (cmd?.name === "return") {
      const q = String(opt("name") ?? "").trim()
      if (!q) return "Give a name: `/uni book return name:Clean Code`"
      const { data: matches } = await supabase.from("uni_library_books").select("id,title").is("returned_at", null).ilike("title", `%${q}%`).limit(5)
      if (!matches?.length) return `No book on loan matching "${q}".`
      if (matches.length > 1) return `More than one: ${matches.map((m) => m.title).join(", ")}. Be more specific.`
      await supabase.from("uni_library_books").update({ returned_at: today }).eq("id", matches[0].id)
      await logBotActivity("book.update", `${matches[0].title} returned`)
      return `✅ Returned **${matches[0].title}**.`
    }
    const { data } = await supabase.from("uni_library_books").select("title,due_date").is("returned_at", null).order("due_date")
    if (!data?.length) return "**Library** - no books on loan. 📚"
    return `**On loan**\n${data.map((b) => `• ${b.title} - due ${b.due_date}`).join("\n")}`
  }

  if (group === "submission") {
    if (cmd?.name === "add") {
      const title = String(opt("title") ?? "").trim()
      if (!title) return "Give a title: `/uni submission add title:Lab report`"
      await supabase.from("uni_submissions").insert({ title })
      await logBotActivity("submission.create", title)
      return `✅ Logged submission **${title}**.`
    }
    const { data } = await supabase.from("uni_submissions").select("title,submitted_at").order("submitted_at", { ascending: false }).limit(10)
    if (!data?.length) return "No submissions logged."
    return `**Recent submissions**\n${data.map((s) => `• ${s.title} _(${String(s.submitted_at).slice(0, 10)})_`).join("\n")}`
  }

  return "Use `/uni deadline`, `/uni book` or `/uni submission`."
}

const DEFERRED = new Set([
  "today",
  "week",
  "goal",
  "app",
  "oss",
  "uni",
  "study",
  "faith",
  "calendar",
  "contact",
  "reminder",
  "vault",
  "coding",
  "health",
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
            case "goal":
              content = await goalCommand(sub)
              break
            case "app":
              content = await appCommand(sub)
              break
            case "oss":
              content = await ossCommand(sub)
              break
            case "uni":
              content = await uniCommand(sub)
              break
            case "study":
              content = await studyCommand(sub)
              break
            case "faith":
              content = await faithCommand(sub)
              break
            case "calendar":
              content = await calendarCommand(sub)
              break
            case "contact":
              content = await contactCommand(sub)
              break
            case "reminder":
              content = await reminderCommand(sub)
              break
            case "vault":
              content = await vaultCommand()
              break
            case "coding":
              content = await codingCommand()
              break
            case "health":
              content = await healthCommand(sub)
              break
            case "weight":
              content = await weightCommand(sub)
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
