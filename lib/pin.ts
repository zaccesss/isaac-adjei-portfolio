import bcrypt from "bcryptjs"
import { supabase } from "@/lib/supabase"

// I use 12 rounds - high enough to be slow for brute-force but fast enough for interactive use
export async function hashPin(pin: string): Promise<string> {
  return bcrypt.hash(pin, 12)
}

export async function verifyPin(pin: string): Promise<boolean> {
  // I check the DB first in case I changed my PIN in-app (stored as a bcrypt hash)
  const { data } = await supabase
    .from("config")
    .select("value")
    .eq("key", "dashboard_pin_hash")
    .single()

  const storedHash = data?.value as string | undefined

  if (storedHash && storedHash !== "unset") {
    return bcrypt.compare(pin, storedHash)
  }

  // I fall back to the Vercel env var on first use, then hash and persist it so
  // subsequent checks never compare plain text again
  const envPin = process.env.AUTH_SECONDARY_PIN
  if (!envPin) return false

  const match = pin === envPin
  if (match) {
    const hash = await hashPin(pin)
    await supabase
      .from("config")
      .upsert({ key: "dashboard_pin_hash", value: hash, updated_at: new Date().toISOString() }, { onConflict: "key" })
  }
  return match
}

export async function changePinHash(newPin: string): Promise<void> {
  const hash = await hashPin(newPin)
  await supabase
    .from("config")
    .upsert({ key: "dashboard_pin_hash", value: hash, updated_at: new Date().toISOString() }, { onConflict: "key" })
}
