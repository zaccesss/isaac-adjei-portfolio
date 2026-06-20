"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard, CalendarDays, ClipboardList, Upload,
  FileText, Link2, Library, BookOpen, GraduationCap,
} from "lucide-react"

type Module = { id: string; code: string; name: string; color: string; active: boolean; semester: number; year: number }

const NAV = [
  { href: "/dashboard/university", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/dashboard/university/timetable", label: "Timetable", icon: CalendarDays },
  { href: "/dashboard/university/deadlines", label: "Deadlines", icon: ClipboardList },
  { href: "/dashboard/university/submissions", label: "Submissions", icon: Upload },
  { href: "/dashboard/university/notes", label: "Notes", icon: FileText },
  { href: "/dashboard/university/resources", label: "Resources", icon: Link2 },
  { href: "/dashboard/university/library", label: "Library", icon: Library },
]

export default function UniversitySidebar({ modules, urgentCount }: { modules: Module[]; urgentCount: number }) {
  const pathname = usePathname()

  function isActive(href: string, exact?: boolean) {
    return exact ? pathname === href : pathname === href || pathname.startsWith(href + "/")
  }

  return (
    <aside className="hidden md:flex flex-col w-56 shrink-0 border-r border-border bg-muted/20 sticky top-0 h-screen overflow-y-auto">
      {/* Header */}
      <div className="px-4 pt-5 pb-3 border-b border-border/60">
        <div className="flex items-center gap-2">
          <GraduationCap className="h-4 w-4 text-primary shrink-0" />
          <span className="text-sm font-semibold">University</span>
        </div>
        <p className="text-[10px] text-muted-foreground mt-0.5">Year 2</p>
      </div>

      {/* Main nav */}
      <nav className="flex flex-col gap-0.5 px-2 pt-2">
        {NAV.map(({ href, label, icon: Icon, exact }) => (
          <Link
            key={href}
            href={href}
            className={`flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-md text-sm transition-colors ${
              isActive(href, exact)
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
          >
            <span className="flex items-center gap-2">
              <Icon className="h-3.5 w-3.5 shrink-0" />
              {label}
            </span>
            {label === "Deadlines" && urgentCount > 0 && (
              <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${isActive(href) ? "bg-primary-foreground/20 text-primary-foreground" : "bg-destructive/10 text-destructive"}`}>
                {urgentCount}
              </span>
            )}
          </Link>
        ))}
      </nav>

      {/* Module list - Blackboard style */}
      {modules.length > 0 && (
        <div className="px-2 pt-4 pb-3">
          <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest px-2.5 mb-1.5">Modules</p>
          <div className="flex flex-col gap-0.5">
            {modules.map((m) => (
              <Link
                key={m.id}
                href={`/dashboard/university/deadlines?module=${m.id}`}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors group"
              >
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ background: m.color }}
                />
                <span className="truncate">{m.code}</span>
                <span className="truncate text-muted-foreground/60 hidden group-hover:block text-[10px]">{m.name}</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Bottom links to existing pages */}
      <div className="mt-auto px-2 pb-3 border-t border-border/60 pt-2">
        <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest px-2.5 mb-1.5">Also</p>
        <Link
          href="/dashboard/modules"
          className="flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          <BookOpen className="h-3.5 w-3.5 shrink-0" />
          Marks tracker
        </Link>
        <Link
          href="/dashboard/course"
          className="flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          <GraduationCap className="h-3.5 w-3.5 shrink-0" />
          Courses
        </Link>
      </div>
    </aside>
  )
}
