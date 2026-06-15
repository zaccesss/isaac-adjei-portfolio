// I send a nightly Discord message comparing today's coding time to my 30-day average so I can track consistency without opening a dashboard.
/**
 * Fetches today's WakaTime total from Supabase, compares it to the 30-day
 * average, and sends a short summary to Discord via webhook.
 *
 * Runs via GitHub Actions at 23:55 UTC after the wakatime-sync job has
 * already written today's row.
 */

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY
const DISCORD_WEBHOOK = process.env.DISCORD_WEBHOOK_URL

if (!SUPABASE_URL || !SUPABASE_KEY || !DISCORD_WEBHOOK) {
  console.log("Missing env vars — skipping.")
  process.exit(0)
}

function fmt(seconds) {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  if (h === 0) return `${m}m`
  if (m === 0) return `${h}h`
  return `${h}h ${m}m`
}

async function supabaseGet(path) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      "Content-Type": "application/json",
    },
  })
  if (!res.ok) throw new Error(`Supabase ${res.status}: ${await res.text()}`)
  return res.json()
}

const today = new Date().toISOString().slice(0, 10)
const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10)

const rows = await supabaseGet(
  `wakatime_daily?select=date,total_seconds&date=gte.${thirtyDaysAgo}&order=date.desc`
)

const todayRow = rows.find((r) => r.date === today)
const todaySeconds = todayRow?.total_seconds ?? 0

if (todaySeconds === 0) {
  console.log("No coding today — skipping Discord notification.")
  process.exit(0)
}

const activeDays = rows.filter((r) => r.date !== today && r.total_seconds > 0)
const avgSeconds =
  activeDays.length > 0
    ? Math.round(activeDays.reduce((sum, r) => sum + r.total_seconds, 0) / activeDays.length)
    : 0

const aboveAverage = avgSeconds > 0 && todaySeconds > avgSeconds
const diff = Math.abs(todaySeconds - avgSeconds)
const pct = avgSeconds > 0 ? Math.round((diff / avgSeconds) * 100) : 0

let emoji = "💻"
let headline = `Coded for **${fmt(todaySeconds)}** today`
if (aboveAverage) {
  emoji = pct >= 50 ? "🔥" : "✅"
  headline += ` — ${pct}% above your 30-day average (${fmt(avgSeconds)})`
} else if (avgSeconds > 0) {
  headline += ` — ${pct}% below your 30-day average (${fmt(avgSeconds)})`
}

const payload = {
  content: null,
  embeds: [
    {
      title: `${emoji} Daily coding summary — ${today}`,
      description: headline,
      color: aboveAverage ? 0x22c55e : 0x6366f1,
      footer: { text: "isaacadjei.me dashboard · WakaTime" },
    },
  ],
}

const res = await fetch(DISCORD_WEBHOOK, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(payload),
})

if (!res.ok) {
  console.error("Discord webhook failed:", res.status, await res.text())
  process.exit(1)
}

console.log("Discord summary sent:", headline)
