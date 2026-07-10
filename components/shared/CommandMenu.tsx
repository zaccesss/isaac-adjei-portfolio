"use client"

// Keyboard-driven command menu (like Spotlight or VS Code's Ctrl+P).
// Opens with Ctrl+I or Cmd+I. Selecting an item navigates to that page.
// Posts and Projects are intentionally omitted - they grow unboundedly and make the list unusable.
// Shortcuts adapt to the user's OS: ⌘H on Mac, Ctrl+H on Windows/Linux.

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
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
  FlaskConical, Clock, Wrench, Info, ScrollText, Trophy, LayoutList, Shield, Rss,
  GraduationCap, Lightbulb, Tag, SearchIcon, Activity,
  HeartHandshake, Users, LifeBuoy,
} from "lucide-react"
import { DialogTitle } from "@/components/ui/dialog"
import { useModKey } from "@/hooks/useModKey"

export default function CommandMenu() {
  const [open, setOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const { shortcut } = useModKey()
  const shiftShortcut = (key: string) => `⇧${key}`

  useEffect(() => {
    // The maintenance page is a deliberate dead end - don't wire up the menu's keyboard shortcuts there.
    if (pathname === "/maintenance") return
    const down = (e: KeyboardEvent) => {
      if (e.key === "i" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((o) => !o)
        return
      }
      if (!open) return

      // Shift-only shortcuts for the More group - only fire when search is empty
      if (e.shiftKey && !e.metaKey && !e.ctrlKey) {
        if (!(document.activeElement as HTMLInputElement)?.value) {
          // Status lives on an external subdomain, so its hotkey opens a new tab rather than routing.
          if (e.key.toLowerCase() === "m") {
            e.preventDefault()
            setOpen(false)
            window.open("https://status.isaacadjei.me", "_blank", "noopener,noreferrer")
            return
          }
          const shiftShortcuts: Record<string, string> = {
            w: "/now",
            u: "/uses",
            o: "/colophon",
            g: "/changelog",
            f: "/hall-of-fame",
            d: "/consumed",
            a: "/all-pages",
            r: "/privacy",
            x: "/security-policy",
            c: "/contribute",
            k: "/code-of-conduct",
            h: "/support",
            p: "/respub",
            t: "/til",
            z: "/tags",
            s: "/search",
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
        n: "/newsletter",
        k: "/notes",
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
  }, [open, router, pathname])

  const go = (path: string) => {
    setOpen(false)
    router.push(path)
  }

  // Status lives on an external subdomain (Better Stack), so it opens in a new tab rather than routing.
  const goExternal = (url: string) => {
    setOpen(false)
    window.open(url, "_blank", "noopener,noreferrer")
  }

  // Never render the command menu on the bare maintenance page (it would be another way off it).
  if (pathname === "/maintenance") return null

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <DialogTitle className="px-4 pt-4 pb-0 text-base font-semibold text-center">
        Quick Navigation
      </DialogTitle>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>

        {/* Navigation - main site pages, All Pages first as the directory entry point */}
        <CommandGroup heading="Navigation">
          <CommandItem value="all pages directory site map" onSelect={() => go("/all-pages")}>
            <LayoutList className="mr-2 h-4 w-4" />
            All Pages
            <CommandShortcut>{shiftShortcut("A")}</CommandShortcut>
          </CommandItem>
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
          <CommandItem value="blog posts writing" onSelect={() => go("/blog")}>
            <BookOpen className="mr-2 h-4 w-4" />
            Blog
            <CommandShortcut>{shortcut("B")}</CommandShortcut>
          </CommandItem>
          <CommandItem value="newsletter subscribe issues" onSelect={() => go("/newsletter")}>
            <Rss className="mr-2 h-4 w-4" />
            Newsletter
            <CommandShortcut>{shortcut("N")}</CommandShortcut>
          </CommandItem>
          <CommandItem value="contact" onSelect={() => go("/contact")}>
            <Mail className="mr-2 h-4 w-4" />
            Contact
            <CommandShortcut>{shortcut("C")}</CommandShortcut>
          </CommandItem>
          <CommandItem value="links socials" onSelect={() => go("/links")}>
            <Link2 className="mr-2 h-4 w-4" />
            Links
            <CommandShortcut>{shortcut("L")}</CommandShortcut>
          </CommandItem>
        </CommandGroup>

        {/* More - matches /all-pages "More" order, All Pages first */}
        <CommandGroup heading="More">
          <CommandItem value="notes research" onSelect={() => go("/notes")}>
            <NotebookPen className="mr-2 h-4 w-4" />
            Notes
            <CommandShortcut>{shortcut("K")}</CommandShortcut>
          </CommandItem>
          <CommandItem value="til today i learned notes short snippets discoveries" onSelect={() => go("/til")}>
            <Lightbulb className="mr-2 h-4 w-4" />
            TIL
            <CommandShortcut>{shiftShortcut("T")}</CommandShortcut>
          </CommandItem>
          <CommandItem value="research publications academic papers zenodo orcid" onSelect={() => go("/respub")}>
            <GraduationCap className="mr-2 h-4 w-4" />
            Research &amp; Publications
            <CommandShortcut>{shiftShortcut("P")}</CommandShortcut>
          </CommandItem>
          <CommandItem value="now what I am doing currently" onSelect={() => go("/now")}>
            <Clock className="mr-2 h-4 w-4" />
            Now
            <CommandShortcut>{shiftShortcut("W")}</CommandShortcut>
          </CommandItem>
          <CommandItem value="consumed reading watching listening books youtube podcasts media" onSelect={() => go("/consumed")}>
            <BookOpen className="mr-2 h-4 w-4" />
            Consumed
            <CommandShortcut>{shiftShortcut("D")}</CommandShortcut>
          </CommandItem>
          <CommandItem value="lab experiments" onSelect={() => go("/lab")}>
            <FlaskConical className="mr-2 h-4 w-4" />
            Lab
            <CommandShortcut>{shortcut("J")}</CommandShortcut>
          </CommandItem>
          <CommandItem value="uses hardware software tools setup gear" onSelect={() => go("/uses")}>
            <Wrench className="mr-2 h-4 w-4" />
            Uses
            <CommandShortcut>{shiftShortcut("U")}</CommandShortcut>
          </CommandItem>
          <CommandItem value="colophon how the site is built stack tech" onSelect={() => go("/colophon")}>
            <Info className="mr-2 h-4 w-4" />
            Colophon
            <CommandShortcut>{shiftShortcut("O")}</CommandShortcut>
          </CommandItem>
          <CommandItem value="changelog updates history releases versions" onSelect={() => go("/changelog")}>
            <ScrollText className="mr-2 h-4 w-4" />
            Changelog
            <CommandShortcut>{shiftShortcut("G")}</CommandShortcut>
          </CommandItem>
          <CommandItem value="hall of fame acknowledgements security researchers" onSelect={() => go("/hall-of-fame")}>
            <Trophy className="mr-2 h-4 w-4" />
            Hall of Fame
            <CommandShortcut>{shiftShortcut("F")}</CommandShortcut>
          </CommandItem>
          <CommandItem value="tags topics categories browse" onSelect={() => go("/tags")}>
            <Tag className="mr-2 h-4 w-4" />
            Tags
            <CommandShortcut>{shiftShortcut("Z")}</CommandShortcut>
          </CommandItem>
          <CommandItem value="search find blog til newsletter" onSelect={() => go("/search")}>
            <SearchIcon className="mr-2 h-4 w-4" />
            Search
            <CommandShortcut>{shiftShortcut("S")}</CommandShortcut>
          </CommandItem>
          <CommandItem value="privacy policy data" onSelect={() => go("/privacy")}>
            <Shield className="mr-2 h-4 w-4" />
            Privacy Policy
            <CommandShortcut>{shiftShortcut("R")}</CommandShortcut>
          </CommandItem>
          <CommandItem value="security policy vulnerability disclosure responsible" onSelect={() => go("/security-policy")}>
            <Shield className="mr-2 h-4 w-4" />
            Security Policy
            <CommandShortcut>{shiftShortcut("X")}</CommandShortcut>
          </CommandItem>
          <CommandItem value="contribute contributing guide bug pull request idea hardware software" onSelect={() => go("/contribute")}>
            <HeartHandshake className="mr-2 h-4 w-4" />
            Contributing
            <CommandShortcut>{shiftShortcut("C")}</CommandShortcut>
          </CommandItem>
          <CommandItem value="code of conduct community standards contributor covenant" onSelect={() => go("/code-of-conduct")}>
            <Users className="mr-2 h-4 w-4" />
            Code of Conduct
            <CommandShortcut>{shiftShortcut("K")}</CommandShortcut>
          </CommandItem>
          <CommandItem value="support help get in touch questions email" onSelect={() => go("/support")}>
            <LifeBuoy className="mr-2 h-4 w-4" />
            Support
            <CommandShortcut>{shiftShortcut("H")}</CommandShortcut>
          </CommandItem>
          <CommandItem value="status uptime monitoring health system incidents" onSelect={() => goExternal("https://status.isaacadjei.me")}>
            <Activity className="mr-2 h-4 w-4" />
            Status
            <CommandShortcut>{shiftShortcut("M")}</CommandShortcut>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}
