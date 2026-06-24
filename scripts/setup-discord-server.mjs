// One-shot Discord server builder for the personal OS. Creates the whole structure - categories, text
// channels and a webhook per channel - from the bot token, so I never click through it by hand. Node only,
// no Python, no persistent process. Run once against an empty server:
//
//   DISCORD_BOT_TOKEN=... DISCORD_GUILD_ID=... node scripts/setup-discord-server.mjs
//
// The bot must already be in the server with the Manage Channels and Manage Webhooks permissions. It prints
// a webhook URL per channel at the end: paste the ops ones (uptime, errors) into Better Stack / Healthchecks
// / Sentry, and keep the rest for the scheduled sends.

import { writeFileSync } from "node:fs"

const token = process.env.DISCORD_BOT_TOKEN
const guildId = process.env.DISCORD_GUILD_ID

if (!token || !guildId) {
  console.error("Set DISCORD_BOT_TOKEN and DISCORD_GUILD_ID first.")
  process.exit(1)
}

const API = "https://discord.com/api/v10"
const headers = { Authorization: `Bot ${token}`, "Content-Type": "application/json" }

// The server layout. Each category holds its text channels.
// Mirrors the dashboard sidebar (app/dashboard/components/DashboardSidebar.tsx): each sidebar group becomes
// a category, each section a channel, plus a monitoring category for the ops feeds. Delete any you do not
// want after it runs - that is easier than adding later.
const STRUCTURE = [
  {
    category: "📊 monitoring",
    channels: [
      { name: "uptime", topic: "Better Stack + Healthchecks - alerts when the site or a cron goes down" },
      { name: "errors", topic: "Sentry server errors" },
      { name: "digest", topic: "The daily dashboard digest" },
    ],
  },
  {
    category: "🎯 work",
    channels: [
      { name: "goals", topic: "Goal updates and progress" },
      { name: "applications", topic: "Job application status changes" },
      { name: "jobs", topic: "Scraper run summary and new roles" },
      { name: "open-source", topic: "Open-source contributions" },
    ],
  },
  {
    category: "🎓 university",
    channels: [
      { name: "deadlines", topic: "Coursework and exam deadline alerts" },
      { name: "modules", topic: "Module notes and coursework" },
      { name: "course", topic: "Course and timetable updates" },
    ],
  },
  {
    category: "📅 daily",
    channels: [
      { name: "routine", topic: "Morning and evening routine reminders" },
      { name: "bible-verse", topic: "A verse each morning" },
      { name: "study", topic: "Study session nudges" },
      { name: "faith", topic: "Faith entries and reflections" },
      { name: "calendar", topic: "Upcoming events and reminders" },
    ],
  },
  {
    category: "💪 wellbeing",
    channels: [
      { name: "health", topic: "Workouts, Strava activity and body metrics" },
      { name: "habits", topic: "Daily habit check-ins" },
      { name: "streaks", topic: "Streak check-ins and nudges" },
    ],
  },
  {
    category: "📝 personal",
    channels: [
      { name: "diary", topic: "Diary entries" },
      { name: "contacts", topic: "Follow-up reminders" },
      { name: "reminders", topic: "General reminders" },
    ],
  },
  {
    category: "📦 belongings",
    channels: [
      { name: "wishlist", topic: "Wishlist items" },
      { name: "inventory", topic: "Inventory and warranty expiry" },
      { name: "vault", topic: "Vault key, card and document expiry alerts" },
    ],
  },
  {
    category: "📈 analytics",
    channels: [
      { name: "coding", topic: "Weekly coding summary (WakaTime)" },
      { name: "posts", topic: "Blog reads and published posts" },
      { name: "fitness", topic: "Fitness analytics" },
    ],
  },
]

// Discord rate-limits writes, so I pace the calls and back off on a 429.
async function post(path, body) {
  for (let attempt = 0; attempt < 5; attempt++) {
    const res = await fetch(`${API}${path}`, { method: "POST", headers, body: JSON.stringify(body) })
    if (res.status === 429) {
      const retryAfter = (await res.json().catch(() => ({})))?.retry_after ?? 1
      await new Promise((r) => setTimeout(r, retryAfter * 1000 + 250))
      continue
    }
    if (!res.ok) throw new Error(`${res.status} ${await res.text()}`)
    return res.json()
  }
  throw new Error("rate limited too many times")
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const webhooks = {}

for (const { category, channels } of STRUCTURE) {
  const cat = await post(`/guilds/${guildId}/channels`, { name: category, type: 4 }) // 4 = category
  console.log(`Category: ${category}`)
  await sleep(400)
  for (const { name, topic } of channels) {
    const ch = await post(`/guilds/${guildId}/channels`, { name, type: 0, parent_id: cat.id, topic }) // 0 = text
    await sleep(400)
    const wh = await post(`/channels/${ch.id}/webhooks`, { name: "Personal OS" })
    webhooks[name] = `https://discord.com/api/webhooks/${wh.id}/${wh.token}`
    console.log(`  #${name}`)
    await sleep(400)
  }
}

writeFileSync("discord-webhooks.json", JSON.stringify(webhooks, null, 2))
console.log(`\n=== Done - saved ${Object.keys(webhooks).length} webhook URLs to discord-webhooks.json ===`)
console.log("Ops: #uptime + #errors go into Better Stack / Healthchecks / Sentry.")
console.log("The rest I will wire into the scheduled sends.")
