"use client"

// Keyboard-driven command menu (like Spotlight or VS Code's Ctrl+P).
// Opens with Ctrl+I or Cmd+I. Selecting an item navigates to that page.
// I use a useEffect here as well as the useCommandMenuShortcut hook because
// this component owns the open state itself and wires up the shortcut inline.

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandShortcut,
} from "@/components/ui/command"
import { Home, User, Briefcase, Code, Mail, Cpu, BookOpen, Link2 } from "lucide-react"

export default function CommandMenu() {
  const [open, setOpen] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      // ⌘I / Ctrl+I toggles the menu open/closed
      if (e.key === "i" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((o) => !o)
        return
      }
      // When the menu is open, ⌘/Ctrl + first letter navigates directly
      if (!open) return
      if (!(e.metaKey || e.ctrlKey)) return
      const shortcuts: Record<string, string> = {
        h: "/",
        a: "/about",
        p: "/projects",
        e: "/experience",
        s: "/skills",
        b: "/blog",
        c: "/contact",
        l: "/links",
      }
      const path = shortcuts[e.key.toLowerCase()]
      if (path) {
        e.preventDefault()
        setOpen(false)
        router.push(path)
      }
    }
    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [open, router])

  const go = (path: string) => {
    setOpen(false)
    router.push(path)
  }

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Navigation">
          <CommandItem value="home" onSelect={() => go("/")}>
            <Home className="mr-2 h-4 w-4" />
            Home
            <CommandShortcut>⌘H</CommandShortcut>
          </CommandItem>
          <CommandItem value="about" onSelect={() => go("/about")}>
            <User className="mr-2 h-4 w-4" />
            About
            <CommandShortcut>⌘A</CommandShortcut>
          </CommandItem>
          <CommandItem value="projects" onSelect={() => go("/projects")}>
            <Code className="mr-2 h-4 w-4" />
            Projects
            <CommandShortcut>⌘P</CommandShortcut>
          </CommandItem>
          <CommandItem value="experience" onSelect={() => go("/experience")}>
            <Briefcase className="mr-2 h-4 w-4" />
            Experience
            <CommandShortcut>⌘E</CommandShortcut>
          </CommandItem>
          <CommandItem value="skills" onSelect={() => go("/skills")}>
            <Cpu className="mr-2 h-4 w-4" />
            Skills
            <CommandShortcut>⌘S</CommandShortcut>
          </CommandItem>
          <CommandItem value="blog" onSelect={() => go("/blog")}>
            <BookOpen className="mr-2 h-4 w-4" />
            Blog
            <CommandShortcut>⌘B</CommandShortcut>
          </CommandItem>
          <CommandItem value="contact" onSelect={() => go("/contact")}>
            <Mail className="mr-2 h-4 w-4" />
            Contact
            <CommandShortcut>⌘C</CommandShortcut>
          </CommandItem>
          <CommandItem value="links" onSelect={() => go("/links")}>
            <Link2 className="mr-2 h-4 w-4" />
            Links
            <CommandShortcut>⌘L</CommandShortcut>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}
