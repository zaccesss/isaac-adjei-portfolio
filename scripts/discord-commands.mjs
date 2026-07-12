// Single source of truth for the Discord slash commands: the schema Discord needs PLUS documentation
// (usage + detail) that scripts/post-command-reference.mjs turns into the #commands reference. The register
// script strips the doc-only fields before sending to Discord. Keep this in step with the handlers in
// app/api/discord-interaction/route.ts - a command here with no handler will error when used.

// Discord option types: 1 = subcommand, 2 = subcommand group, 3 = string, 4 = integer, 10 = number.
const SUB = 1, GRP = 2, STR = 3, INT = 4, NUM = 10

export const COMMANDS = [
  { name: "ping", description: "Check the bot is alive", usage: "/ping", detail: "Replies instantly to confirm the bot is up." },
  { name: "help", description: "List every command and how to use it", usage: "/help", detail: "A categorised cheat sheet. The full reference lives in #commands." },
  { name: "today", description: "Today's summary across everything I track", usage: "/today", detail: "One shot over the last 24 hours: applications, coding, study, streaks, habits and what is coming up." },
  { name: "week", description: "The past week's summary", usage: "/week", detail: "Same as /today but over the last 7 days." },
  {
    name: "goal",
    description: "Goals - add, complete, set progress, delete, list",
    detail: "Manage goals from Discord. `add` creates one, `done` completes it, `progress` sets a percent, `delete` removes it, `list` shows active goals.",
    options: [
      { type: SUB, name: "list", description: "Active goals and how many are done", usage: "/goal list" },
      { type: SUB, name: "add", description: "Add a goal", usage: "/goal add title:Learn Rust category:Learning",
        options: [
          { type: STR, name: "title", description: "Goal title", required: true },
          { type: STR, name: "category", description: "Category (optional, defaults to Personal)", required: false },
        ] },
      { type: SUB, name: "done", description: "Mark a goal done", usage: "/goal done name:Rust",
        options: [{ type: STR, name: "name", description: "Goal name (partial match)", required: true }] },
      { type: SUB, name: "progress", description: "Set a goal's progress percent", usage: "/goal progress name:Rust pct:50",
        options: [
          { type: STR, name: "name", description: "Goal name (partial match)", required: true },
          { type: INT, name: "pct", description: "Progress 0-100", required: true },
        ] },
      { type: SUB, name: "delete", description: "Delete a goal", usage: "/goal delete name:Rust",
        options: [{ type: STR, name: "name", description: "Goal name (partial match)", required: true }] },
    ],
  },
  {
    name: "app",
    description: "Job applications - add, update status, list, delete, stats",
    detail: "Track job applications. `add` logs one, `status` moves its stage, `list` shows recent, `delete` removes it, `stats` (default) shows the live pipeline.",
    options: [
      { type: SUB, name: "stats", description: "Live pipeline: applied, interviewing, offers", usage: "/app stats" },
      { type: SUB, name: "list", description: "Most recent live applications", usage: "/app list" },
      { type: SUB, name: "add", description: "Add an application", usage: "/app add company:Google role:SWE Intern type:Internship status:Applied",
        options: [
          { type: STR, name: "company", description: "Company", required: true },
          { type: STR, name: "role", description: "Role", required: true },
          { type: STR, name: "type", description: "Type (optional, defaults to Internship)", required: false },
          { type: STR, name: "status", description: "Status (optional, defaults to Applied)", required: false },
        ] },
      { type: SUB, name: "status", description: "Update an application's status", usage: "/app status name:Google to:Interview",
        options: [
          { type: STR, name: "name", description: "Company or role (partial match)", required: true },
          { type: STR, name: "to", description: "New status", required: true },
        ] },
      { type: SUB, name: "delete", description: "Delete an application", usage: "/app delete name:Google",
        options: [{ type: STR, name: "name", description: "Company or role (partial match)", required: true }] },
    ],
  },
  {
    name: "oss",
    description: "Open source contributions - add, delete, list, stats",
    detail: "Log open source contributions. `add` records a PR or issue, `delete` removes one, `list` shows recent, `stats` (default) counts by status.",
    options: [
      { type: SUB, name: "stats", description: "Contribution counts by status", usage: "/oss stats" },
      { type: SUB, name: "list", description: "Most recent contributions", usage: "/oss list" },
      { type: SUB, name: "add", description: "Log a contribution", usage: "/oss add repo:vercel/next.js title:Fix a typo url:https://...",
        options: [
          { type: STR, name: "repo", description: "Repository (e.g. owner/name)", required: true },
          { type: STR, name: "title", description: "PR or issue title (optional)", required: false },
          { type: STR, name: "url", description: "Link (optional)", required: false },
        ] },
      { type: SUB, name: "delete", description: "Delete a contribution", usage: "/oss delete name:next.js",
        options: [{ type: STR, name: "name", description: "Repo or title (partial match)", required: true }] },
    ],
  },
  {
    name: "uni",
    description: "University - deadlines, library books and submissions",
    detail: "University admin. `deadline` lists/adds/completes coursework deadlines, `book` tracks library loans and returns, `submission` logs what you handed in.",
    options: [
      { type: GRP, name: "deadline", description: "Coursework deadlines",
        options: [
          { type: SUB, name: "list", description: "Deadlines due in the next three weeks", usage: "/uni deadline list" },
          { type: SUB, name: "add", description: "Add a deadline", usage: "/uni deadline add title:Essay due:2026-05-01",
            options: [
              { type: STR, name: "title", description: "Deadline title", required: true },
              { type: STR, name: "due", description: "Due date YYYY-MM-DD", required: true },
            ] },
          { type: SUB, name: "done", description: "Mark a deadline submitted", usage: "/uni deadline done name:Essay",
            options: [{ type: STR, name: "name", description: "Deadline name (partial match)", required: true }] },
        ] },
      { type: GRP, name: "book", description: "Library books",
        options: [
          { type: SUB, name: "due", description: "Books on loan and their due dates", usage: "/uni book due" },
          { type: SUB, name: "add", description: "Log a borrowed book", usage: "/uni book add title:Clean Code due:2026-05-01",
            options: [
              { type: STR, name: "title", description: "Book title", required: true },
              { type: STR, name: "due", description: "Due date YYYY-MM-DD", required: true },
            ] },
          { type: SUB, name: "return", description: "Mark a book returned", usage: "/uni book return name:Clean Code",
            options: [{ type: STR, name: "name", description: "Book title (partial match)", required: true }] },
        ] },
      { type: GRP, name: "submission", description: "Things submitted",
        options: [
          { type: SUB, name: "list", description: "Recent submissions", usage: "/uni submission list" },
          { type: SUB, name: "add", description: "Log a submission", usage: "/uni submission add title:Lab report",
            options: [{ type: STR, name: "title", description: "Submission title", required: true }] },
        ] },
    ],
  },
  {
    name: "study",
    description: "Study sessions - log, undo and stats",
    detail: "Track study. `log` records a session, `undo` removes today's last, `stats` (default) shows the last 7 days by subject.",
    options: [
      { type: SUB, name: "stats", description: "Last 7 days total and per subject", usage: "/study stats" },
      { type: SUB, name: "log", description: "Log a study session", usage: "/study log minutes:60 subject:Maths",
        options: [
          { type: INT, name: "minutes", description: "Duration in minutes", required: true },
          { type: STR, name: "subject", description: "Subject studied", required: true },
        ] },
      { type: SUB, name: "undo", description: "Remove today's last study session", usage: "/study undo" },
    ],
  },
  {
    name: "faith",
    description: "Faith entries - log, undo and streak",
    detail: "Track faith entries (bible, prayer, church). `log` records one for today, `undo` removes today's last, `stats` (default) shows the entry streak.",
    options: [
      { type: SUB, name: "stats", description: "Current and longest entry streak", usage: "/faith stats" },
      { type: SUB, name: "log", description: "Log a faith entry", usage: "/faith log type:bible title:Psalm 23",
        options: [
          { type: STR, name: "type", description: "Type (bible, prayer, church...) - defaults to bible", required: false },
          { type: STR, name: "title", description: "Title or reference (optional)", required: false },
        ] },
      { type: SUB, name: "undo", description: "Remove today's last faith entry", usage: "/faith undo" },
    ],
  },
  {
    name: "calendar",
    description: "Calendar - agenda, add and delete events",
    detail: "Your calendar. `agenda` (default) shows the next 7 days, `add` creates an event, `delete` removes one. Times are London time.",
    options: [
      { type: SUB, name: "agenda", description: "Events in the next 7 days", usage: "/calendar agenda" },
      { type: SUB, name: "add", description: "Add an event", usage: "/calendar add title:Dentist when:2026-07-20 14:00",
        options: [
          { type: STR, name: "title", description: "Event title", required: true },
          { type: STR, name: "when", description: "When, YYYY-MM-DD HH:MM (London time)", required: true },
        ] },
      { type: SUB, name: "delete", description: "Delete an event", usage: "/calendar delete name:Dentist",
        options: [{ type: STR, name: "name", description: "Event title (partial match)", required: true }] },
    ],
  },
  {
    name: "contact",
    description: "Contacts - add, log contact, find, delete, follow-ups",
    detail: "Your contacts. `list` (default) shows who is due a follow-up, `add` adds one, `logged` records that you reached out today, `find` looks one up, `delete` removes it.",
    options: [
      { type: SUB, name: "list", description: "Who is due a follow-up", usage: "/contact list" },
      { type: SUB, name: "add", description: "Add a contact", usage: "/contact add name:Jane Doe company:Google",
        options: [
          { type: STR, name: "name", description: "Contact name", required: true },
          { type: STR, name: "company", description: "Company (optional)", required: false },
        ] },
      { type: SUB, name: "logged", description: "Record that you contacted them today", usage: "/contact logged name:Jane",
        options: [{ type: STR, name: "name", description: "Contact name (partial match)", required: true }] },
      { type: SUB, name: "find", description: "Look up a contact", usage: "/contact find name:Jane",
        options: [{ type: STR, name: "name", description: "Contact name (partial match)", required: true }] },
      { type: SUB, name: "delete", description: "Delete a contact", usage: "/contact delete name:Jane",
        options: [{ type: STR, name: "name", description: "Contact name (partial match)", required: true }] },
    ],
  },
  {
    name: "reminder",
    description: "Reminders - add, complete, delete, list",
    detail: "One-off reminders that ping Discord. `list` (default) shows upcoming, `add` sets one (fires a day before by default), `done` and `delete` clear it. Times are London time.",
    options: [
      { type: SUB, name: "list", description: "Upcoming reminders", usage: "/reminder list" },
      { type: SUB, name: "add", description: "Add a reminder", usage: "/reminder add title:Call the bank when:2026-07-20 14:00",
        options: [
          { type: STR, name: "title", description: "What to be reminded of", required: true },
          { type: STR, name: "when", description: "When, YYYY-MM-DD HH:MM (London time)", required: true },
        ] },
      { type: SUB, name: "done", description: "Mark a reminder done", usage: "/reminder done name:bank",
        options: [{ type: STR, name: "name", description: "Reminder title (partial match)", required: true }] },
      { type: SUB, name: "delete", description: "Delete a reminder", usage: "/reminder delete name:bank",
        options: [{ type: STR, name: "name", description: "Reminder title (partial match)", required: true }] },
    ],
  },
  { name: "vault", description: "Keys, cards and documents expiring soon", usage: "/vault", detail: "Vault and inventory items inside their expiry warning window." },
  { name: "coding", description: "Coding hours today and this week", usage: "/coding", detail: "WakaTime hours for today and the last 7 days." },
  {
    name: "health",
    description: "Health - meals, medication, workouts and fitness",
    detail: "Everything health. `meal` logs nutrition, `med` marks doses taken, `workout` logs a session, `fitness` shows Strava recent and all-time stats.",
    options: [
      { type: GRP, name: "meal", description: "Nutrition",
        options: [
          { type: SUB, name: "log", description: "Log a meal", usage: "/health meal log calories:600 name:Chicken rice protein:40",
            options: [
              { type: INT, name: "calories", description: "Calories", required: true },
              { type: STR, name: "name", description: "What you ate", required: false },
              { type: INT, name: "protein", description: "Protein in grams (optional)", required: false },
            ] },
          { type: SUB, name: "undo", description: "Remove today's last meal", usage: "/health meal undo" },
        ] },
      { type: GRP, name: "med", description: "Medication doses",
        options: [
          { type: SUB, name: "due", description: "Today's doses and what's taken", usage: "/health med due" },
          { type: SUB, name: "taken", description: "Mark a dose taken", usage: "/health med taken name:Eye drops",
            options: [{ type: STR, name: "name", description: "Medication name (optional, else the latest pending)", required: false }] },
          { type: SUB, name: "undo", description: "Unmark the last dose taken", usage: "/health med undo" },
        ] },
      { type: GRP, name: "workout", description: "Workouts",
        options: [
          { type: SUB, name: "log", description: "Log a workout", usage: "/health workout log type:Run minutes:40",
            options: [
              { type: STR, name: "type", description: "Workout type", required: true },
              { type: INT, name: "minutes", description: "Duration in minutes", required: true },
            ] },
          { type: SUB, name: "undo", description: "Remove today's last workout", usage: "/health workout undo" },
        ] },
      { type: GRP, name: "fitness", description: "Strava fitness",
        options: [
          { type: SUB, name: "recent", description: "Recent workouts (last two weeks)", usage: "/health fitness recent" },
          { type: SUB, name: "stats", description: "All-time distance, hours and sports", usage: "/health fitness stats" },
        ] },
    ],
  },
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
    name: "wishlist",
    description: "Wishlist - add, remove, list",
    detail: "Things you want. `add` adds an item, `remove` deletes one, `list` (default) shows the wishlist.",
    options: [
      { type: SUB, name: "list", description: "Show the wishlist", usage: "/wishlist list" },
      { type: SUB, name: "add", description: "Add a wishlist item", usage: "/wishlist add item:Mechanical keyboard category:Tech",
        options: [
          { type: STR, name: "item", description: "Item name", required: true },
          { type: STR, name: "category", description: "Category (optional)", required: false },
        ] },
      { type: SUB, name: "remove", description: "Remove a wishlist item", usage: "/wishlist remove name:keyboard",
        options: [{ type: STR, name: "name", description: "Item name (partial match)", required: true }] },
    ],
  },
  {
    name: "inventory",
    description: "Inventory - add, remove, find, counts",
    detail: "Stuff you own. `add` adds an item, `remove` deletes one, `find` searches, `list` (default) shows counts by category.",
    options: [
      { type: SUB, name: "list", description: "Item counts by category", usage: "/inventory list" },
      { type: SUB, name: "add", description: "Add an inventory item", usage: "/inventory add item:Raspberry Pi 5 category:Tech",
        options: [
          { type: STR, name: "item", description: "Item name", required: true },
          { type: STR, name: "category", description: "Category (optional)", required: false },
        ] },
      { type: SUB, name: "find", description: "Search inventory", usage: "/inventory find name:cable",
        options: [{ type: STR, name: "name", description: "Item name (partial match)", required: true }] },
      { type: SUB, name: "remove", description: "Remove an inventory item", usage: "/inventory remove name:Pi",
        options: [{ type: STR, name: "name", description: "Item name (partial match)", required: true }] },
    ],
  },
  {
    name: "note",
    description: "Notes - add, delete, recent",
    detail: "Quick notes. `add` captures a note (optionally in a folder), `delete` removes one, `recent` (default) lists the latest.",
    options: [
      { type: SUB, name: "recent", description: "Most recent notes", usage: "/note recent" },
      { type: SUB, name: "add", description: "Capture a note", usage: "/note add text:Remember to… folder:Ideas",
        options: [
          { type: STR, name: "text", description: "Note text", required: true },
          { type: STR, name: "folder", description: "Folder (optional, defaults to General)", required: false },
        ] },
      { type: SUB, name: "delete", description: "Delete a note", usage: "/note delete name:groceries",
        options: [{ type: STR, name: "name", description: "Note title (partial match)", required: true }] },
    ],
  },
  {
    name: "diary",
    description: "Diary - add an entry, count",
    detail: "Private diary. `add` saves an entry with an optional mood, `count` (default) shows how many entries you have.",
    options: [
      { type: SUB, name: "count", description: "How many diary entries", usage: "/diary count" },
      { type: SUB, name: "add", description: "Save a diary entry", usage: "/diary add text:Today I… mood:happy",
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
