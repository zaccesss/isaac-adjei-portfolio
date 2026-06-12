# workers/

Cloudflare Workers deployed at the edge. Each worker has its own directory with a Wrangler config.

## Workers

| Directory | Description |
| --- | --- |
| `ps5-presence/` | Polls the PSN API every 2 minutes for online status and current game. Writes result to Upstash Redis. The `/api/ps5` Next.js route reads from Redis and serves the data to the homepage status card. |

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
