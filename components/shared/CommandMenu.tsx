"use client"

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
import { Home, User, Briefcase, Code, Mail, Cpu, BookOpen } from "lucide-react"

export default function CommandMenu() {
  const [open, setOpen] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "i" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((o) => !o)
      }
    }
    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

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
          </CommandItem>
          <CommandItem value="projects" onSelect={() => go("/projects")}>
            <Code className="mr-2 h-4 w-4" />
            Projects
          </CommandItem>
          <CommandItem value="experience" onSelect={() => go("/experience")}>
            <Briefcase className="mr-2 h-4 w-4" />
            Experience
          </CommandItem>
          <CommandItem value="skills" onSelect={() => go("/skills")}>
            <Cpu className="mr-2 h-4 w-4" />
            Skills
          </CommandItem>
          <CommandItem value="blog" onSelect={() => go("/blog")}>
            <BookOpen className="mr-2 h-4 w-4" />
            Blog
          </CommandItem>
          <CommandItem value="contact" onSelect={() => go("/contact")}>
            <Mail className="mr-2 h-4 w-4" />
            Contact
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}
