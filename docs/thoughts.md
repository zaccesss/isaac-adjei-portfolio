# Thoughts and Future Ideas

A personal scratchpad for things I want to build, explore or revisit. Written as a reminder to myself.

---

## Public stats page (/stats)

I decided not to build a dedicated /stats page right now. The lab already has GitHub stats and the WakaTime coding dashboard and a stats page works best when there is an audience to appreciate it. When real people are reading my blog posts, finding me through search or following my newsletter, a /stats page becomes something worth pointing at. Until then it would just be a vanity page talking to nobody.

When traffic grows and people start discovering the site, I want to revisit this. The data is already there - WakaTime coding hours, blog read events, GitHub contributions, newsletter subscribers. The aggregation layer exists. It would be fast to wire up a public /stats page at that point. Keep it simple: total coding time, current streak, most read posts, GitHub commits, newsletter subs and maybe a "now playing" moment. No personal data, only aggregate counts.

Think about whether to move GitHub stats off the lab page onto /stats at that point or keep both.

---

## Terminal email gate (the unlock idea)

I thought about gating the lab terminal so visitors have to type their email to get a code before they can use it. The friction kills the magic though - the terminal's whole appeal is that you just start typing and things happen. Nobody wants to verify their email to play with a command line.

Better version: an `unlock` command that is entirely opt-in. You type `unlock`, the terminal asks for your email, you get a welcome email and a hidden `secret` command unlocks. You capture the email voluntarily, they feel clever for finding it. No hard gate, no friction, just a fun discovery moment. This would work well once the site has more traffic and people are actually browsing the lab.

---

## Lab experiments (future additions)

The lab now has the terminal, GitHub stats, WakaTime coding dashboard, Spotify visualiser and the interactive PCB viewer. Future additions worth considering:

- A live worldtime panel showing time in Accra, London and wherever I am
- A "currently reading" widget pulling from a Notion database

The lab should feel like a workshop, not a dashboard. Each addition should earn its place.

---

## Internship journey public page (/internship-journey)

After landing an internship, a Settings toggle that publishes an anonymised stats page. Total applications, interview rate, offer rate, timeline, top sectors. All the data is already tracked. No company names exposed, just the numbers. This would be genuinely useful for other students going through the same process and would give the site a reason to be shared.

---

## AI-powered features (Groq, free tier)

Groq has a free tier with Llama 3.3 70B. Things worth trying:

- CV tailoring: paste a job description, get a rewritten profile section that matches the language. One-click PDF download.
- In-dashboard assistant: "summarise my week", "help draft this cover letter", "what should I focus on today?". Server-side only, nothing leaves the server.
- Auto-tag and summarise notes on save (on-demand, never automatic).
- Year-in-review generator: scheduled 31 Dec, pulls all activity data, generates a rich summary delivered to Discord and optionally published at /year/YYYY.

---

## Notes and writing

The notes section is functional but the editor is basic. Long term I want a proper TipTap editor with headers, code blocks, checklists, tables, image embeds and drag-and-drop ordering. The diary gets the same upgrade. This is a large piece of work so it lives in Phase 9 of the roadmap.

---

## Browser extension

A Chrome/Firefox extension that adds a "Save to dashboard" button on job posting pages (LinkedIn, Glassdoor, company sites). One click pre-fills company, role, URL and deadline. Bonus: detect "thank you for applying" pages and auto-update status to Applied. Separate repo, Manifest V3.

---

## Reminders (/dashboard/reminders) - shipped July 2026, Discord command still to come

Built as one combined page rather than separate appointment and meeting pages, so any one-off reminder fits: each entry is typed appointment, meeting or other and the type is just a field, so new kinds cost nothing. The medication reminder feature supplied the whole delivery spine (Discord webhook, Resend email, Twilio SMS, the 30-minute automations job pattern); this reuses it with a one-off event_at timestamp and one or more lead times per event (any of 1 hour up to 1 week before, ticked as a set) instead of recurring daily times. Each reminder can go to any of Discord, email and SMS, with its own email address and phone number. A sent_leads array plus a reminded_at stamp mean each lead fires exactly once and editing a reminder (including moving the date) resets both so the new schedule is honoured. The reminders table is migration 043; the page clones the medication CRUD (co-located actions.ts, same form and list, soonest first) and delivery is scripts/reminders.mjs plus reminders.yml in the automations repo, running every 30 minutes.

