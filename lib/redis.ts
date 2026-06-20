// Single shared Upstash Redis client. Every live-status getter and route imports this
// instead of constructing its own client, so there is one place that handles the
// "env vars missing" case (returns null -> callers fall back gracefully). The REST
// client is Edge-runtime safe, so this is usable from both Node routes and the Edge SSE.
import { Redis } from "@upstash/redis"

export const redis =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      })
    : null
