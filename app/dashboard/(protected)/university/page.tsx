import { supabase } from "@/lib/supabase"
import Link from "next/link"
import { ClipboardList, Upload, Library, CalendarDays, FileText, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"

export const dynamic = "force-dynamic"
export const metadata = { title: "University", robots: "noindex, nofollow" }

function daysUntil(dateStr: string) {
  return Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86400000)
}

export default async function UniversityOverviewPage() {
  const [
    { data: modules },
    { data: deadlines },
    { data: submissions },
    { data: library },
    { data: notes },
  ] = await Promise.all([
    supabase.from("uni_modules").select("*").eq("active", true).order("semester").order("order_index"),
    supabase.from("uni_deadlines").select("*, uni_modules(code, color)").neq("status", "graded").order("due_date"),
    supabase.from("uni_submissions").select("id, title, submitted_at").order("submitted_at", { ascending: false }).limit(5),
    supabase.from("uni_library_books").select("*").is("returned_at", null).order("due_date"),
    supabase.from("uni_notes").select("id, title, type, updated_at").order("updated_at", { ascending: false }).limit(5),
  ])

  const upcoming = (deadlines ?? []).filter((d) => daysUntil(d.due_date) >= 0).slice(0, 6)
  const overdue = (deadlines ?? []).filter((d) => daysUntil(d.due_date) < 0)
  const booksDueSoon = (library ?? []).filter((b) => daysUntil(b.due_date) <= 7)

  const TYPE_COLOUR: Record<string, string> = {
    assignment: "text-blue-500 bg-blue-500/10",
    coursework: "text-purple-500 bg-purple-500/10",
    exam: "text-red-500 bg-red-500/10",
    presentation: "text-orange-500 bg-orange-500/10",
    quiz: "text-yellow-500 bg-yellow-500/10",
    other: "text-muted-foreground bg-muted",
  }

  return (
    <div className="p-6 space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">University</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Academic hub</p>
        </div>
        <Button size="sm" variant="outline" asChild>
          <Link href="/dashboard/university/deadlines">
            <Plus className="h-4 w-4 mr-1.5" />
            Add deadline
          </Link>
        </Button>
      </div>

      {/* Quick stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Active modules", value: modules?.length ?? 0, href: "/dashboard/university/deadlines", icon: "🎓" },
          { label: "Upcoming deadlines", value: upcoming.length, href: "/dashboard/university/deadlines", icon: "📋" },
          { label: "Overdue", value: overdue.length, href: "/dashboard/university/deadlines", icon: overdue.length > 0 ? "🚨" : "✅" },
          { label: "Books due soon", value: booksDueSoon.length, href: "/dashboard/university/library", icon: "📚" },
        ].map((s) => (
          <Link key={s.label} href={s.href} className="rounded-xl border border-border/60 bg-card p-4 space-y-1 hover:border-primary/30 transition-colors">
            <p className="text-xs text-muted-foreground">{s.label}</p>
            <p className="text-2xl font-bold">{s.icon} {s.value}</p>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Upcoming deadlines */}
        <div className="rounded-xl border border-border/60 bg-card p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ClipboardList className="h-4 w-4 text-primary" />
              <p className="text-sm font-medium">Upcoming deadlines</p>
            </div>
            <Link href="/dashboard/university/deadlines" className="text-xs text-primary hover:underline">View all</Link>
          </div>
          {upcoming.length === 0 ? (
            <p className="text-xs text-muted-foreground">No upcoming deadlines</p>
          ) : (
            <div className="space-y-2">
              {upcoming.map((d) => {
                const days = daysUntil(d.due_date)
                return (
                  <div key={d.id} className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: (d as any).uni_modules?.color ?? "#6366f1" }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate">{d.title}</p>
                      <p className="text-[10px] text-muted-foreground">{(d as any).uni_modules?.code ?? "—"}</p>
                    </div>
                    <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded shrink-0 ${days <= 3 ? "bg-red-500/10 text-red-500" : days <= 7 ? "bg-yellow-500/10 text-yellow-600" : "bg-muted text-muted-foreground"}`}>
                      {days === 0 ? "today" : `${days}d`}
                    </span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${TYPE_COLOUR[d.type] ?? TYPE_COLOUR.other}`}>
                      {d.type}
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Module list */}
        <div className="rounded-xl border border-border/60 bg-card p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-primary" />
              <p className="text-sm font-medium">Active modules</p>
            </div>
            <Link href="/dashboard/university/timetable" className="text-xs text-primary hover:underline">Timetable</Link>
          </div>
          {!modules?.length ? (
            <p className="text-xs text-muted-foreground">No modules added yet</p>
          ) : (
            <div className="space-y-2">
              {modules.map((m) => (
                <div key={m.id} className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full shrink-0" style={{ background: m.color }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium">{m.code} <span className="text-muted-foreground font-normal">- {m.name}</span></p>
                  </div>
                  <span className="text-[10px] text-muted-foreground shrink-0">{m.credits} cr</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent submissions */}
        <div className="rounded-xl border border-border/60 bg-card p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Upload className="h-4 w-4 text-primary" />
              <p className="text-sm font-medium">Recent submissions</p>
            </div>
            <Link href="/dashboard/university/submissions" className="text-xs text-primary hover:underline">View all</Link>
          </div>
          {!submissions?.length ? (
            <p className="text-xs text-muted-foreground">No submissions logged yet</p>
          ) : (
            <div className="space-y-2">
              {submissions.map((s) => (
                <div key={s.id} className="flex items-center gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">{s.title}</p>
                    <p className="text-[10px] text-muted-foreground">{new Date(s.submitted_at).toLocaleDateString("en-GB")}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Library books */}
        <div className="rounded-xl border border-border/60 bg-card p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Library className="h-4 w-4 text-primary" />
              <p className="text-sm font-medium">Library books</p>
            </div>
            <Link href="/dashboard/university/library" className="text-xs text-primary hover:underline">View all</Link>
          </div>
          {!library?.length ? (
            <p className="text-xs text-muted-foreground">No books borrowed</p>
          ) : (
            <div className="space-y-2">
              {(library ?? []).slice(0, 5).map((b) => {
                const days = daysUntil(b.due_date)
                return (
                  <div key={b.id} className="flex items-center gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate">{b.title}</p>
                      {b.author && <p className="text-[10px] text-muted-foreground">{b.author}</p>}
                    </div>
                    <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded shrink-0 ${days <= 3 ? "bg-red-500/10 text-red-500" : days <= 7 ? "bg-yellow-500/10 text-yellow-600" : "bg-muted text-muted-foreground"}`}>
                      due {days === 0 ? "today" : days < 0 ? `${Math.abs(days)}d ago` : `${days}d`}
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Recent notes */}
      {!!notes?.length && (
        <div className="rounded-xl border border-border/60 bg-card p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" />
              <p className="text-sm font-medium">Recent notes</p>
            </div>
            <Link href="/dashboard/university/notes" className="text-xs text-primary hover:underline">View all</Link>
          </div>
          <div className="flex flex-wrap gap-2">
            {notes.map((n) => (
              <Link
                key={n.id}
                href={`/dashboard/university/notes`}
                className="text-xs px-3 py-1.5 rounded-lg border border-border/60 bg-muted/30 hover:border-primary/40 transition-colors truncate max-w-[200px]"
              >
                {n.title}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
