// Single source of truth for the Discord slash commands: the schema Discord needs PLUS documentation
// (usage + detail) that scripts/post-command-reference.mjs turns into the #commands reference. The register
// script strips the doc-only fields before sending to Discord. Keep this in step with the handlers in
// app/api/discord-interaction/route.ts - a command here with no handler will error when used.

// Discord option types: 1 = subcommand, 2 = subcommand group, 3 = string, 4 = integer, 10 = number.
const SUB = 1, STR = 3, INT = 4, NUM = 10

export const COMMANDS = [
  { name: "ping", description: "Check the bot is alive", usage: "/ping", detail: "Replies instantly to confirm the bot is up." },
  { name: "help", description: "List every command and how to use it", usage: "/help", detail: "A categorised cheat sheet. The full reference lives in #commands." },
  { name: "today", description: "Today's summary across everything I track", usage: "/today", detail: "One shot over the last 24 hours: applications, coding, study, streaks, habits and what is coming up." },
  { name: "week", description: "The past week's summary", usage: "/week", detail: "Same as /today but over the last 7 days." },
  { name: "goals", description: "Active goals and how many are done", usage: "/goals", detail: "Lists active goals and the done count." },
  { name: "applications", description: "Job pipeline and recent applications", usage: "/applications", detail: "Live application count, interviews, offers and the most recent roles." },
  { name: "deadlines", description: "Upcoming university deadlines", usage: "/deadlines", detail: "Coursework and exams due in the next three weeks." },
  { name: "calendar", description: "Events in the next 7 days", usage: "/calendar", detail: "Upcoming calendar events for the week ahead." },
  { name: "contacts", description: "Who is due a follow-up", usage: "/contacts", detail: "Contacts flagged for follow-up or not contacted in 30 days." },
  { name: "vault", description: "Keys, cards and documents expiring soon", usage: "/vault", detail: "Vault and inventory items inside their expiry warning window." },
  { name: "coding", description: "Coding hours today and this week", usage: "/coding", detail: "WakaTime hours for today and the last 7 days." },
  { name: "fitness", description: "Recent workouts", usage: "/fitness", detail: "Strava activities from the last two weeks." },
  {
    name: "streak",
    description: "Track streaks - log, undo and stats",
    detail: "Everything for daily streaks. `all` logs every active streak at once so you never do them one by one, `clear` undoes them all, `undo` removes a single one.",
    options: [
      { type: SUB, name: "status", description: "Show all streak states for today", usage: "/streak status" },
      { type: SUB, name: "all", description: "Log EVERY active streak for today", usage: "/streak all" },
      { type: SUB, name: "clear", description: "Undo all of today's streak check-ins", usage: "/streak clear" },
      { type: SUB, name: "stats", description: "Current and longest run per streak", usage: "/streak stats" },
      { type: SUB, name: "log", description: "Log one streak for today", usage: "/streak log name:Gym",
        options: [{ type: STR, name: "name", description: "Streak name (partial match is fine)", required: true }] },
      { type: SUB, name: "undo", description: "Remove today's check-in for one streak", usage: "/streak undo name:Gym",
        options: [{ type: STR, name: "name", description: "Streak name (partial match is fine)", required: true }] },
    ],
  },
  {
    name: "habit",
    description: "Track habits - mark, undo and stats",
    detail: "Everything for daily habits. `all` marks every habit done at once, `undo` unmarks one, `stats` shows the last 7 days.",
    options: [
      { type: SUB, name: "list", description: "Show today's habit status", usage: "/habit list" },
      { type: SUB, name: "all", description: "Mark EVERY habit done for today", usage: "/habit all" },
      { type: SUB, name: "stats", description: "Check-ins per habit over the last 7 days", usage: "/habit stats" },
      { type: SUB, name: "done", description: "Mark one habit done for today", usage: "/habit done name:Reading",
        options: [{ type: STR, name: "name", description: "Habit name (partial match is fine)", required: true }] },
      { type: SUB, name: "undo", description: "Unmark one habit for today", usage: "/habit undo name:Reading",
        options: [{ type: STR, name: "name", description: "Habit name (partial match is fine)", required: true }] },
    ],
  },
  {
    name: "weight",
    description: "Log, undo and check your weight",
    detail: "Body-weight tracking. `log` records today's weight, `undo` removes it, `stats` shows current, change and goal.",
    options: [
      { type: SUB, name: "log", description: "Log today's weight", usage: "/weight log kg:75.5",
        options: [{ type: NUM, name: "kg", description: "Weight in kg", required: true }] },
      { type: SUB, name: "undo", description: "Remove today's weight entry", usage: "/weight undo" },
      { type: SUB, name: "stats", description: "Current weight, change and goal", usage: "/weight stats" },
    ],
  },
  {
    name: "log",
    description: "Quick-log a study session or diary entry",
    detail: "Fast log for study and diary. Weight moved to /weight log.",
    options: [
      { type: SUB, name: "study", description: "Log a study session", usage: "/log study minutes:60 subject:Maths",
        options: [
          { type: INT, name: "minutes", description: "Duration in minutes", required: true },
          { type: STR, name: "subject", description: "Subject studied", required: true },
        ] },
      { type: SUB, name: "diary", description: "Save a quick diary entry", usage: "/log diary text:… mood:…",
        options: [
          { type: STR, name: "text", description: "What's on your mind", required: true },
          { type: STR, name: "mood", description: "Mood (optional)", required: false },
        ] },
    ],
  },
]

// Strip the documentation-only fields (usage, detail) so the object is a valid Discord command payload.
export function toDiscordSchema(cmd) {
  const clean = (o) => {
    const out = {}
    if (o.type !== undefined) out.type = o.type
    if (o.name !== undefined) out.name = o.name
    if (o.description !== undefined) out.description = o.description
    if (o.required !== undefined) out.required = o.required
    if (Array.isArray(o.options)) out.options = o.options.map(clean)
    return out
  }
  return clean(cmd)
}
