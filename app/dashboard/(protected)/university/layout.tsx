import { supabase } from "@/lib/supabase"
import UniversitySidebar from "./UniversitySidebar"

export const metadata = { robots: "noindex, nofollow" }

export default async function UniversityLayout({ children }: { children: React.ReactNode }) {
  const { data: modules } = await supabase
    .from("uni_modules")
    .select("id, code, name, color, active, semester, year")
    .eq("active", true)
    .order("year")
    .order("semester")
    .order("order_index")

  const { data: deadlines } = await supabase
    .from("uni_deadlines")
    .select("id, status, due_date")
    .neq("status", "graded")

  // eslint-disable-next-line react-hooks/purity
  const now = Date.now()
  const urgentCount = (deadlines ?? []).filter((d) => {
    const daysLeft = Math.ceil((new Date(d.due_date).getTime() - now) / 86400000)
    return daysLeft <= 7 && d.status !== "submitted"
  }).length

  return (
    <div className="flex h-full min-h-screen">
      <UniversitySidebar modules={modules ?? []} urgentCount={urgentCount} />
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  )
}
