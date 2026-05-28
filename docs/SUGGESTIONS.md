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

### CV editor

Protected route at `app/dashboard/(protected)/cv-editor/page.tsx`. Parses cv.yml sections into editable fields. On save, writes back to cv.yml or a Supabase JSON column and triggers PDF regeneration.

---

### Application analytics

A funnel chart below the Kanban board showing conversion rates: Applied -> OA -> Interview -> Offer. Would make the pipeline data visually scannable at a glance. Could use Recharts (already in the project) with a simple bar or funnel layout.

---

### Inventory pagination

Category pages load all items with no pagination. Add `LIMIT 50 OFFSET n` on the Supabase query and simple prev/next controls before the list grows past 50 items.

---

## Job scraper - further improvements

- **Reed.co.uk** - large UK job board with internship filter
- **Milkround** - UK graduate aggregator
- **Prospects.ac.uk** - official UK graduate careers site
- **Email alerts** - when scraper finds new listings matching Isaac's skills, send a Resend summary rather than waiting for the weekly digest
- **Discord webhook** - post new scraper listings to a private Discord channel as they arrive, so alerts appear on phone without waiting for the weekly email

---

## Live status widget

### Lanyard - Discord status card

Lanyard is a free service that reads your Discord Rich Presence and exposes it via a public API at `api.lanyard.rest/v1/users/{discord_id}`. It shows your online/idle/DND/offline status and any Rich Presence activity (e.g. "Coding in VS Code - editing mac-daemon.py - 2h 15m"). No daemon or bot needed - just join the Lanyard Discord server and your status becomes queryable.

Implementation: join discord.gg/lanyard, get your Discord user ID, add a `LanyardCard` to `components/shared/LiveStatusCards.tsx` that polls the REST or WebSocket endpoint. Only show when online or when activity is set - hide the card when offline to avoid clutter.

Decision: skipped for now as the site already has GitHub, Spotify, MacBook, PS5 and GPC cards. Worth adding if a future design refresh makes the widget feel less cluttered.

---

## Newsletter

### Beehiiv newsletter page - match site branding

The Beehiiv-hosted newsletter page uses Beehiiv's default branding, not the site's design. Update the Beehiiv publication settings to match isaacadjei.me: dark background, Geist font, same colour palette and header style. Beehiiv supports custom CSS and logo upload in publication settings.

---
