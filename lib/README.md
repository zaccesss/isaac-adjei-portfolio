# lib/

Shared server and client utilities. Imported across `app/`, `components/` and `scripts/` as needed.

## Files

| File | Description |
| --- | --- |
| `supabase.ts` | Supabase client with safe placeholder fallbacks so the build never fails without env vars |
| `utils.ts` | `cn()` class-name helper (clsx + tailwind-merge) and other shared utilities |
| `constants.ts` | Site URL, navigation items and other shared constants |
| `animations.ts` | Framer Motion animation variants reused across page and section components |
| `pin.ts` | Dashboard PIN lock - stores and validates a hashed PIN in a cookie |
| `vault-expiry-check.ts` | Logic to query vault items nearing or past expiry; called by the vault-expiry-check workflow |
| `send-discord-digest.ts` | Sends a formatted embed to a Discord webhook channel |
| `search.ts` | `fieldScore()` and `relevanceScore()` helpers for the `/search` page |
| `tags.ts` | `normTag()` tag normaliser and `consumedSlug()` slug helper for `/tags` routes |
| `send-weekly-digest.ts` | Builds and sends the weekly summary email via Sendgrid |
