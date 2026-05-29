---
name: suggestions
description: "Deferred feature ideas - not yet implemented"
metadata:
  type: project
  updated: 2026-05-29
---

# Future Features

## When Back at Uni (Requires GPC Access)

**Gaming PC Game Cover Art — READY, IGDB integrated, restart daemon + set env vars**

`scripts/gpc-daemon.py` now fetches cover art from IGDB (Twitch API) on first detection of each game and caches the result in memory. Falls back to hardcoded publisher CDN URLs if IGDB credentials are not set.

**To activate on the Windows GPC:**
1. Set two new env vars alongside the existing Upstash ones (NSSM environment or Windows system env):
   - `IGDB_CLIENT_ID` — from dev.twitch.tv/console (free Twitch developer app)
   - `IGDB_CLIENT_SECRET` — from the same Twitch app
2. `nssm restart gpc-daemon`

To create the Twitch app: dev.twitch.tv/console → Register Your Application → Category: Application Integration → Redirect URL: http://localhost → Create → copy Client ID and generate Secret.

To add more games: add the exe name to `KNOWN_GAMES` in `scripts/gpc-daemon.py`. IGDB fetches art automatically. Add to `IGDB_NAME_MAP` only if the IGDB title differs from your short name (e.g. "GTA V" → "Grand Theft Auto V").

---

## Deferred - Implement Next Session

**CV Automation - Auto PDF Generation**
Replace the manual print-to-PDF step in generate-role-cvs.js with automatic Puppeteer PDF generation triggered on CV changes. Already scaffolded in the script - just needs the trigger and output pipeline wired up.

**CV Automation - LinkedIn Sync**
Auto-update LinkedIn profile fields via the LinkedIn API when the main CV is regenerated. Profile, skills and experience sections are the obvious targets. Requires LinkedIn developer app setup and OAuth flow.

---

## Mindblowing Ideas - For Later

**Vault Expiry Intelligence**
The vault already stores document and warranty expiry dates in a machine-parseable format. Build a daily cron that checks upcoming expiries and sends a Discord embed alert X days before - configurable per document type (30 days for warranties, 90 days for passports etc.).

**Live Coding Heatmap**
VS Code sends Discord Rich Presence with the current file and workspace. Persist that data over time in Supabase and build a heatmap on the dashboard showing which files, languages and projects you have spent time in - like a GitHub contribution graph but for actual coding sessions.

**AI CV Tailoring**
Feed a job description into the dashboard and have Claude rewrite the profile section of the role-specific CV to match the language and priorities of that specific posting. Output a one-click download. The role configs already exist - this just adds an LLM pass on top.

**Automated Weekly Digest**
Every Monday morning, a cron pulls the previous week's application activity, new jobs scraped, GitHub commits, blog posts published and Discord presence data. Claude writes a one-paragraph personal summary. It posts to Discord and optionally to the newsletter.

**Smart Job Matching Score**
For each scraped job, run a quick embedding similarity check against the current CVs using OpenAI or Claude embeddings. Score each role 0-100 for fit. Surface the highest-scoring roles first in the dashboard. Turns the job board into a ranked feed.

**Blog Post Reading Analytics**
Track which blog posts get read to completion vs abandoned halfway. Use scroll depth events on the frontend. Store in Supabase. Build a reading funnel on the dashboard so you know which posts hold attention and which lose it - and write more of the former.
