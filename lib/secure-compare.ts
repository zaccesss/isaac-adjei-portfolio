import { timingSafeEqual } from "crypto"

// Constant-time comparison for shared secrets (cron bearer tokens, webhook secrets), so the
// compare itself can never leak where a guess diverges. Either side missing fails closed.
export function secretEquals(provided: string | null | undefined, expected: string | null | undefined): boolean {
  if (!provided || !expected) return false
  const a = Buffer.from(provided)
  const b = Buffer.from(expected)
  return a.length === b.length && timingSafeEqual(a, b)
}
