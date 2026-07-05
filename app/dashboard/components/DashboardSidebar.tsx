"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut } from "next-auth/react"
import {
  User, Heart, Target, Dumbbell, BookMarked, StickyNote,
  Gift, Package, GraduationCap, BookOpen, Briefcase, Lock,
  Flame, LogOut, ChevronLeft, ChevronRight, Menu, X, Settings, Activity, Github, BarChart2, Code2, Trash2, Users,
  Brain, Church, School, CheckSquare, CalendarDays, ChevronDown, FolderOpen, Sparkles, CalendarClock, Music
} from "lucide-react"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import DashboardSearch from "@/components/dashboard/DashboardSearch"

type NavItem = { href: string; label: string; icon: React.ComponentType<{ className?: string }>; sub?: boolean }
type NavGroup = { group: string; icon?: React.ComponentType<{ className?: string }>; items: NavItem[] }

const nav: (NavItem | NavGroup)[] = [
  { href: "/dashboard/me", label: "Me", icon: User },
  { href: "/dashboard/us", label: "Us", icon: Heart },
  { href: "/dashboard/goals", label: "Goals", icon: Target },
  { href: "/dashboard/applications", label: "Applications", icon: Briefcase },
  { href: "/dashboard/opensource", label: "Open Source", icon: Github },
  {
    group: "University",
    items: [
      { href: "/dashboard/university", label: "Overview", icon: School },
      { href: "/dashboard/course", label: "Course", icon: GraduationCap },
      { href: "/dashboard/modules", label: "Modules", icon: BookOpen },
    ],
  },
  {
    group: "Daily",
    items: [
      { href: "/dashboard/study", label: "Study", icon: Brain },
      { href: "/dashboard/faith", label: "Faith", icon: Church },
      { href: "/dashboard/calendar", label: "Calendar", icon: CalendarDays },
      { href: "/dashboard/reminders", label: "Reminders", icon: CalendarClock },
    ],
  },
  {
    group: "Wellbeing",
    items: [
      { href: "/dashboard/health", label: "Health", icon: Dumbbell },
      { href: "/dashboard/habits", label: "Habits", icon: CheckSquare },
      { href: "/dashboard/streaks", label: "Streaks", icon: Flame },
    ],
  },
  {
    group: "Personal",
    items: [
      { href: "/dashboard/diary", label: "Diary", icon: BookMarked },
      { href: "/dashboard/notes", label: "Notes", icon: StickyNote },
      { href: "/dashboard/files", label: "File Manager", icon: FolderOpen },
      { href: "/dashboard/contacts", label: "Contacts", icon: Users },
    ],
  },
  {
    group: "Belongings",
    items: [
      { href: "/dashboard/wishlist", label: "Wishlist", icon: Gift },
      { href: "/dashboard/inventory", label: "Inventory", icon: Package },
      { href: "/dashboard/vault", label: "Vault", icon: Lock },
    ],
  },
  {
    group: "Analytics",
    items: [
      { href: "/dashboard/coding", label: "Coding", icon: Code2 },
      { href: "/dashboard/blog-analytics", label: "Posts", icon: BarChart2 },
      { href: "/dashboard/analytics/applications", label: "Applications", icon: Briefcase },
      { href: "/dashboard/analytics/music", label: "Music", icon: Music },
      { href: "/dashboard/health/analytics", label: "Fitness", icon: Dumbbell },
    ],
  },
  {
    group: "More",
    items: [
      { href: "/dashboard/assistant", label: "Assistant", icon: Sparkles },
      { href: "/dashboard/activity", label: "Activity log", icon: Activity },
      { href: "/dashboard/trash", label: "Trash", icon: Trash2 },
    ],
  },
]

// Every nav destination, so active state can pick the most specific match: a child route like
// /dashboard/health/analytics lights up only Fitness, never also its parent /dashboard/health.
const ALL_HREFS = new Set<string>([
  ...nav.flatMap((e) => ("items" in e ? e.items.map((i) => i.href) : [e.href])),
  "/dashboard/settings",
])

function isNavActive(pathname: string, href: string): boolean {
  if (pathname === href) return true
  if (!pathname.startsWith(href + "/")) return false
  for (const h of ALL_HREFS) {
    if (h !== href && h.length > href.length && (pathname === h || pathname.startsWith(h + "/"))) return false
  }
  return true
}

