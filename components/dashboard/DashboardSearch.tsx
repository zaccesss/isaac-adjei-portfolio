"use client"
// Real-time full-text search using Supabase ilike queries via server action, debounced 300 ms.
// Falls back to an empty state when the query is empty.
// Keyboard navigation is handled by the CommandDialog primitive.

import { useEffect, useState, useCallback, useRef, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { Search, BookOpen, StickyNote, Target, Briefcase, Users, Flame, CheckSquare, Loader2 } from "lucide-react"
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command"
import { searchDashboard } from "@/app/dashboard/actions"

type SearchResults = Awaited<ReturnType<typeof searchDashboard>>

const EMPTY: SearchResults = { goals: [], notes: [], diary: [], applications: [], contacts: [], habits: [], streaks: [] }

function hl(text: string, q: string): ReactNode {
  if (!q.trim()) return text
  const idx = text.toLowerCase().indexOf(q.toLowerCase().trim())
  if (idx === -1) return text
  const len = q.trim().length
  return (
    <>
      {text.slice(0, idx)}
      <mark className="bg-primary/25 text-foreground rounded-sm px-px">{text.slice(idx, idx + len)}</mark>
      {text.slice(idx + len)}
    </>
  )
}

export default function DashboardSearch() {
  const [open, setOpen] = useState(false)
  const [results, setResults] = useState<SearchResults>(EMPTY)
  const [query, setQuery] = useState("")
  const [searching, setSearching] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
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

  // Debounce 300 ms, then call the server action.
  // All setState calls are deferred into setTimeout to satisfy react-hooks/purity.
  useEffect(() => {
    if (!open) return
    if (debounceRef.current) clearTimeout(debounceRef.current)

    if (!query.trim()) {
      debounceRef.current = setTimeout(() => { setResults(EMPTY); setSearching(false) }, 0)
    } else {
      debounceRef.current = setTimeout(async () => {
        setSearching(true)
        try {
          const data = await searchDashboard(query.trim())
          setResults(data)
        } finally {
          setSearching(false)
        }
      }, 300)
    }

    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [query, open])

  function navigate(href: string) {
    setOpen(false)
    router.push(href)
  }

  function handleOpenChange(v: boolean) {
    setOpen(v)
    if (!v) {
      setQuery("")
      setResults(EMPTY)
      setSearching(false)
    }
  }

  const hasResults =
    results.goals.length > 0 ||
    results.notes.length > 0 ||
    results.diary.length > 0 ||
    results.applications.length > 0 ||
    results.contacts.length > 0 ||
    results.habits.length > 0 ||
    results.streaks.length > 0

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

      <CommandDialog open={open} onOpenChange={handleOpenChange}>
        <CommandInput
          placeholder="Search goals, notes, diary, applications..."
          value={query}
          onValueChange={setQuery}
        />
        <CommandList>
          {searching && (
            <div className="flex items-center justify-center gap-2 py-6 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Searching...
            </div>
          )}

          {!searching && query.trim() && !hasResults && (
            <CommandEmpty>No results found.</CommandEmpty>
          )}

          {!searching && !query.trim() && (
            <div className="py-6 text-center text-sm text-muted-foreground">
              Start typing to search across your dashboard.
            </div>
          )}

          {!searching && results.goals.length > 0 && (
            <CommandGroup heading="Goals">
              {results.goals.map((g) => (
                <CommandItem key={g.id} value={`goal ${g.title} ${g.category}`} onSelect={() => navigate("/dashboard/goals")}>
                  <Target className="mr-2 h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="truncate">{hl(g.title, query)}</span>
                  <span className="ml-auto text-xs text-muted-foreground shrink-0">{g.category}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {!searching && results.notes.length > 0 && (
            <CommandGroup heading="Notes">
              {results.notes.map((n) => (
                <CommandItem key={n.id} value={`note ${n.title} ${n.folder}`} onSelect={() => navigate("/dashboard/notes")}>
                  <StickyNote className="mr-2 h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="truncate">{hl(n.title, query)}</span>
                  <span className="ml-auto text-xs text-muted-foreground shrink-0">{n.folder}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {!searching && results.diary.length > 0 && (
            <CommandGroup heading="Diary">
              {results.diary.map((d) => (
                <CommandItem key={d.id} value={`diary ${d.title ?? d.id}`} onSelect={() => navigate("/dashboard/diary")}>
                  <BookOpen className="mr-2 h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="truncate">{hl(d.title ?? "Entry", query)}</span>
                  <span className="ml-auto text-xs text-muted-foreground shrink-0">
                    {new Date(d.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {!searching && results.applications.length > 0 && (
            <CommandGroup heading="Applications">
              {results.applications.map((a) => (
                <CommandItem key={a.id} value={`application ${a.company} ${a.role}`} onSelect={() => navigate("/dashboard/applications")}>
                  <Briefcase className="mr-2 h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="truncate">{hl(`${a.company} - ${a.role}`, query)}</span>
                  <span className="ml-auto text-xs text-muted-foreground shrink-0">{a.status}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {!searching && results.contacts.length > 0 && (
            <CommandGroup heading="Contacts">
              {results.contacts.map((c) => (
                <CommandItem key={c.id} value={`contact ${c.name}`} onSelect={() => navigate("/dashboard/contacts")}>
                  <Users className="mr-2 h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="truncate">{hl(c.name, query)}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {!searching && results.habits.length > 0 && (
            <CommandGroup heading="Habits">
              {results.habits.map((h) => (
                <CommandItem key={h.id} value={`habit ${h.name}`} onSelect={() => navigate("/dashboard/habits")}>
                  <CheckSquare className="mr-2 h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="truncate">{hl(h.name, query)}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {!searching && results.streaks.length > 0 && (
            <CommandGroup heading="Streaks">
              {results.streaks.map((s) => (
                <CommandItem key={s.id} value={`streak ${s.name}`} onSelect={() => navigate("/dashboard/streaks")}>
                  <Flame className="mr-2 h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="truncate">{hl(s.name, query)}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          )}
        </CommandList>
      </CommandDialog>
    </>
  )
}
