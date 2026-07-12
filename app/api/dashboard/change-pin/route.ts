import { NextRequest, NextResponse } from "next/server"
import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"
import { verifyPin, changePinHash } from "@/lib/pin"
import { auth } from "@/auth"
import { logActivity } from "@/app/dashboard/actions"

// The same brute-force protection as verify-pin - without it this route's current-PIN
// check is an unthrottled oracle for the PIN. Fail-open on an Upstash outage so I am
// never locked out of my own dashboard.
let ratelimit: Ratelimit | null = null
if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  try {
    ratelimit = new Ratelimit({
      redis: Redis.fromEnv(),
      limiter: Ratelimit.slidingWindow(5, "15 m"),
      prefix: "change_pin_rl",
    })
  } catch (e) {
    console.error("Ratelimit init failed:", e)
  }
}

export async function POST(req: NextRequest) {
  // I guard this route with the GitHub session so only I can change the PIN even if the API is discovered
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorised" }, { status: 401 })

  if (ratelimit) {
    try {
      const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown"
      const { success } = await ratelimit.limit(ip)
      if (!success) {
        return NextResponse.json({ error: "Too many attempts. Please try again later." }, { status: 429 })
      }
    } catch (rlErr) {
      console.error("Rate limit check failed, allowing request:", rlErr)
    }
  }

  const { currentPin, newPin } = await req.json()
  if (!currentPin || !newPin || typeof currentPin !== "string" || typeof newPin !== "string") {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 })
  }
  // I enforce a minimum length of 4 to prevent trivially weak PINs
  if (newPin.length < 4) {
    return NextResponse.json({ error: "PIN must be at least 4 characters" }, { status: 400 })
  }

  // I require the current PIN to be correct before allowing a change - prevents lock-out via CSRF
  const valid = await verifyPin(currentPin)
  if (!valid) return NextResponse.json({ error: "Current PIN is wrong" }, { status: 403 })

  // A failed upsert must never report success - the old PIN would still be live.
  const { error } = await changePinHash(newPin)
  if (error) {
    console.error("PIN change failed:", error)
    return NextResponse.json({ error: "Could not save the new PIN" }, { status: 500 })
  }
  // I record the PIN change in the activity log (the route already verified the session above).
  await logActivity("settings.change", "pin")
  return NextResponse.json({ ok: true })
}
