---
name: suggestions
description: "Deferred feature ideas - not yet implemented"
metadata:
  type: project
  updated: 2026-05-29
---

# Future Features

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

## Deferred - Implement Next Session

**Discussions page**
A page where visitors can leave comments or reactions on blog posts and projects. Two approaches:

- giscus: uses GitHub Discussions as the backend, free, no database needed, maps each post to a Discussion thread by URL. Add `<Giscus>` component to blog post and project pages.
- Supabase-backed comments: full control over moderation and schema. Requires an auth strategy for commenters.

giscus is the lower-effort path and keeps everything in GitHub. Either approach lets people interact without a dedicated account system.

**CV Automation - LinkedIn Sync**
Auto-update LinkedIn profile fields via the LinkedIn API when the main CV is regenerated. Profile, skills and experience sections are the obvious targets. Requires LinkedIn developer app setup and OAuth flow.

---

## Mindblowing Ideas - For Later

**AI CV Tailoring**
Feed a job description into the dashboard and have Claude rewrite the profile section of the role-specific CV to match the language and priorities of that specific posting. Output a one-click download. The role configs already exist - this just adds an LLM pass on top.

**Automated Weekly Digest**
Every Monday morning, a cron pulls the previous week's application activity, new jobs scraped, GitHub commits, blog posts published and Discord presence data. Claude writes a one-paragraph personal summary. It posts to Discord and optionally to the newsletter.

**Smart Job Matching Score**
For each scraped job, run a quick embedding similarity check against the current CVs using OpenAI or Claude embeddings. Score each role 0-100 for fit. Surface the highest-scoring roles first in the dashboard. Turns the job board into a ranked feed.
