// I check vault entries and inventory items for upcoming expiry dates and send an
// email alert when anything is within its type-specific warning window. I keep this
// logic in a lib file so the cron route and any future callers share one implementation.
import { supabase } from "@/lib/supabase"
import { postDiscordWebhook } from "@/lib/discord-webhook"

// I use per-type thresholds so time-sensitive documents (passports) alert
// earlier than short-lived secrets (API keys).
const ALERT_DAYS: Record<string, number> = {
  passport: 90,
  warranty: 30,
  card:     30,
  api_key:  14,
  default:  30,
}

function alertDays(type: string): number {
  // I fall back to the default threshold for any type not in the config.
  return ALERT_DAYS[type] ?? ALERT_DAYS.default
}

export type ExpiringItem = {
  source: "vault" | "inventory"
  name: string
  type: string
  expiresOn: string
  daysLeft: number
}

function daysUntil(dateStr: string): number {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const target = new Date(dateStr)
  target.setHours(0, 0, 0, 0)
  return Math.floor((target.getTime() - today.getTime()) / 86_400_000)
}

// I parse MM/YY card expiry to the last day of that month for comparison
function parseCardExpiry(mmyy: string): string | null {
  const match = mmyy.match(/^(\d{2})\/(\d{2})$/)
  if (!match) return null
  const month = parseInt(match[1], 10)
  const year = 2000 + parseInt(match[2], 10)
  if (month < 1 || month > 12) return null
  const lastDay = new Date(year, month, 0).getDate()
  return `${year}-${String(month).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`
}

// I gather everything within its type-specific warning window, soonest first, WITHOUT sending anything,
// so the cron alert and the digests share one source of truth for what is expiring.
export async function getExpiringItems(): Promise<ExpiringItem[]> {
  const expiring: ExpiringItem[] = []

  // I check api_key entries with an ISO date expiry
  const { data: vaultKeys } = await supabase
    .from("vault")
    .select("name, type, key_expiry")
    .not("key_expiry", "is", null)

  for (const row of vaultKeys ?? []) {
    if (!row.key_expiry) continue
    const days = daysUntil(row.key_expiry)
    if (days <= alertDays(row.type ?? "default")) {
      expiring.push({ source: "vault", name: row.name, type: row.type, expiresOn: row.key_expiry, daysLeft: days })
    }
  }

  // I check card entries with MM/YY expiry
  const { data: vaultCards } = await supabase
    .from("vault")
    .select("name, type, card_expiry")
    .not("card_expiry", "is", null)

  for (const row of vaultCards ?? []) {
    if (!row.card_expiry) continue
    const iso = parseCardExpiry(row.card_expiry)
    if (!iso) continue
    const days = daysUntil(iso)
    if (days <= alertDays("card")) {
      expiring.push({ source: "vault", name: row.name, type: "card", expiresOn: row.card_expiry, daysLeft: days })
    }
  }

  // I check inventory items with warranty expiry
  const { data: inventoryItems } = await supabase
    .from("inventory_items")
    .select("name, category, warranty_expiry")
    .not("warranty_expiry", "is", null)

  for (const row of inventoryItems ?? []) {
    if (!row.warranty_expiry) continue
    const days = daysUntil(row.warranty_expiry)
    if (days <= alertDays("warranty")) {
      expiring.push({ source: "inventory", name: row.name, type: row.category ?? "item", expiresOn: row.warranty_expiry, daysLeft: days })
    }
  }

  expiring.sort((a, b) => a.daysLeft - b.daysLeft)
  return expiring
}

export async function checkVaultExpiry(): Promise<{ ok: boolean; sent: boolean; count: number }> {
  // Prefer a dedicated per-channel webhook, falling back to the shared one so existing setups keep working.
  const webhookUrl = process.env.DISCORD_WEBHOOK_VAULT ?? process.env.DISCORD_WEBHOOK_URL
  if (!webhookUrl) return { ok: true, sent: false, count: 0 }

  const expiring = await getExpiringItems()
  if (expiring.length === 0) return { ok: true, sent: false, count: 0 }

  const fields = expiring.map((item) => ({
    name: `${item.name} (${item.type})`,
    value: item.daysLeft < 0
      ? `Expired ${Math.abs(item.daysLeft)}d ago - ${item.expiresOn}`
      : item.daysLeft === 0
      ? `Expires today - ${item.expiresOn}`
      : `Expires in ${item.daysLeft}d - ${item.expiresOn}`,
    inline: false,
  }))

  const colour = expiring.some((i) => i.daysLeft <= 7) ? 0xe74c3c : 0xf39c12

  const body = {
    embeds: [
      {
        title: `Expiry Alert - ${expiring.length} item${expiring.length === 1 ? "" : "s"} expiring soon`,
        color: colour,
        fields,
        footer: { text: "isaacadjei.me vault" },
        timestamp: new Date().toISOString(),
      },
    ],
  }

  // Loud on failure: a dead webhook logs the full Discord error and opens an incident, never a silent skip.
  const result = await postDiscordWebhook(webhookUrl, body, "vault-expiry")
  return { ok: result.ok, sent: true, count: expiring.length }
}
