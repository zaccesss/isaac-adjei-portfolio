// Cron endpoint that delegates to lib/vault-expiry-check.ts and sends an email
// when vault entries or inventory items are approaching their expiry dates.
// Authenticated by CRON_SECRET so it cannot be triggered by arbitrary HTTP requests.
import { NextRequest, NextResponse } from "next/server"
import { secretEquals } from "@/lib/secure-compare"
import { checkVaultExpiry } from "@/lib/vault-expiry-check"
import { pingHealthcheck } from "@/lib/healthcheck-ping"
import { isLondonTime, claimCronRun } from "@/lib/london-time"

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization")
  const cronSecret = process.env.CRON_SECRET

  if (!cronSecret) {
    return NextResponse.json(
      { error: "CRON_SECRET not set in environment" },
      { status: 401, headers: { "Cache-Control": "no-store" } }
    )
  }

  if (!secretEquals(authHeader, `Bearer ${cronSecret}`)) {
    return NextResponse.json(
      { error: "Unauthorised: invalid CRON_SECRET" },
      { status: 401, headers: { "Cache-Control": "no-store" } }
    )
  }

  // Two crons (a GMT and a BST branch) hit this route; act only at 09:00 UK, and only once, so a
  // delayed run can never send the expiry email twice.
  if (!isLondonTime(9)) {
    return NextResponse.json({ skipped: "not 09:00 UK" }, { headers: { "Cache-Control": "no-store" } })
  }
  if (!(await claimCronRun("vault-expiry"))) {
    return NextResponse.json({ skipped: "already ran today" }, { headers: { "Cache-Control": "no-store" } })
  }

  const result = await checkVaultExpiry()
  await pingHealthcheck("vault-expiry", result.ok ? "success" : "fail")
  return NextResponse.json(result, {
    status: result.ok ? 200 : 500,
    headers: { "Cache-Control": "no-store" },
  })
}
