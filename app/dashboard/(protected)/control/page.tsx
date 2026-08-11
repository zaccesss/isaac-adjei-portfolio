// Control merged into /dashboard/ops. Kept as a redirect so old links/bookmarks still land
// somewhere.
import { redirect } from "next/navigation"

export default function ControlPage() {
  redirect("/dashboard/ops")
}