function useCollapsedGroups(pathname: string) {
  const [collapsed, setCollapsed] = useState<Set<string>>(() => {
    if (typeof window === "undefined") return new Set()
    try {
      const stored = localStorage.getItem("nexus_collapsed_groups")
      return stored ? new Set<string>(JSON.parse(stored)) : new Set()
    } catch { return new Set() }
  })

  function toggle(group: string) {
    setCollapsed((prev) => {
      const next = new Set(prev)
      if (next.has(group)) { next.delete(group) } else { next.add(group) }
      try { localStorage.setItem("nexus_collapsed_groups", JSON.stringify([...next])) } catch {}
      return next
    })
  }

  function isGroupCollapsed(entry: NavGroup): boolean {
    const groupActive = entry.items.some((i) => isNavActive(pathname, i.href))
    if (groupActive) return false
    return collapsed.has(entry.group)
  }

  return { isGroupCollapsed, toggle }
}

function NavGroupSection({
  entry,
  pathname,
  sidebarCollapsed,
  onNavigate,
}: {
  entry: NavGroup
  pathname: string
  sidebarCollapsed: boolean
  onNavigate: () => void
}) {
  const groupActive = entry.items.some((i) => isNavActive(pathname, i.href))
  const { isGroupCollapsed, toggle } = useCollapsedGroups(pathname)
  const isCollapsed = isGroupCollapsed(entry)

  if (sidebarCollapsed) {
    return (
      <div className="mt-1">
        {entry.items.map(({ href, label, icon: Icon }) => {
          const active = isNavActive(pathname, href)
          return (
            <Link key={href} href={href} onClick={onNavigate} title={label}
              className={`flex justify-center px-2.5 py-1.5 rounded-md text-sm transition-colors ${active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}
            >
              <Icon className="h-4 w-4 shrink-0" />
            </Link>
          )
        })}
      </div>
    )
  }

  return (
    <div className="mt-1">
      <button
        type="button"
        onClick={() => toggle(entry.group)}
        className={`w-full flex items-center justify-between px-2.5 py-1 rounded hover:bg-muted/60 transition-colors group ${groupActive ? "text-foreground" : "text-muted-foreground/60 hover:text-muted-foreground"}`}
      >
        <span className="text-[9px] font-semibold uppercase tracking-widest">{entry.group}</span>
        <ChevronDown className={`h-3 w-3 transition-transform duration-150 ${isCollapsed ? "-rotate-90" : ""}`} />
      </button>
      {!isCollapsed && entry.items.map(({ href, label, icon: Icon, sub }) => {
        const active = isNavActive(pathname, href)
        return (
          <Link key={href} href={href} onClick={onNavigate}
            className={`flex items-center gap-2.5 ${sub ? "pl-5 pr-2.5" : "px-2.5"} py-1.5 rounded-md text-sm transition-colors ${active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}
          >
            <Icon className={`shrink-0 ${sub ? "h-3.5 w-3.5" : "h-4 w-4"}`} />
            <span className={`truncate ${sub ? "text-xs" : ""}`}>{label}</span>
          </Link>
        )
      })}
    </div>
  )
}

export default function DashboardSidebar({
  user,
}: {
  user: { name?: string | null; image?: string | null }
}) {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window === "undefined") return false
    return localStorage.getItem("nexus_sidebar_collapsed") === "true"
  })
  const [mobileOpen, setMobileOpen] = useState(false)

  function toggleCollapse() {
    const next = !collapsed
    setCollapsed(next)
    try { localStorage.setItem("nexus_sidebar_collapsed", String(next)) } catch {}
  }

  const renderNav = (isMobile: boolean) => (
    <nav className="flex flex-col gap-0.5 flex-1 overflow-y-auto">
      {nav.map((entry) => {
        if ("group" in entry) {
          if (isMobile) {
            return (
              <NavGroupSection
                key={entry.group}
                entry={entry}
                pathname={pathname}
                sidebarCollapsed={false}
                onNavigate={() => setMobileOpen(false)}
              />
            )
          }
          return (
            <NavGroupSection
              key={entry.group}
              entry={entry}
              pathname={pathname}
              sidebarCollapsed={collapsed}
              onNavigate={() => setMobileOpen(false)}
            />
          )
        }

        const { href, label, icon: Icon } = entry
        const active = isNavActive(pathname, href)
        return (
          <Link
            key={href}
            href={href}
            onClick={() => setMobileOpen(false)}
            title={!isMobile && collapsed ? label : undefined}
            className={`flex items-center gap-2.5 px-2.5 py-2 rounded-md text-sm transition-colors ${
              active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted"
            } ${!isMobile && collapsed ? "justify-center" : ""}`}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {(isMobile || !collapsed) && <span className="truncate">{label}</span>}
          </Link>
        )
      })}
    </nav>
  )

  const bottomNav = (isMobile: boolean) => (
    <div className="flex flex-col gap-0.5 border-t border-border/60 pt-2 mt-1">
      {(() => {
        const active = isNavActive(pathname, "/dashboard/settings")
        return (
          <Link
            href="/dashboard/settings"
            onClick={() => setMobileOpen(false)}
            title={!isMobile && collapsed ? "Settings" : undefined}
            className={`flex items-center gap-2.5 px-2.5 py-2 rounded-md text-sm transition-colors ${
              active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted"
            } ${!isMobile && collapsed ? "justify-center" : ""}`}
          >
            <Settings className="h-4 w-4 shrink-0" />
            {(isMobile || !collapsed) && <span>Settings</span>}
          </Link>
        )
      })()}
      <Button
        variant="ghost"
        size="sm"
        title={!isMobile && collapsed ? "Sign out" : undefined}
        className={`justify-start gap-2 text-muted-foreground hover:text-foreground ${!isMobile && collapsed ? "justify-center px-2" : ""}`}
        onClick={() => signOut({ callbackUrl: "/dashboard/login" })}
      >
        <LogOut className="h-4 w-4 shrink-0" />
        {(isMobile || !collapsed) && "Sign out"}
      </Button>
    </div>
  )

  const header = (isMobile: boolean) => (
    <div className={`flex items-center pt-2 pb-1 ${!isMobile && collapsed ? "justify-center" : "justify-between"}`}>
      {(isMobile || !collapsed) && (
        <div className="flex items-center gap-2.5 min-w-0">
          {user.image && (
            <Image src={user.image} alt={user.name ?? "avatar"} width={28} height={28} className="rounded-full shrink-0" />
          )}
          <div className="min-w-0">
            <p className="text-xs font-semibold truncate leading-tight">My Dashboard</p>
            {user.name && <p className="text-[10px] text-muted-foreground truncate leading-tight">{user.name}</p>}
          </div>
        </div>
      )}
      {!isMobile && collapsed && user.image && (
        <Image src={user.image} alt={user.name ?? "avatar"} width={28} height={28} className="rounded-full" />
      )}
      {!isMobile && (
        <button
          type="button"
          onClick={toggleCollapse}
          className="ml-auto p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors shrink-0"
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
        </button>
      )}
      {isMobile && (
        <button type="button" aria-label="Close navigation" onClick={() => setMobileOpen(false)} className="p-1 rounded hover:bg-muted ml-auto">
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  )

  return (
    <>
      <aside
        className={`hidden md:flex flex-col border-r border-border bg-muted/30 p-3 gap-3 sticky top-0 h-screen transition-all duration-200 ${
          collapsed ? "w-14" : "w-52"
        }`}
      >
        {header(false)}
        {!collapsed && <div className="py-1"><DashboardSearch /></div>}
        {renderNav(false)}
        {bottomNav(false)}
      </aside>

      <div className="md:hidden fixed top-3 left-3 z-50">
        <button
          type="button"
          aria-label="Open navigation"
          onClick={() => setMobileOpen(true)}
          className="p-2 rounded-md bg-background border border-border shadow-sm"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <aside className="relative flex flex-col w-64 max-w-[85vw] bg-background border-r border-border p-3 gap-3 h-full overflow-y-auto z-10">
            {header(true)}
            {renderNav(true)}
            {bottomNav(true)}
          </aside>
        </div>
      )}
    </>
  )
}
