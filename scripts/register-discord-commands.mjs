// Registers the personal OS slash commands with Discord. Run once, and again whenever the command list
// changes. Guild-scoped (instant) when DISCORD_GUILD_ID is set, otherwise global (can take ~1 hour).
//
//   DISCORD_BOT_TOKEN=... DISCORD_APPLICATION_ID=... DISCORD_GUILD_ID=... node scripts/register-discord-commands.mjs
//
// The Bot Token and Application ID come from discord.com/developers; the Guild ID is your server id
// (enable Developer Mode in Discord, right-click the server, Copy Server ID).

const token = process.env.DISCORD_BOT_TOKEN
const appId = process.env.DISCORD_APPLICATION_ID
const guildId = process.env.DISCORD_GUILD_ID

if (!token || !appId) {
  console.error("Set DISCORD_BOT_TOKEN and DISCORD_APPLICATION_ID first.")
  process.exit(1)
}

// Discord option types: 1 = subcommand, 3 = string, 4 = integer, 10 = number
const commands = [
  { name: "ping", description: "Check the bot is alive" },
  { name: "help", description: "List every command and how to use it" },
  { name: "today", description: "Today's summary across everything I track" },
  { name: "week", description: "The past week's summary" },
  { name: "goals", description: "Active goals and how many are done" },
  { name: "applications", description: "Job pipeline and recent applications" },
  { name: "deadlines", description: "Upcoming university deadlines" },
  { name: "calendar", description: "Events in the next 7 days" },
  { name: "contacts", description: "Who is due a follow-up" },
  { name: "vault", description: "Keys, cards and documents expiring soon" },
  { name: "coding", description: "Coding hours today and this week" },
  { name: "fitness", description: "Recent workouts" },
  { name: "weight", description: "Current weight and goal progress" },
  {
    name: "habit",
    description: "Track habits",
    options: [
      { type: 1, name: "list", description: "Show today's habit status" },
      {
        type: 1,
        name: "done",
        description: "Mark a habit done for today",
        options: [{ type: 3, name: "name", description: "Habit name (partial match is fine)", required: true }],
      },
    ],
  },
  {
    name: "streak",
    description: "Track streaks",
    options: [
      { type: 1, name: "status", description: "Show all streak states for today" },
      {
        type: 1,
        name: "log",
        description: "Log a streak check-in for today",
        options: [{ type: 3, name: "name", description: "Streak name (partial match is fine)", required: true }],
      },
    ],
  },
  {
    name: "log",
    description: "Quick-log weight, study or a diary entry",
    options: [
      {
        type: 1,
        name: "weight",
        description: "Log today's weight",
        options: [{ type: 10, name: "kg", description: "Weight in kg", required: true }],
      },
      {
        type: 1,
        name: "study",
        description: "Log a study session",
        options: [
          { type: 4, name: "minutes", description: "Duration in minutes", required: true },
          { type: 3, name: "subject", description: "Subject studied", required: true },
        ],
      },
      {
        type: 1,
        name: "diary",
        description: "Save a quick diary entry",
        options: [
          { type: 3, name: "text", description: "What's on your mind", required: true },
          { type: 3, name: "mood", description: "Mood (optional)", required: false },
        ],
      },
    ],
  },
]

const url = guildId
  ? `https://discord.com/api/v10/applications/${appId}/guilds/${guildId}/commands`
  : `https://discord.com/api/v10/applications/${appId}/commands`

const res = await fetch(url, {
  method: "PUT",
  headers: { Authorization: `Bot ${token}`, "Content-Type": "application/json" },
  body: JSON.stringify(commands),
})

if (res.ok) {
  console.log(`Registered ${commands.length} commands ${guildId ? "(guild, instant)" : "(global, ~1h to propagate)"}.`)
} else {
  console.error("Failed:", res.status, await res.text())
  process.exit(1)
}
