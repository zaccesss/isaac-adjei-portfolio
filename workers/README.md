# workers/

Cloudflare Workers deployed at the edge. Each worker has its own directory with a Wrangler config.

## Workers

| Directory | Description |
| --- | --- |
| `ps5-presence/` | Polls the PSN API every 2 minutes for online status and current game. Writes to three Upstash Redis keys: `ps5:status` (120s TTL), `ps5:last-known` (no TTL, updated when online) and `ps5:last-game` (no TTL, updated only when a game is actively running so the last played title is preserved when offline). The `/api/ps5` Next.js route reads from Redis and serves the data to the homepage status card. |

## Deployment

```bash
cd workers/ps5-presence
wrangler deploy
```

Required secrets (set via `wrangler secret put <NAME>`):

| Secret | Description |
| --- | --- |
| `PSN_NPSSO` | PSN NPSSO cookie value from PlayStation Network |
| `UPSTASH_REDIS_REST_URL` | Upstash Redis endpoint |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash Redis token |
