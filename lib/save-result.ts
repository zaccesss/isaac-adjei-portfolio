import { toast } from "sonner"

// The dashboard server actions return { error: string } on failure (the shared INVALID guard or a real
// Postgres error) and either undefined or the inserted row on success. This normalises that check at the
// call site: when the write failed it shows an error toast and returns false, so the caller can revert
// its optimistic state and stop; on success it returns true, and the caller can still use the returned
// row. Reused everywhere so a rejected save always surfaces instead of looking saved.
export function savedOk(result: unknown, message = "Could not save - please try again"): boolean {
  if (result && typeof result === "object" && "error" in result && (result as { error?: unknown }).error) {
    toast.error(message)
    return false
  }
  return true
}
