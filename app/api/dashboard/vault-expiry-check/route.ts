// Cron endpoint that delegates to lib/vault-expiry-check.ts and sends an email
// when vault entries or inventory items are approaching their expiry dates.
// Authenticated by CRON_SECRET so it cannot be triggered by arbitrary HTTP requests.
import { NextRequest, NextResponse } from "next/server"
import { checkVaultExpiry } from "@/lib/vault-expiry-check"

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization")
  const cronSecret = process.env.CRON_SECRET

  if (!cronSecret) {
    return NextResponse.json(
      { error: "CRON_SECRET not set in environment" },
      { status: 401, headers: { "Cache-Control": "no-store" } }
    )
  }

  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json(
      { error: "Unauthorised: invalid CRON_SECRET" },
      { status: 401, headers: { "Cache-Control": "no-store" } }
    )
  }

  const result = await checkVaultExpiry()
  return NextResponse.json(result, {
    status: result.ok ? 200 : 500,
    headers: { "Cache-Control": "no-store" },
  })
}