Still to do when the Phase 5 central bot lands - a #reminders-upcoming (or reuse #reminders) channel and a slash command group:

- `/reminder add [type] [title] [when] [where]` - add an appointment or meeting with natural date parsing
- `/reminder list` - show what is coming up
- `/reminder cancel [id]` - cancel one

The lead-time reminder posts to Discord and emails me, matching what the dashboard sends. SMS could be added later by lifting sendSms from medication-reminders.mjs unchanged.

---

## Discord central bot (Phase 5)

The vision is a single central bot that lives in a private Discord server and handles all personal OS automation from one place. If the dashboard is ever inaccessible, everything critical can still be done from Discord.

The bot is built in Python (discord.py or interactions.py for slash command support) and runs as a persistent process, likely on Railway or Fly.io (both have free tiers). All logic talks to the Supabase API and the dashboard's server actions via internal HTTP.

### Channels

Each channel has a single purpose and its own description. The list below is the target structure:

| Channel | Purpose | Bot/source |
| --- | --- | --- |
| #routine | Daily routine reminders and morning/evening send | Central bot |
| #bible-verse | Daily Bible verse at 06:00 | YouVersion official bot if reliable, otherwise central bot via bible-api.com |
| #streaks | Streak tracking, daily check-in buttons, mark-done commands | Central bot |
| #habits | Habit logging, check-in buttons | Central bot |
| #study | Study session logging, LeetCode nudges | Central bot |
| #health | Health and workout logging | Central bot |
| #jobs | Daily scraper summary, application deadline alerts | Central bot (automations repo) |
| #deadlines | University deadline alerts (pulled from uni_deadlines table) | Central bot |
| #reminders | General reminders (vault expiry, follow-ups, medication) | Central bot |
| #vault | Vault expiry alerts | Central bot |
| #library | Reading progress tracking | Central bot |

### Slash commands

The goal is full feature parity with the dashboard for common actions:

- `/habit done [name]` - mark a habit complete for today
- `/habit list` - show today's habit status
- `/streak log [name]` - log a streak check-in
- `/streak status` - show all streak states
- `/study log [subject] [minutes]` - log a study session
- `/diary new [text]` - create a diary entry
- `/goals list` - show active goals
- `/health log [type] [notes]` - log a health activity
- `/week` - show the current week summary (streaks, habits, study time, deadlines)

### Automated sends

- 06:00 UTC - Bible verse to #bible-verse
- 07:00 UTC - Morning routine checklist to #routine (with habit check-in buttons for #streaks)
- 09:00 UTC - Deadline alert to #deadlines if anything is due within 7 days
- 18:00 UTC - Evening streak check to #streaks
- 20:00 UTC - Study nudge to #study if no session logged today
- Daily - Scraper run summary to #jobs

### Third-party bots

Where a reliable, well-maintained third-party bot exists for a specific purpose, use it rather than reinventing it. YouVersion is the example for Bible verses. If they have a stable Discord bot that sends a verse each morning, use that for #bible-verse. The central bot focuses on things no third-party bot can do: habits, streaks, diary, study, vault, deadlines, all backed by personal Supabase data.

### Rules

All bot messages: UK English, no em dashes or en dashes (hyphens only), no Oxford commas. Embed colours and formatting match the dashboard palette. All automation code in Python. Infrastructure as code in the automations repo (`isaac-adjei-automations`).

---

## Free site-down alert to Linear (GitHub Action fallback)

Better Stack's outgoing incident webhook (site down -> /api/incident -> Linear) turned out to be a paid feature and a status page on a custom domain may be too. I am not paying for that. If I ever want site-down incidents mirrored into Linear without upgrading, I can add a free scheduled GitHub Action that curls https://isaacadjei.me/api/health every few minutes and, when it returns a non-200, POSTs to /api/incident?secret=... to open the Linear issue itself. Scheduled GitHub Actions are free, so this is the same outcome at zero cost. Better Stack's free email alert already covers telling me it is down, so this is a nice-to-have, not urgent. It would fit naturally in the automations repo once that exists.

---

_Last updated: July 2026_
