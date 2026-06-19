# Thoughts and Future Ideas

A personal scratchpad for things I want to build, explore or revisit. Written as a reminder to myself.

---

## Public stats page (/stats)

I decided not to build a dedicated /stats page right now. The lab already has GitHub stats and the WakaTime coding dashboard, and a stats page works best when there is an audience to appreciate it. When real people are reading my blog posts, finding me through search or following my newsletter, a /stats page becomes something worth pointing at. Until then it would just be a vanity page talking to nobody.

When traffic grows and people start discovering the site, I want to revisit this. The data is already there - WakaTime coding hours, blog read events, GitHub contributions, newsletter subscribers. The aggregation layer exists. It would be fast to wire up a public /stats page at that point. Keep it simple: total coding time, current streak, most read posts, GitHub commits, newsletter subs, and maybe a "now playing" moment. No personal data, only aggregate counts.

Think about whether to move GitHub stats off the lab page onto /stats at that point, or keep both.

---

## Terminal email gate (the unlock idea)

I thought about gating the lab terminal so visitors have to type their email to get a code before they can use it. The friction kills the magic though - the terminal's whole appeal is that you just start typing and things happen. Nobody wants to verify their email to play with a command line.

Better version: an `unlock` command that is entirely opt-in. You type `unlock`, the terminal asks for your email, you get a welcome email, and a hidden `secret` command unlocks. You capture the email voluntarily, they feel clever for finding it. No hard gate, no friction, just a fun discovery moment. This would work well once the site has more traffic and people are actually browsing the lab.

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

_Last updated: June 2026_
