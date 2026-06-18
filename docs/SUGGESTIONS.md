---
name: suggestions
description: "Future feature ideas and enhancements — not yet implemented"
metadata:
  type: project
  updated: 2026-06-14
---

# Future Additions and Suggestions

## When Back at Uni (Requires GPC Access)

**Gaming PC Game Cover Art - READY, IGDB integrated, restart daemon + set env vars**

`scripts/gpc-daemon.py` now fetches cover art from IGDB (Twitch API) on first detection of each game and caches the result in memory. Falls back to hardcoded publisher CDN URLs if IGDB credentials are not set.

**To activate on the Windows GPC (run in admin PowerShell):**

Set all four env vars in ONE nssm call (two separate calls overwrite each other):
```powershell
nssm set gpc-daemon AppEnvironmentExtra UPSTASH_REDIS_REST_URL=https://your-db.upstash.io UPSTASH_REDIS_REST_TOKEN=your_token IGDB_CLIENT_ID=your_twitch_client_id IGDB_CLIENT_SECRET=your_twitch_client_secret STEAM_API_KEY=your_steam_api_key STEAM_ID=76561198xxxxxxxxx
nssm restart gpc-daemon
```
The `IGDB_CLIENT_ID` and `IGDB_CLIENT_SECRET` are the same Twitch app credentials already set as secrets in the PS5 Cloudflare Worker. Copy them from there.

To create the Twitch app: dev.twitch.tv/console → Register Your Application → Category: Application Integration → Redirect URL: http://localhost → Create → copy Client ID and generate Secret.

To get a Steam API key: steamcommunity.com/dev/apikey - set domain to "localhost" for personal use.
Steam ID: find yours at steamcommunity.com/id/[your-username] then convert via steamid.io.

To add more games: add the exe name to `KNOWN_GAMES` in `scripts/gpc-daemon.py`. IGDB fetches art automatically. Add to `IGDB_NAME_MAP` only if the IGDB title differs from your short name (e.g. "GTA V" → "Grand Theft Auto V").

---

## Dashboard Enhancements

**Application timeline / deadline view**
Gantt-style calendar for the applications page showing deadlines, opening dates and applied dates on a horizontal timeline. Particularly useful in Sep-Dec peak cycle when 20+ deadlines land in the same month. Built entirely from existing `applications` table data.

**Interview prep tracker**
Per-application interview notes and question banks. When an application moves to "Telephone Interview" or beyond, a prep section unlocks: add questions asked, model answers, feedback notes. Export as PDF before the next round.

**Salary and offer comparison**
When status = "Offer Received", unlock a salary card: base, bonus, benefits, location cost-of-living adjustment. Side-by-side comparison view when multiple offers exist. Entirely in the existing applications table (add salary columns or use the notes field).

**Delete and edit individual scraped jobs from the jobs browser**
The settings page can clear all jobs but there is no way to delete or edit a single row from the scraped jobs list in the UI. Add a jobs browser page (or tab in Applications) that shows scraped jobs with per-row delete and edit.

**Reading tracker (Notion)**
Connect to a Notion database with columns: Title, Author, Status (Reading / Want to Read / Finished), Cover URL, Rating, Notes. Show a "Currently Reading" widget on the dashboard home and a full reading list page with filters. The Notion API key already has a slot in `.env.example`.

**Contacts follow-up automation**
Extend the contacts page: when `last_contact` is older than 30 days, include the contact in the daily Discord coding summary as a "follow-up reminder" item. Zero new infrastructure needed - just amend `scripts/daily-coding-summary.ts`.

**Dashboard home: more summary widgets**
The home page currently shows 4-5 stat cards. Add: upcoming application deadlines (within 7 days), contacts needing follow-up count, streak summary (longest current streak) and a "last login" timestamp from the activity log.

**Login event tracking**
The activity log does not record sign-ins. Add a `logActivity("auth.login")` call in the NextAuth `signIn` callback in `auth.ts` so the activity log shows when sessions start.

---

## Mindblowing Ideas

**AI CV Tailoring**
Feed a job description into the dashboard and have Claude rewrite the profile section of the role-specific CV to match the language and priorities of that specific posting. Output a one-click download. The role configs already exist — this just adds an LLM pass on top. Could also score how well your CV matches the JD before and after.

**Smart Job Matching Score**
For each scraped job, run a quick embedding similarity check against the current CVs. Score each role 0-100 for fit. Surface the highest-scoring roles first in the dashboard. Turns the job board into a ranked personalised feed instead of a raw list of 500 roles.

**Browser extension: one-click job save**
A Chrome/Firefox extension that adds a "Save to dashboard" button on any job posting page (LinkedIn, Glassdoor, company career sites). One click pre-fills the application form with company, role, URL and deadline extracted from the page. No manual data entry. Difficulty: medium (~1-2 days). Requires Manifest V3, content script, popup UI and a dedicated extension API key.

**Post-internship advisor mode**
After landing an internship, flip a switch that publishes anonymised stats (application count, interview rate, offer rate, timeline) as a public page at `isaacadjei.me/internship-journey`. Lets you advise others without exposing which specific companies rejected you. The data is already tracked — just needs a public-facing view.

**CV Automation - LinkedIn Sync**
Auto-update LinkedIn profile fields via the LinkedIn API when the main CV is regenerated. Profile, skills and experience sections are the obvious targets. Requires LinkedIn developer app setup and OAuth flow. Difficult to implement — LinkedIn's API is heavily restricted for personal use.

**Automated Weekly Digest**
Already partially built (weekly digest email exists). Extend it: every Monday morning pull the previous week's application activity, new jobs scraped, coding hours and blog posts published. Claude writes a one-paragraph personal summary included in the digest.

**Public stats page**
A public page at `isaacadjei.me/stats` showing anonymised portfolio stats: total blog posts, total projects, total coding hours this year, streak count. Updated from live data. No sensitive information — just the numbers that make the portfolio feel alive to visitors.
