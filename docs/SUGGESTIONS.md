---
name: suggestions
description: "Deferred feature ideas - not yet implemented"
metadata:
  type: project
  updated: 2026-05-28
---

# Future Features

Ideas raised during sessions but not yet planned or implemented.

---

## Dashboard

### Application analytics

A funnel chart below the Kanban board showing conversion rates: Applied -> OA -> Interview -> Offer. Would make the pipeline data visually scannable at a glance. Could use Recharts (already in the project) with a simple bar or funnel layout.

---

### Inventory pagination

Category pages load all items with no pagination. Add `LIMIT 50 OFFSET n` on the Supabase query and simple prev/next controls before the list grows past 50 items.

---

## Job scraper - further improvements

- **Reed.co.uk** - added (requires `REED_API_KEY` secret in GitHub Actions - register free at reed.co.uk/developers/jobseeker)
- **Milkround** - done
- **Prospects.ac.uk** - done
- **Email alerts** - weekly Sunday digest already handles this (Resend)
- **Discord webhook** - done (set `DISCORD_WEBHOOK_URL` GitHub Actions secret)

---

## Live status widget

### Lanyard - Discord status card

Lanyard is a free service that reads your Discord Rich Presence and exposes it via a public API at `api.lanyard.rest/v1/users/{discord_id}`. It shows your online/idle/DND/offline status and any Rich Presence activity (e.g. "Coding in VS Code - editing mac-daemon.py - 2h 15m"). No daemon or bot needed - just join the Lanyard Discord server and your status becomes queryable.

Implementation: join discord.gg/lanyard, get your Discord user ID, add a `LanyardCard` to `components/shared/LiveStatusCards.tsx` that polls the REST or WebSocket endpoint. Only show when online or when activity is set - hide the card when offline to avoid clutter.

Decision: skipped for now as the site already has GitHub, Spotify, MacBook, PS5 and GPC cards. Worth adding if a future design refresh makes the widget feel less cluttered.

---

## Newsletter

### Beehiiv newsletter page - match site branding

**To do in the Beehiiv web UI (no code needed):**

1. Go to app.beehiiv.com -> Settings -> Design
2. Upload the site logo (dark version)
3. Set background: `#09090b` (zinc-950)
4. Set text: `#fafafa`, accent: `#3b82f6` (blue-500)
5. Set font to Geist or Inter (Geist not available in Beehiiv - use Inter as closest match)
6. Add custom CSS if needed: target `.bn-page` for background and `.bn-header` for logo area

---
