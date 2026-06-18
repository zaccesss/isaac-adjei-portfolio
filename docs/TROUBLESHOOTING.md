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

**Cause:** IGDB or Steam env vars are not set in NSSM, or the KNOWN_GAMES dict does not include the game's process name.

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

**Cause:** CSS `transition-transform` on any element with `hover:scale` creates a GPU compositing layer on iOS WebKit even if hover never fires. With 50+ skill tiles and project cards loaded simultaneously, this exhausts WebKit's GPU memory budget and kills the renderer process.

**Fix:** Scope all hover transform utilities to `sm:` breakpoint (`sm:transition-transform sm:hover:scale-*`). Touch devices never fire hover events so no GPU layers are created. Fixed in PR #336.

---

## PS5 "last played" game shows wrong title or clears when PS5 is offline

**Cause:** The `ps5:last-known` key was written whenever the PS5 was online, including when sitting on the home screen with `game: null`. This overwrote the previously played game title.

**Fix:** A separate `ps5:last-game` Redis key now only writes when `presence.game` is truthy. The API route reads from this key for the "last played" display. Fixed in PR #336.

---

## Newsletter page shows scheduled issues before their publish date

**Cause:** Beehiiv marks scheduled posts as `confirmed` status but with a future `publish_date` Unix timestamp. The API route was not filtering on this field.

**Fix:** Added a `nowUnix = Math.floor(Date.now() / 1000)` filter in the newsletter issues route. Posts with `publish_date > nowUnix` are excluded. Fixed in PR #335.

---

## Vault expiry check fails - Cloudflare blocks the request

**Cause:** The vault expiry workflow used `curl` to call the Vercel endpoint. Cloudflare's bot protection blocked the request.

**Fix:** Replaced with a Node.js script that calls Supabase directly using the service role key. No `CRON_SECRET` or Vercel URL needed. Updated in PRs #294 and #296.
