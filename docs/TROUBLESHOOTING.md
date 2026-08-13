# Troubleshooting

Common problems specific to this site and how to fix them.

---

## PS5 card shows "online now" when PS5 is off

**Cause:** The NPSSO session cookie has expired. The Worker falls back to stale auth and either errors silently or returns cached data.

**Fix:** Get a fresh NPSSO from playstation.com (sign in, open DevTools, Application > Cookies > `npsso`), then run:

```powershell
echo "your-64-char-npsso" | npx wrangler@3 secret put PSN_NPSSO
```

The Worker picks up the new secret on the next cron tick.

---

## PS5 "last played" not showing when offline

**Cause:** The `ps5:last-known` Redis key is missing. This key is only written when the PS5 goes online at least once after the Worker was deployed with the lastKnown fix.

**Fix:** Switch the PS5 on briefly. The Worker will write `ps5:last-known` on the next cron tick. After that, last played persists when offline.

---

## GPC game not detected

**Cause:** IGDB or Steam env vars are not set in NSSM or the KNOWN_GAMES dict does not include the game's process name.

**Fix:**

1. Check env vars: `nssm get gpc-daemon AppEnvironmentExtra`
2. If IGDB_CLIENT_ID, IGDB_CLIENT_SECRET, STEAM_API_KEY or STEAM_ID are missing, set them all in one call:

```powershell
nssm set gpc-daemon AppEnvironmentExtra UPSTASH_REDIS_REST_URL=... UPSTASH_REDIS_REST_TOKEN=... IGDB_CLIENT_ID=... IGDB_CLIENT_SECRET=... STEAM_API_KEY=... STEAM_ID=76561198xxxxxxxxx
nssm restart gpc-daemon
```

3. If the game is not on Steam or Epic, add its exe name to `KNOWN_GAMES` in `scripts/gpc-daemon.py`.

---

## feed.xml?raw returns Cloudflare 1101 CPU timeout

**Cause:** The old `buildRawHtml()` function ran six chained regex transforms over the full XML string and exceeded Cloudflare's CPU limit. This was fixed in v2.7.0 - the `?raw` route now returns raw XML directly.

**Fix:** Force-redeploy the Cloudflare Worker or hard-refresh the page. If on the old Worker version, deploy the updated `workers/ps5-presence` with `npx wrangler@3 deploy`. The Next.js route fix requires a Vercel redeploy (push to main).

---

## Discord card not visible

**Cause:** Expected behaviour. The Discord card is conditional - it only appears on /notes when you are online, idle or dnd. On /now it always appears but shows "last seen Xm ago" at reduced opacity when offline.

**Fix:** No fix needed. Sign in to Discord or check /now instead of /notes.

---

## Gitleaks blocks a commit

**Cause:** The diff contains a string that matches a secret pattern (token, key, password).

**Fix:** Check the diff carefully. If the value is genuinely public or a placeholder, add a `// gitleaks:allow` comment on the same line. If it is a real secret, remove it from the diff and add it to `.gitignore` or use environment variables.

---

## Build fails with OpenNext import error

**Cause:** `import('@opennextjs/cloudflare')` in `next.config.mjs` runs at build time on Vercel. The Cloudflare adapter is only needed for the Worker build.

**Fix:** Guard the import with an `isDev` or `isWorker` check so it only runs when building the Worker. The fix is already in place as of v2.5.0 - if this appears again, check that `next.config.mjs` has not been reverted.

---

## Supabase auth loop on dashboard login

**Cause:** The newer `sb_publishable_` format ANON key does not work with the current Supabase client setup.

**Fix:** Use the legacy `eyJ...` JWT format anon key. Get it from Supabase dashboard > Project Settings > API > Project API keys > `anon` (legacy).

---

## Mobile Safari shows black screen ("A problem repeatedly occurred")

