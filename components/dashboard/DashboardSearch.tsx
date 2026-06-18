"use client"
// I fetch search data once on first open and cache it in component state for the
// session - the data changes infrequently enough that a stale-for-session approach
// is fine and avoids repeated server action calls while the user types.

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Search, BookOpen, StickyNote, Target, Briefcase } from "lucide-react"
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command"
import { getDashboardSearchData } from "@/app/dashboard/actions"

type SearchData = Awaited<ReturnType<typeof getDashboardSearchData>>

export default function DashboardSearch() {
  const [open, setOpen] = useState(false)
  const [data, setData] = useState<SearchData | null>(null)
  const router = useRouter()

  const openSearch = useCallback(() => setOpen(true), [])

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        openSearch()
      }
    }
    window.addEventListener("keydown", handleKey)
    return () => window.removeEventListener("keydown", handleKey)
  }, [openSearch])

  // I fetch on first open only - data is recent enough for a session
  useEffect(() => {
    if (open && !data) {
      getDashboardSearchData().then(setData)
    }
  }, [open, data])

  function navigate(href: string) {
    setOpen(false)
    router.push(href)
  }

  return (
    <>
      <button
        type="button"
        onClick={openSearch}
        aria-label="Search dashboard"
        className="flex items-center gap-2 text-sm text-muted-foreground border border-border rounded-lg px-3 py-1.5 hover:bg-muted/50 transition-colors"
      >
        <Search className="h-3.5 w-3.5" />
        <span>Search...</span>
        <kbd className="hidden sm:inline-flex items-center gap-0.5 text-xs bg-muted border border-border rounded px-1">
          <span>⌘</span><span>K</span>
        </kbd>
      </button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Search goals, notes, diary, applications..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>

          {data?.goals.length ? (
            <CommandGroup heading="Goals">
              {data.goals.map((g) => (
                <CommandItem key={g.id} value={`goal ${g.title} ${g.category}`} onSelect={() => navigate("/dashboard/goals")}>
                  <Target className="mr-2 h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="truncate">{g.title}</span>
                  <span className="ml-auto text-xs text-muted-foreground shrink-0">{g.category}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          ) : null}

          {data?.notes.length ? (
            <CommandGroup heading="Notes">
              {data.notes.map((n) => (
                <CommandItem key={n.id} value={`note ${n.title} ${n.folder}`} onSelect={() => navigate("/dashboard/notes")}>
                  <StickyNote className="mr-2 h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="truncate">{n.title}</span>
                  <span className="ml-auto text-xs text-muted-foreground shrink-0">{n.folder}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          ) : null}

          {data?.diary.length ? (
            <CommandGroup heading="Diary">
              {data.diary.map((d) => (
                <CommandItem key={d.id} value={`diary ${d.title}`} onSelect={() => navigate("/dashboard/diary")}>
                  <BookOpen className="mr-2 h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="truncate">{d.title}</span>
                  <span className="ml-auto text-xs text-muted-foreground shrink-0">
                    {new Date(d.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          ) : null}

          {data?.applications.length ? (
            <CommandGroup heading="Applications">
              {data.applications.map((a) => (
                <CommandItem key={a.id} value={`application ${a.company} ${a.role}`} onSelect={() => navigate("/dashboard/applications")}>
                  <Briefcase className="mr-2 h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="truncate">{a.company} - {a.role}</span>
                  <span className="ml-auto text-xs text-muted-foreground shrink-0">{a.status}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          ) : null}
        </CommandList>
      </CommandDialog>
    </>
  )
}
