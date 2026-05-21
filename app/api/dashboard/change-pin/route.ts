import { NextRequest, NextResponse } from "next/server"
import { verifyPin, changePinHash } from "@/lib/pin"
import { auth } from "@/auth"

export async function POST(req: NextRequest) {
  // I guard this route with the GitHub session so only I can change the PIN even if the API is discovered
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorised" }, { status: 401 })

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

  await changePinHash(newPin)
  return NextResponse.json({ ok: true })
}
