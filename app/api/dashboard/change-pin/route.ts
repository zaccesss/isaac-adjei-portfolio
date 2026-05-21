import { NextRequest, NextResponse } from "next/server"
import { verifyPin, changePinHash } from "@/lib/pin"
import { auth } from "@/auth"

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorised" }, { status: 401 })

  const { currentPin, newPin } = await req.json()
  if (!currentPin || !newPin || typeof currentPin !== "string" || typeof newPin !== "string") {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 })
  }
  if (newPin.length < 4) {
    return NextResponse.json({ error: "PIN must be at least 4 characters" }, { status: 400 })
  }

  const valid = await verifyPin(currentPin)
  if (!valid) return NextResponse.json({ error: "Current PIN is wrong" }, { status: 403 })

  await changePinHash(newPin)
  return NextResponse.json({ ok: true })
}
