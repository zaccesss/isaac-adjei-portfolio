"use client"

// Keyboard-driven command menu (like Spotlight or VS Code's Ctrl+P).
// Opens with Ctrl+I or Cmd+I. Selecting an item navigates to that page.
// Items are split into Navigation (pages), More pages, and searchable Posts and Projects.
// Shortcuts adapt to the user's OS: ⌘H on Mac, Ctrl+H on Windows/Linux.

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
import {
  Home, User, Briefcase, Code, Mail, Cpu, BookOpen, Link2, NotebookPen,
  FlaskConical, FileText, Folder, Clock, Wrench, Info, ScrollText, Trophy, LayoutList,
} from "lucide-react"
import { DialogTitle } from "@/components/ui/dialog"
import { useModKey } from "@/hooks/useModKey"
import { getPublishedPosts } from "@/data/blog"
import { projects } from "@/data/projects"

const publishedPosts = getPublishedPosts()

export default function CommandMenu() {
  const [open, setOpen] = useState(false)
  const router = useRouter()
  const { isMac, shortcut } = useModKey()
  // More group shortcuts show as just ⇧Letter (no Mod required)
  const shiftShortcut = (key: string) => `⇧${key}`

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      // ⌘I / Ctrl+I toggles the menu open/closed
      if (e.key === "i" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((o) => !o)
        return
      }
      if (!open) return

      // Shift-only shortcuts for the More group.
      // Only fire when the search input is empty so capital-letter typing is unaffected.
      if (e.shiftKey && !e.metaKey && !e.ctrlKey) {
        if (!(document.activeElement as HTMLInputElement)?.value) {
          const shiftShortcuts: Record<string, string> = {
            w: "/now",
            u: "/uses",
            o: "/colophon",
            g: "/changelog",
            f: "/hall-of-fame",
            m: "/newsletter",
            d: "/consumed",
            a: "/all-pages",
          }
          const shiftPath = shiftShortcuts[e.key.toLowerCase()]
          if (shiftPath) {
            e.preventDefault()
            setOpen(false)
            router.push(shiftPath)
          }
        }
        return
      }

      // Mod+letter shortcuts for the main nav
      if (!(e.metaKey || e.ctrlKey)) return
      const shortcuts: Record<string, string> = {
        h: "/",
        a: "/about",
        p: "/projects",
        e: "/experience",
        s: "/skills",
        b: "/blog",
        n: "/notes",
        j: "/lab",
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
      {/* Visible title centred at the top of the menu */}
      <DialogTitle className="px-4 pt-4 pb-0 text-base font-semibold text-center">
        Quick Navigation
      </DialogTitle>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>

        {/* Navigation group - the main site pages */}
        <CommandGroup heading="Navigation">
          <CommandItem value="home" onSelect={() => go("/")}>
            <Home className="mr-2 h-4 w-4" />
            Home
            <CommandShortcut>{shortcut("H")}</CommandShortcut>
          </CommandItem>
          <CommandItem value="about" onSelect={() => go("/about")}>
            <User className="mr-2 h-4 w-4" />
            About
            <CommandShortcut>{shortcut("A")}</CommandShortcut>
          </CommandItem>
          <CommandItem value="projects" onSelect={() => go("/projects")}>
            <Code className="mr-2 h-4 w-4" />
            Projects
            <CommandShortcut>{shortcut("P")}</CommandShortcut>
          </CommandItem>
          <CommandItem value="experience" onSelect={() => go("/experience")}>
            <Briefcase className="mr-2 h-4 w-4" />
            Experience
            <CommandShortcut>{shortcut("E")}</CommandShortcut>
          </CommandItem>
          <CommandItem value="skills" onSelect={() => go("/skills")}>
            <Cpu className="mr-2 h-4 w-4" />
            Skills
            <CommandShortcut>{shortcut("S")}</CommandShortcut>
          </CommandItem>
          <CommandItem value="blog" onSelect={() => go("/blog")}>
            <BookOpen className="mr-2 h-4 w-4" />
            Blog
            <CommandShortcut>{shortcut("B")}</CommandShortcut>
          </CommandItem>
          <CommandItem value="notes" onSelect={() => go("/notes")}>
            <NotebookPen className="mr-2 h-4 w-4" />
            Notes
            <CommandShortcut>{shortcut("N")}</CommandShortcut>
          </CommandItem>
          <CommandItem value="lab" onSelect={() => go("/lab")}>
            <FlaskConical className="mr-2 h-4 w-4" />
            Lab
            <CommandShortcut>{shortcut("J")}</CommandShortcut>
          </CommandItem>
        </CommandGroup>

        {/* Actions group - contact and external links */}
        <CommandGroup heading="Actions">
          <CommandItem value="contact" onSelect={() => go("/contact")}>
            <Mail className="mr-2 h-4 w-4" />
            Contact
            <CommandShortcut>{shortcut("C")}</CommandShortcut>
          </CommandItem>
          <CommandItem value="links" onSelect={() => go("/links")}>
            <Link2 className="mr-2 h-4 w-4" />
            Links
            <CommandShortcut>{shortcut("L")}</CommandShortcut>
          </CommandItem>
        </CommandGroup>

        {/* More pages - discoverable but not in the main nav */}
        <CommandGroup heading="More">
          <CommandItem value="now what I am doing" onSelect={() => go("/now")}>
            <Clock className="mr-2 h-4 w-4" />
            Now
            <CommandShortcut>{shiftShortcut("W")}</CommandShortcut>
          </CommandItem>
          <CommandItem value="uses hardware software tools setup" onSelect={() => go("/uses")}>
            <Wrench className="mr-2 h-4 w-4" />
            Uses
            <CommandShortcut>{shiftShortcut("U")}</CommandShortcut>
          </CommandItem>
          <CommandItem value="colophon how the site is built stack" onSelect={() => go("/colophon")}>
            <Info className="mr-2 h-4 w-4" />
            Colophon
            <CommandShortcut>{shiftShortcut("O")}</CommandShortcut>
          </CommandItem>
          <CommandItem value="changelog updates history releases" onSelect={() => go("/changelog")}>
            <ScrollText className="mr-2 h-4 w-4" />
            Changelog
            <CommandShortcut>{shiftShortcut("G")}</CommandShortcut>
          </CommandItem>
          <CommandItem value="hall of fame acknowledgements security researchers" onSelect={() => go("/hall-of-fame")}>
            <Trophy className="mr-2 h-4 w-4" />
            Hall of Fame
            <CommandShortcut>{shiftShortcut("F")}</CommandShortcut>
          </CommandItem>
          <CommandItem value="newsletter subscribe issues" onSelect={() => go("/newsletter")}>
            <Mail className="mr-2 h-4 w-4" />
            Newsletter
            <CommandShortcut>{shiftShortcut("M")}</CommandShortcut>
          </CommandItem>
          <CommandItem value="consumed reading watching listening books youtube podcasts" onSelect={() => go("/consumed")}>
            <BookOpen className="mr-2 h-4 w-4" />
            Consumed
            <CommandShortcut>{shiftShortcut("D")}</CommandShortcut>
          </CommandItem>
          <CommandItem value="all pages directory site map" onSelect={() => go("/all-pages")}>
            <LayoutList className="mr-2 h-4 w-4" />
            All Pages
            <CommandShortcut>{shiftShortcut("A")}</CommandShortcut>
          </CommandItem>
        </CommandGroup>

        {/* Projects group - searchable by title and tech */}
        <CommandGroup heading="Projects">
          {projects.map((project) => (
            <CommandItem
              key={project.id}
              value={`${project.title} ${project.technologies.join(" ")} ${project.category}`}
              onSelect={() => go(`/projects/${project.id}`)}
            >
              <Folder className="mr-2 h-4 w-4 shrink-0" />
              {project.title}
            </CommandItem>
          ))}
        </CommandGroup>

        {/* Posts group - searchable blog post titles and tags */}
        <CommandGroup heading="Posts">
          {publishedPosts.map((post) => (
            <CommandItem
              key={post.slug}
              value={`${post.title} ${post.tags.join(" ")}`}
              onSelect={() => go(`/blog/${post.slug}`)}
            >
              <FileText className="mr-2 h-4 w-4 shrink-0" />
              {post.title}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}
