import bcrypt from "bcryptjs"
import { supabase } from "@/lib/supabase"

export async function hashPin(pin: string): Promise<string> {
  return bcrypt.hash(pin, 12)
}

export async function verifyPin(pin: string): Promise<boolean> {
  // Check DB first for an in-app-set PIN hash
  const { data } = await supabase
    .from("config")
    .select("value")
    .eq("key", "dashboard_pin_hash")
    .single()

  const storedHash = data?.value as string | undefined

  // If hash is set in DB, verify against it
  if (storedHash && storedHash !== "unset") {
    return bcrypt.compare(pin, storedHash)
  }

  // Fall back to env var (plain text comparison, hashed on first successful use)
  const envPin = process.env.AUTH_SECONDARY_PIN
  console.log("[pin] storedHash:", storedHash, "| envPin set:", !!envPin, "| envPin length:", envPin?.length)
  if (!envPin) return false

  const match = pin === envPin
  console.log("[pin] match:", match, "| pin length:", pin.length)
  if (match) {
    // Persist hash to DB so future verifications are secure
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