**Cause (partial, PR #336):** CSS `transition-transform` on any element with `hover:scale` creates a GPU compositing layer on iOS WebKit even if hover never fires. Fixed by scoping hover transform utilities to `sm:` breakpoint.

**Cause (partial, PR #346):** Header's `backdrop-blur` + `transition-all` recomposited an expensive GPU layer on every scroll frame. Fixed by scoping the blur to `sm:` and up and narrowing the transition to `transition-colors`.

**Actual root cause (PR #349):** Neither fix above stopped the crash - confirmed in a clean private-mode test and on three separate physical phones. `public/images/projects/git-unlocked/github-logo-3d.webp` was 14467x9744px (140 megapixels), an unprocessed 3D render export. Vercel's image optimizer silently falls back to serving the original file untouched when it fails to resize a source image at this scale, regardless of the requested width - decoded in browser memory that's ~537MB for a single thumbnail, enough to crash any mobile browser instantly. Confirmed by requesting `/_next/image?...&w=750` directly and getting back the full 14467x9744 original.

**Fix:** Downscale the source image (here: to 1600x1077 via `cwebp`). Run `npm run check-image-sizes` before committing new images - CI now fails the build if anything in `public/images` exceeds 50 megapixels (`scripts/check-image-sizes.ts`).

---

## PS5 "last played" game shows wrong title, clears when PS5 is offline or never shows at all

**Cause (PR #336):** The `ps5:last-known` key was written whenever the PS5 was online, including when sitting on the home screen with `game: null`. This overwrote the previously played game title. Fixed with a separate `ps5:last-game` Redis key that only writes when `presence.game` is truthy.

**Cause (found 2026-06-18, three weeks later):** The PR #336 fix above was correct but never actually went live - the `ps5-presence` Cloudflare Worker's last deployment was 2026-05-29, before that fix was written. Source code and deployed code had silently diverged with no CI step to catch it.

**Fix:** Deploy with `npx wrangler deploy --config ./wrangler.toml` from `workers/ps5-presence/` (the explicit `--config` flag matters - the bundled wrangler v3 resolves the wrong project without it, since this repo also has a root-level `wrangler.jsonc` for the main site's Cloudflare deployment). `deploy-ps5-presence.yml` now auto-deploys on every push touching `workers/ps5-presence/**` so this can't go stale again.

---

## PS5 card shows "last seen Xm ago" while actively online

**Cause:** `relativeLastSeen()`'s "online now" threshold was 1 minute, but the PS5 worker's cron only updates its timestamp every 2 minutes - so for roughly half of any 2-minute window it showed stale-looking text despite being online. Mac/Lenovo/the gaming PC daemons write every 30s, so the 1 minute default was fine for them but not for PS5.

**Fix:** Added a per-call `onlineThresholdMins` parameter to `relativeLastSeen()` in `LiveStatusCards.tsx`; the PS5 call site passes 3 minutes, everything else keeps the 1 minute default.

---

## PRs stuck "behind" main, needing manual approval to run CI

**Cause:** The branch ruleset had `strict_required_status_checks_policy` enabled, requiring every open PR to be up to date with main before merging. With multiple PRs open at once, each merge knocked the others "behind"; a maintenance workflow pushed an `update-branch` commit authored by `github-actions[bot]` to fix that and GitHub held the resulting CI run for manual approval because it was triggered by a bot-authored push rather than a human.

**Fix:** Removed `strict_required_status_checks_policy` from the main branch ruleset (via `gh api -X PUT repos/{owner}/{repo}/rulesets/{id}`). Each PR now merges as soon as its own checks pass, independent of what else merges around it.

---

## Newsletter page shows scheduled issues before their publish date

**Cause:** Beehiiv marks scheduled posts as `confirmed` status but with a future `publish_date` Unix timestamp. The API route was not filtering on this field.

**Fix:** Added a `nowUnix = Math.floor(Date.now() / 1000)` filter in the newsletter issues route. Posts with `publish_date > nowUnix` are excluded. Fixed in PR #335.

---

## Vault expiry check fails - Cloudflare blocks the request

**Cause:** The vault expiry workflow used `curl` to call the Vercel endpoint. Cloudflare's bot protection blocked the request.

**Fix:** Replaced with a Node.js script that calls Supabase directly using the service role key. No `CRON_SECRET` or Vercel URL needed. Updated in PRs #294 and #296.
