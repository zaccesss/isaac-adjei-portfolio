// Maintenance mode: a flag + custom message I flip from Settings to show the public a maintenance page
// while I work. The state lives in the `config` table (source of truth for the message and the toggle UI),
// and the on/off flag is mirrored to Redis so the edge middleware can read it cheaply without a DB round
// trip. When I enable it I also purge the Cloudflare cache so it takes effect immediately rather than
// waiting for cached pages to expire. I (logged in) always bypass it - only the public sees the page.
import { supabase } from "@/lib/supabase"
import { redis } from "@/lib/redis"

const KEY = "maintenance"

export type MaintenanceState = { enabled: boolean; message: string }

export async function getMaintenance(): Promise<MaintenanceState> {
  const { data } = await supabase.from("config").select("value").eq("key", KEY).single()
  const v = (data?.value ?? {}) as Partial<MaintenanceState>
  return { enabled: Boolean(v.enabled), message: typeof v.message === "string" ? v.message : "" }
}

export async function setMaintenance(state: MaintenanceState): Promise<void> {
  await supabase
    .from("config")
    .upsert({ key: KEY, value: state, updated_at: new Date().toISOString() }, { onConflict: "key" })
  // Mirror the flag to Redis for the edge middleware. Never throw if Redis is unavailable.
  try { await redis?.set(KEY, state.enabled ? "1" : "0") } catch {}
  // Purge on every toggle so turning maintenance on AND off both take effect immediately - off restores
  // the real pages at once instead of serving a cached maintenance page until the cache expires.
  await purgeCloudflareCache()
}

// Purge the Cloudflare cache so freshly-enabled maintenance is instant. No-op (and never throws) if the
// Cloudflare token is unset, in which case maintenance still works app-level for uncached requests.
async function purgeCloudflareCache(): Promise<void> {
  const zone = process.env.CLOUDFLARE_ZONE_ID
  const token = process.env.CLOUDFLARE_PURGE_TOKEN
  if (!zone || !token) return
  try {
    await fetch(`https://api.cloudflare.com/client/v4/zones/${zone}/purge_cache`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ purge_everything: true }),
    })
  } catch {}
}
