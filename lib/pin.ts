// I import bcrypt server-side only - it must never be bundled into the browser because it exposes the hash logic
import bcrypt from "bcryptjs"
import { createHmac, timingSafeEqual } from "crypto"
import { cookies } from "next/headers"
import { auth } from "@/auth"
import { supabase } from "@/lib/supabase"

export const PIN_COOKIE = "dashboard_pin_verified"
export const PIN_TTL_SECONDS = 60 * 60 * 4

function pinSecret(): string | null {
  return process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || null
}

// The subject binds the PIN cookie to my session, so a token minted for one session
// subject cannot unlock another.
export function pinSubject(session: { user?: { email?: string | null; name?: string | null } } | null): string | null {
  if (!session) return null
  return session.user?.email || session.user?.name || "owner"
}

// The cookie value is "<expiry>.<hmac>" rather than a constant, so presenting the
// cookie name with a guessed value can never pass the gate.
export function signPinToken(subject: string): string | null {
  const secret = pinSecret()
  if (!secret) return null
  const expires = Date.now() + PIN_TTL_SECONDS * 1000
  const sig = createHmac("sha256", secret).update(`${subject}.${expires}`).digest("hex")
  return `${expires}.${sig}`
}

export function verifyPinToken(subject: string | null, token: string | undefined): boolean {
  const secret = pinSecret()
  if (!secret || !subject || !token) return false
  const dot = token.indexOf(".")
  if (dot < 1) return false
  const expires = Number(token.slice(0, dot))
  if (!Number.isFinite(expires) || Date.now() > expires) return false
  const expected = createHmac("sha256", secret).update(`${subject}.${expires}`).digest()
  const given = Buffer.from(token.slice(dot + 1), "hex")
  return given.length === expected.length && timingSafeEqual(given, expected)
}

// One call for gated pages: true only when a live session presents an unexpired
// token signed for that session's subject.
export async function isPinVerified(): Promise<boolean> {
  const session = await auth()
  const subject = pinSubject(session)
  if (!subject) return false
  const cookieStore = await cookies()
  return verifyPinToken(subject, cookieStore.get(PIN_COOKIE)?.value)
}

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

  const a = Buffer.from(pin)
  const b = Buffer.from(envPin)
  const match = a.length === b.length && timingSafeEqual(a, b)
  if (match) {
    const hash = await hashPin(pin)
    await supabase
      .from("config")
      .upsert({ key: "dashboard_pin_hash", value: hash, updated_at: new Date().toISOString() }, { onConflict: "key" })
  }
  return match
}

export async function changePinHash(newPin: string): Promise<{ error?: string }> {
  const hash = await hashPin(newPin)
  const { error } = await supabase
    .from("config")
    .upsert({ key: "dashboard_pin_hash", value: hash, updated_at: new Date().toISOString() }, { onConflict: "key" })
  return error ? { error: error.message } : {}
}
