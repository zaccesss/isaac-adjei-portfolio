"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import Image from "next/image"
import NewsletterForm from "@/components/shared/NewsletterForm"
import { posts } from "@/data/blog"
import { useModKey } from "@/hooks/useModKey"

type WindowState = "normal" | "minimized" | "maximized" | "closed"
type LineType = "system" | "cmd-echo" | "output" | "error" | "info" | "blank" | "success" | "cmd-list" | "kv"

interface Line {
  type: LineType
  text: string
}

const HOST = "isaacadjei@portfolio:~/lab"

const TYPE_LABEL: Record<string, string> = {
  blog: "blog",
  journal: "journal",
  research: "research",
  notes: "notes",
  report: "report",
  article: "article",
  resources: "resources",
}

const BOOT: Line[] = [
  { type: "system", text: "isaacadjei-lab v1.0.0" },
  { type: "system", text: "kernel: loading lab module..." },
  { type: "system", text: "mounting filesystem..." },
  { type: "system", text: "checking dependencies..." },
  { type: "system", text: "environment: ready" },
  { type: "blank", text: "" },
]

const JOKES = [
  "Why do programmers prefer dark mode? Because light attracts bugs.",
  "A SQL query walks into a bar, walks up to two tables and asks: can I join you?",
  "Why did the developer quit his job? Because he didn't get arrays.",
  "There are 10 types of people in the world: those who understand binary and those who don't.",
  "Why do Java developers wear glasses? Because they don't C#.",
  "How many programmers does it take to change a light bulb? None, that's a hardware problem.",
  "I would tell you a UDP joke but you might not get it.",
  "Why was the JavaScript developer sad? Because he didn't know how to 'null' his feelings.",
]

const NAV_COMMANDS: Record<string, string> = {
  about: "https://www.isaacadjei.me/about",
  projects: "https://www.isaacadjei.me/projects",
  experience: "https://www.isaacadjei.me/experience",
  skills: "https://www.isaacadjei.me/skills",
  contact: "https://www.isaacadjei.me/contact",
  links: "https://www.isaacadjei.me/links",
  cv: "https://www.isaacadjei.me/cv",
  blog: "https://www.isaacadjei.me/blog",
  notes: "https://www.isaacadjei.me/notes",
  newsletter: "https://www.isaacadjei.me/newsletter",
  github: "https://github.com/zaccessss",
  linkedin: "https://www.linkedin.com/in/isaacadjei",
}

const MAIL_COMMANDS: Record<string, string> = {
  collaborate:
    "mailto:contact@isaacadjei.me?subject=Collaboration%20Opportunity&body=Hi%20Isaac%2C%0A%0AI%20would%20love%20to%20collaborate%20with%20you%20on...%0A%0ABest%2C",
  suggest:
    "mailto:contact@isaacadjei.me?subject=Blog%20Suggestion&body=Hi%20Isaac%2C%0A%0AI%20have%20an%20idea%20for%20your%20blog%3A%0A%0A-%20Topic%3A%0A-%20Why%20it%20would%20be%20useful%3A%0A%0AThanks%2C",
}

const COMMANDS: Record<string, () => Line[]> = {
  help: () => [
    { type: "info", text: "isaacadjei-lab - available commands" },
    { type: "blank", text: "" },
    { type: "info", text: "  navigate" },
    { type: "cmd-list", text: "  about        -  open about page" },
    { type: "cmd-list", text: "  projects     -  open projects page" },
    { type: "cmd-list", text: "  experience   -  open experience page" },
    { type: "cmd-list", text: "  skills       -  open skills page" },
    { type: "cmd-list", text: "  blog         -  open blog" },
    { type: "cmd-list", text: "  notes        -  open notes" },
    { type: "cmd-list", text: "  cv           -  open CV" },
    { type: "cmd-list", text: "  contact      -  open contact form" },
    { type: "cmd-list", text: "  links        -  open links page" },
    { type: "cmd-list", text: "  newsletter   -  open newsletter page" },
    { type: "cmd-list", text: "  github       -  open GitHub profile" },
    { type: "cmd-list", text: "  linkedin     -  open LinkedIn profile" },
    { type: "blank", text: "" },
    { type: "info", text: "  writing" },
    { type: "cmd-list", text: "  posts        -  all blog entries" },
    { type: "cmd-list", text: "  live         -  published posts" },
    { type: "cmd-list", text: "  drafts       -  works in progress" },
    { type: "cmd-list", text: "  topics       -  active tags" },
    { type: "blank", text: "" },
    { type: "info", text: "  explore" },
    { type: "cmd-list", text: "  ls           -  list site sections" },
    { type: "cmd-list", text: "  pwd          -  print working directory" },
    { type: "cmd-list", text: "  man          -  manual page for isaac" },
    { type: "cmd-list", text: "  stack        -  tech stack" },
    { type: "cmd-list", text: "  build        -  what is being built" },
    { type: "cmd-list", text: "  future       -  upcoming projects" },
    { type: "cmd-list", text: "  status       -  system status" },
    { type: "cmd-list", text: "  version      -  version info" },
    { type: "cmd-list", text: "  ping         -  ping isaacadjei.me" },
    { type: "cmd-list", text: "  date         -  current date" },
    { type: "cmd-list", text: "  time         -  current time" },
    { type: "cmd-list", text: "  echo [text]  -  echo something back" },
    { type: "blank", text: "" },
    { type: "info", text: "  connect" },
    { type: "cmd-list", text: "  collaborate  -  email for collaboration" },
    { type: "cmd-list", text: "  suggest      -  send a blog suggestion" },
    { type: "blank", text: "" },
    { type: "info", text: "  discover" },
    { type: "cmd-list", text: "  whoami       -  identity check" },
    { type: "cmd-list", text: "  ghana        -  origin story" },
    { type: "cmd-list", text: "  faith        -  what drives it all" },
    { type: "cmd-list", text: "  dad          -  in memory" },
    { type: "cmd-list", text: "  music        -  what I listen to" },
    { type: "cmd-list", text: "  coffee       -  fuel of choice" },
    { type: "cmd-list", text: "  motto        -  quick motivation" },
    { type: "cmd-list", text: "  joke         -  one for the road" },
    { type: "cmd-list", text: "  hack         -  do not" },
    { type: "cmd-list", text: "  sudo         -  definitely do not" },
    { type: "cmd-list", text: "  zac          -  easter egg" },
    { type: "cmd-list", text: "  clear        -  clear terminal" },
  ],

  ls: () => [
    { type: "info", text: "isaacadjei.me - directory listing" },
    { type: "blank", text: "" },
    { type: "output", text: "  drwxr-xr-x  /about        who I am" },
    { type: "output", text: "  drwxr-xr-x  /projects     things I built" },
    { type: "output", text: "  drwxr-xr-x  /experience   where I have worked" },
    { type: "output", text: "  drwxr-xr-x  /skills       what I can do" },
    { type: "output", text: "  drwxr-xr-x  /blog         things I write" },
    { type: "output", text: "  drwxr-xr-x  /notes        what I am thinking" },
    { type: "output", text: "  drwxr-xr-x  /cv           download my CV" },
    { type: "output", text: "  drwxr-xr-x  /contact      get in touch" },
    { type: "output", text: "  drwxr-xr-x  /newsletter   stay updated" },
    { type: "output", text: "  drwxr-xr-x  /lab          you are here" },
  ],

  pwd: () => [
    { type: "output", text: "/lab" },
  ],

  man: () => [
    { type: "info", text: "MANUAL PAGE - isaac(1)" },
    { type: "blank", text: "" },
    { type: "output", text: "  NAME" },
    { type: "output", text: "       isaac - electronic engineer and developer" },
    { type: "blank", text: "" },
    { type: "output", text: "  SYNOPSIS" },
    { type: "output", text: "       isaac [--build | --learn | --collaborate]" },
    { type: "blank", text: "" },
    { type: "output", text: "  DESCRIPTION" },
    { type: "output", text: "       Isaac Adjei (Zac) is an Electronic Engineering and" },
    { type: "output", text: "       Computer Science student at Aston University, Birmingham." },
    { type: "output", text: "       He works across bare-metal C, embedded systems, full-stack" },
    { type: "output", text: "       web and machine learning. He builds things that move from" },
    { type: "output", text: "       concept to code to real tangible output." },
    { type: "blank", text: "" },
    { type: "output", text: "  OPTIONS" },
    { type: "output", text: "       --build        currently building things that matter" },
    { type: "output", text: "       --learn        always learning something new" },
    { type: "output", text: "       --collaborate  open to internships and collaboration" },
    { type: "blank", text: "" },
    { type: "output", text: "  SEE ALSO" },
    { type: "output", text: "       projects(1), cv(1), contact(1), blog(1)" },
    { type: "blank", text: "" },
    { type: "output", text: "  AUTHOR" },
    { type: "output", text: "       Isaac Adjei <contact@isaacadjei.me>" },
  ],

  stack: () => [
    { type: "info", text: "tech stack" },
    { type: "blank", text: "" },
    { type: "kv", text: "  Languages    C, C++, Python, JavaScript, TypeScript, Java" },
    { type: "kv", text: "  Embedded     AVR, Arduino, ESP32, STM32, ARM Cortex-M" },
    { type: "kv", text: "  Web          Next.js, React, FastAPI, PHP, MySQL" },
    { type: "kv", text: "  ML           Python, TensorFlow, PyTorch, scikit-learn" },
    { type: "kv", text: "  Tools        Git, Docker, Proteus, KiCad, MATLAB" },
    { type: "kv", text: "  Cloud        AWS (learning), Vercel, Railway" },
    { type: "kv", text: "  Learning     Rust, cyber security, cloud architecture" },
  ],

  build: () => [
    { type: "info", text: "currently building" },
    { type: "blank", text: "" },
    { type: "output", text: "  → avr-zac" },
    { type: "output", text: "    bare metal AVR C on ATmega644P" },
    { type: "output", text: "    nine-mode state machine, interrupts, PWM, ADC" },
    { type: "blank", text: "" },
    { type: "output", text: "  → ba-from-data-to-decisions" },
    { type: "output", text: "    business analytics learning site" },
    { type: "output", text: "    probability → ML → prescriptive optimisation" },
    { type: "blank", text: "" },
    { type: "output", text: "  → this portfolio" },
    { type: "output", text: "    always improving, always shipping" },
  ],

  future: () => [
    { type: "info", text: "upcoming projects" },
    { type: "blank", text: "" },
    { type: "output", text: "  [ planned ]  World Cup 2026 AI Predictor" },
    { type: "output", text: "               ML model trained on all historical WC data" },
    { type: "output", text: "               group stage + knockout + winner predictions" },
    { type: "output", text: "               deployed as a public web app" },
    { type: "blank", text: "" },
    { type: "output", text: "  [ research ] Ocular Prosthetics and Health Technology" },
    { type: "output", text: "               deep research into retinoblastoma" },
    { type: "output", text: "               bio-integrated electronics and smart implants" },
    { type: "output", text: "               personal motivation drives this one" },
  ],

  version: () => [
    { type: "info", text: "isaacadjei-lab v1.0.0" },
    { type: "blank", text: "" },
    { type: "kv", text: "  built with   Next.js 16, TypeScript, Tailwind CSS" },
    { type: "kv", text: "  deployed on  Vercel" },
    { type: "kv", text: "  domain       isaacadjei.me" },
    { type: "kv", text: "  license      all rights reserved" },
  ],

  ping: () => [
    { type: "info", text: "PING isaacadjei.me" },
    { type: "blank", text: "" },
    { type: "output", text: "  64 bytes from isaacadjei.me: time=1ms ttl=64" },
    { type: "output", text: "  64 bytes from isaacadjei.me: time=1ms ttl=64" },
    { type: "output", text: "  64 bytes from isaacadjei.me: time=1ms ttl=64" },
    { type: "blank", text: "" },
    { type: "output", text: "  3 packets transmitted, 3 received, 0% packet loss" },
    { type: "success", text: "  site is live and responsive" },
  ],

  date: () => [
    { type: "kv", text: `  date      ${new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}` },
  ],

  time: () => [
    { type: "kv", text: `  time      ${new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" })} (local)` },
  ],

  whoami: () => [
    { type: "info", text: "identity check" },
    { type: "blank", text: "" },
    { type: "kv", text: "  name      Isaac Adjei (Zac)" },
    { type: "kv", text: "  role      Electronic Engineering and CS student" },
    { type: "kv", text: "  location  Birmingham and London, UK" },
    { type: "kv", text: "  origin    Ghana" },
    { type: "kv", text: "  uni       Aston University" },
    { type: "kv", text: "  email     contact@isaacadjei.me" },
    { type: "kv", text: "  web       isaacadjei.me" },
    { type: "blank", text: "" },
    { type: "output", text: "  building at the intersection of hardware and software" },
  ],

  ghana: () => [
    { type: "info", text: "origin" },
    { type: "blank", text: "" },
    { type: "output", text: "  Ghana                         " },
    { type: "output", text: "  Adisadel College, Cape Coast  " },
    { type: "blank", text: "" },
    { type: "output", text: "  Vel Primus, Vel Cum Primis" },
    { type: "output", text: "  Either the first, or with the first." },
    { type: "blank", text: "" },
    { type: "output", text: "  HVAC Technician · 2019-2021" },
    { type: "output", text: "  The place that shaped everything." },
  ],

  faith: () => [
    { type: "blank", text: "" },
    { type: "info", text: '  "Trust in the Lord with all your heart' },
    { type: "info", text: "   and lean not on your own understanding." },
    { type: "info", text: "   In all your ways submit to him," },
    { type: "info", text: '   and he will make your paths straight."' },
    { type: "blank", text: "" },
    { type: "output", text: "                                    Proverbs 3:5-6" },
    { type: "blank", text: "" },
    { type: "output", text: "  faith is not a footnote. it runs through everything." },
  ],

  dad: () => [
    { type: "blank", text: "" },
    { type: "info", text: "  in memory of my father." },
    { type: "blank", text: "" },
    { type: "output", text: "  mechanical and refrigeration engineer." },
    { type: "output", text: "  the man who showed me what it means" },
    { type: "output", text: "  to build things with your hands." },
    { type: "blank", text: "" },
    { type: "info", text: '  "Always strive to make things better."' },
    { type: "blank", text: "" },
    { type: "output", text: "  this terminal runs partly on his words." },
  ],

  music: () => [
    { type: "info", text: "currently listening to" },
    { type: "blank", text: "" },
    { type: "output", text: "  → Gospel and Contemporary Christian" },
    { type: "output", text: "  → Afrobeats and Highlife" },
    { type: "output", text: "  → Lo-fi for focus sessions" },
    { type: "output", text: "  → Piano (also playing, not just listening)" },
    { type: "blank", text: "" },
    { type: "output", text: '  "music is engineering for the ears."' },
  ],

  coffee: () => [
    { type: "info", text: "brewing..." },
    { type: "blank", text: "" },
    { type: "output", text: "  loading   [==========] 100%" },
    { type: "blank", text: "" },
    { type: "success", text: "  black coffee. no sugar. no milk." },
    { type: "output", text: "  consistency fuel since 2019." },
  ],

  motto: () => [
    { type: "blank", text: "" },
    { type: "info", text: '  "The people who are crazy enough to think they' },
    { type: "info", text: '   can change the world are the ones who do."' },
    { type: "blank", text: "" },
    { type: "output", text: "                                        Steve Jobs" },
    { type: "blank", text: "" },
  ],

  joke: () => {
    const joke = JOKES[Math.floor(Math.random() * JOKES.length)]
    return [
      { type: "blank", text: "" },
      { type: "info", text: `  ${joke}` },
      { type: "blank", text: "" },
    ]
  },

  hack: () => [
    { type: "info", text: "initiating sequence..." },
    { type: "output", text: "  > accessing mainframe..." },
    { type: "output", text: "  > bypassing firewall..." },
    { type: "output", text: "  > decrypting vault..." },
    { type: "blank", text: "" },
    { type: "error", text: "  ERROR 403: this terminal respects the law" },
    { type: "blank", text: "" },
    { type: "output", text: "  nice try though." },
  ],

  posts: () => [
    { type: "info", text: `writing queue  (${posts.length} entries)` },
    { type: "blank", text: "" },
    ...posts.map((p) => ({
      type: "output" as LineType,
      text: `  [${TYPE_LABEL[p.type] ?? p.type}]  ${p.title}${p.published ? "  ● live" : "  • draft"}`,
    })),
    { type: "blank", text: "" },
    { type: "output", text: "  tip: run 'live' to get direct slugs" },
  ],

  live: () => {
    const published = posts.filter((p) => p.published)
    return [
      { type: "info", text: `published now  (${published.length})` },
      { type: "blank", text: "" },
      ...published.map((p) => ({
        type: "output" as LineType,
        text: `  → /blog/${p.slug}`,
      })),
    ]
  },

  drafts: () => {
    const draft = posts.filter((p) => !p.published)
    return [
      { type: "info", text: `draft pipeline  (${draft.length})` },
      { type: "blank", text: "" },
      ...draft.map((p) => ({
        type: "output" as LineType,
        text: `  [${TYPE_LABEL[p.type] ?? p.type}]  ${p.title}`,
      })),
      { type: "blank", text: "" },
      { type: "output", text: "  more in progress - watch this space" },
    ]
  },

  topics: () => {
    const tags = Array.from(new Set(posts.flatMap((p) => p.tags))).sort((a, b) =>
      a.localeCompare(b)
    )
    return [
      { type: "info", text: `active tags  (${tags.length})` },
      { type: "blank", text: "" },
      { type: "output", text: `  ${tags.join("  ·  ")}` },
    ]
  },

  now: () => [
    { type: "info", text: "writing now" },
    { type: "blank", text: "" },
    { type: "output", text: "  → journal entries from uni and placements" },
    { type: "output", text: "  → practical engineering write-ups" },
    { type: "output", text: "  → notes from labs and projects" },
    { type: "output", text: "  → reflections from virtual experiences" },
  ],

  status: () => [
    { type: "info", text: "system status" },
    { type: "blank", text: "" },
    { type: "kv", text: "  isaacadjei-lab v1.0.0         running" },
    { type: "kv", text: "  portfolio                     live at isaacadjei.me" },
    { type: "kv", text: "  blog                          active" },
    { type: "kv", text: "  newsletter                    live via Beehiiv" },
    { type: "kv", text: "  avr-zac project               in progress" },
    { type: "kv", text: "  ba-from-data-to-decisions     in progress" },
    { type: "blank", text: "" },
    { type: "success", text: "  all systems operational" },
  ],

  zac: () => [
    { type: "success", text: "ACCESS GRANTED." },
    { type: "blank", text: "" },
    { type: "output", text: "  welcome to the inner circle." },
    { type: "output", text: "  curiosity stat: +1" },
    { type: "output", text: "  perseverance stat: already maxed." },
    { type: "blank", text: "" },
    { type: "output", text: "  you found it. now go build something." },
  ],

  sudo: () => [
    { type: "error", text: "sudo: permission denied" },
    { type: "blank", text: "" },
    { type: "output", text: "  this terminal respects least privilege." },
    { type: "output", text: "  nice try." },
  ],

  about: () => [
    { type: "info", text: "opening: isaacadjei.me/about" },
    { type: "output", text: "launching in new tab..." },
  ],
  projects: () => [
    { type: "info", text: "opening: isaacadjei.me/projects" },
    { type: "output", text: "launching in new tab..." },
  ],
  experience: () => [
    { type: "info", text: "opening: isaacadjei.me/experience" },
    { type: "output", text: "launching in new tab..." },
  ],
  skills: () => [
    { type: "info", text: "opening: isaacadjei.me/skills" },
    { type: "output", text: "launching in new tab..." },
  ],
  contact: () => [
    { type: "info", text: "opening: isaacadjei.me/contact" },
    { type: "output", text: "launching in new tab..." },
    { type: "output", text: "use the form for collaboration, research and project work" },
  ],
  links: () => [
    { type: "info", text: "opening: isaacadjei.me/links" },
    { type: "output", text: "launching in new tab..." },
  ],
  cv: () => [
    { type: "info", text: "opening: isaacadjei.me/cv" },
    { type: "output", text: "launching in new tab..." },
  ],
  blog: () => [
    { type: "info", text: "opening: isaacadjei.me/blog" },
    { type: "output", text: "launching in new tab..." },
  ],
  notes: () => [
    { type: "info", text: "opening: isaacadjei.me/notes" },
    { type: "output", text: "launching in new tab..." },
  ],
  newsletter: () => [
    { type: "info", text: "opening: isaacadjei.me/newsletter" },
    { type: "output", text: "launching in new tab..." },
  ],
  github: () => [
    { type: "info", text: "opening: github.com/zaccessss" },
    { type: "output", text: "launching in new tab..." },
  ],
  linkedin: () => [
    { type: "info", text: "opening: linkedin.com/in/isaacadjei" },
    { type: "output", text: "launching in new tab..." },
  ],
  collaborate: () => [
    { type: "info", text: "opening mail client" },
    { type: "output", text: "  to:      contact@isaacadjei.me" },
    { type: "output", text: "  subject: Collaboration Opportunity" },
  ],
  suggest: () => [
    { type: "info", text: "opening mail client" },
    { type: "output", text: "  to:      contact@isaacadjei.me" },
    { type: "output", text: "  subject: Blog Suggestion" },
  ],
}

function renderLine(line: Line, i: number) {
  if (line.type === "blank") return <div key={i} className="h-2" />

  if (line.type === "cmd-echo") {
    return (
      <div key={i} className="flex items-baseline gap-1.5 font-mono text-xs mt-1">
        <span className="text-cyan-400 shrink-0">{HOST}</span>
        <span className="text-green-400 shrink-0">$</span>
        <span className="text-amber-300">{line.text}</span>
      </div>
    )
  }

  // kv: "  key      value" - key in cyan, value in amber
  if (line.type === "kv") {
    const idx = line.text.search(/\s{2,}/)
    if (idx > -1) {
      const indent = line.text.slice(0, line.text.search(/\S/))
      const rest = line.text.trimStart()
      const spaceIdx = rest.search(/\s{2,}/)
      if (spaceIdx > -1) {
        const key = rest.slice(0, spaceIdx)
        const val = rest.slice(spaceIdx).trimStart()
        return (
          <div key={i} className="font-mono text-xs leading-relaxed">
            <span className="text-zinc-600">{indent}</span>
            <span className="text-cyan-400">{key}</span>
            <span className="text-zinc-700">{"  "}</span>
            <span className="text-amber-300">{val}</span>
          </div>
        )
      }
    }
    return <div key={i} className="font-mono text-xs leading-relaxed text-amber-300">{line.text}</div>
  }

  // cmd-list: "  command   -  description" - command in green, dash in zinc, description in zinc-400
  if (line.type === "cmd-list") {
    const match = line.text.match(/^(\s*)(\S+)(\s+-\s+)(.*)$/)
    if (match) {
      return (
        <div key={i} className="font-mono text-xs leading-relaxed">
          <span className="text-zinc-600">{match[1]}</span>
          <span className="text-green-400 font-semibold">{match[2]}</span>
          <span className="text-zinc-600">{match[3]}</span>
          <span className="text-zinc-400">{match[4]}</span>
        </div>
      )
    }
  }

  const cls =
    line.type === "system"
      ? "text-zinc-600"
      : line.type === "info"
        ? "text-cyan-400"
        : line.type === "error"
          ? "text-red-400"
          : line.type === "success"
            ? "text-green-400"
            : "text-amber-300"

  // Split on → and ● live for colour, and highlight 'help' in amber with bold
  const parts = line.text.split(/(→|● live|'help')/)
  return (
    <div key={i} className={`font-mono text-xs leading-relaxed ${cls}`}>
      {parts.map((part, j) =>
        part === "→" ? (
          <span key={j} className="text-cyan-400">{"→"}</span>
        ) : part === "● live" ? (
          <span key={j} className="text-green-400">{"● live"}</span>
        ) : part === "'help'" ? (
          <span key={j} className="text-green-400 font-bold tracking-wide">{'help'}</span>
        ) : (
          <span key={j}>{part}</span>
        )
      )}
    </div>
  )
}

export default function LabPage() {
  const [lines, setLines] = useState<Line[]>([])
  const [booted, setBooted] = useState(false)
  const [inputVal, setInputVal] = useState("")
  const [cmdHistory, setCmdHistory] = useState<string[]>([])
  const [histIdx, setHistIdx] = useState(-1)
  const [winState, setWinState] = useState<WindowState>("normal")
  const inputRef = useRef<HTMLInputElement>(null)
  const bodyRef = useRef<HTMLDivElement>(null)
  const liveRegionRef = useRef<HTMLDivElement>(null)
  const { modLabel } = useModKey()

  useEffect(() => {
    let i = 0
    const timer = setInterval(() => {
      if (i < BOOT.length) {
        const line = BOOT[i]
        i++
        setLines((prev) => [...prev, line])
      } else {
        clearInterval(timer)
        setTimeout(() => {
          setBooted(true)
          setLines((prev) => [
            ...prev,
            { type: "output", text: "session initialised. type 'help' to explore." },
            { type: "output", text: "try: ls, man, stack, build, future, faith, dad" },
            { type: "blank", text: "" },
          ])
        }, 350)
      }
    }, 110)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight
  }, [lines, inputVal])

  const execCommand = useCallback((raw: string) => {
    const trimmed = raw.trim()
    const cmd = trimmed.toLowerCase()

    if (!cmd) {
      setLines((prev) => [...prev, { type: "blank", text: "" }])
      return
    }

    setCmdHistory((prev) => [trimmed, ...prev])
    setHistIdx(-1)

    if (cmd === "clear") {
      setLines([])
      setInputVal("")
      return
    }

    // echo command
    if (cmd.startsWith("echo ")) {
      const text = trimmed.slice(5)
      setLines((prev) => [
        ...prev,
        { type: "cmd-echo", text: trimmed },
        { type: "output", text: `  ${text}` },
        { type: "blank", text: "" },
      ])
      setInputVal("")
      return
    }

    const output: Line[] = COMMANDS[cmd]
      ? COMMANDS[cmd]()
      : [
          { type: "error", text: `bash: ${cmd}: command not found` },
          { type: "output", text: "  type 'help' to see available commands" },
        ]

    const redirectUrl = NAV_COMMANDS[cmd]
    if (redirectUrl) window.open(redirectUrl, "_blank", "noopener,noreferrer")

    const mailUrl = MAIL_COMMANDS[cmd]
    if (mailUrl) window.open(mailUrl, "_blank", "noopener,noreferrer")

    // announce to screen readers
    if (liveRegionRef.current) {
      liveRegionRef.current.textContent = output.map((l) => l.text).filter(Boolean).join(" ")
    }

    setLines((prev) => [
      ...prev,
      { type: "cmd-echo", text: trimmed },
      ...output,
      { type: "blank", text: "" },
    ])
    setInputVal("")
  }, [])

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      execCommand(inputVal)
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      const idx = Math.min(histIdx + 1, cmdHistory.length - 1)
      setHistIdx(idx)
      if (cmdHistory[idx] !== undefined) setInputVal(cmdHistory[idx])
    } else if (e.key === "ArrowDown") {
      e.preventDefault()
      const idx = Math.max(histIdx - 1, -1)
      setHistIdx(idx)
      setInputVal(idx === -1 ? "" : cmdHistory[idx])
    }
  }

  const isMaximized = winState === "maximized"
  const isMinimized = winState === "minimized"
  const isClosed = winState === "closed"

  return (
    <div className="container max-w-3xl py-24 space-y-8">
      {/* Screen reader live region */}
      <div
        ref={liveRegionRef}
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      />

      {/* Under construction banner */}
      {!isMaximized && !isClosed && (
        <>
          <div className="text-center space-y-1">
            <p className="font-mono text-sm font-semibold tracking-widest uppercase text-yellow-500">
              ⚠️ lab // under construction ⚠️
            </p>
            <p className="font-mono text-xs text-muted-foreground">
              something is being built here - check back soon
            </p>
          </div>
          <div className="flex justify-center">
            <div className="rounded-lg border border-border/60 overflow-hidden">
              <Image
                src="/Media/giphy.gif"
                alt="Under construction"
                width={320}
                height={200}
                className="object-cover"
                unoptimized
              />
            </div>
          </div>
        </>
      )}

      {!isClosed ? (
        <section
          aria-label="Interactive terminal"
          className={
            isMaximized
              ? "fixed top-16 inset-x-0 bottom-0 z-50 flex flex-col font-mono"
              : "rounded-lg border border-zinc-700 overflow-hidden shadow-xl font-mono"
          }
        >
          {/* Title bar */}
          <div className="flex items-center justify-between px-4 py-2.5 bg-zinc-800 border-b border-zinc-700 shrink-0">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                title="Close terminal"
                aria-label="Close terminal"
                onClick={() => setWinState("closed")}
                className="h-3 w-3 rounded-full bg-red-500 hover:brightness-125 transition-all cursor-pointer"
              />
              <button
                type="button"
                title="Minimise terminal"
                aria-label="Minimise terminal"
                onClick={() => setWinState(isMinimized ? "normal" : "minimized")}
                className="h-3 w-3 rounded-full bg-yellow-400 hover:brightness-125 transition-all cursor-pointer"
              />
              <button
                type="button"
                title="Maximise terminal"
                aria-label="Maximise terminal"
                onClick={() => setWinState(isMaximized ? "normal" : "maximized")}
                className="h-3 w-3 rounded-full bg-green-500 hover:brightness-125 transition-all cursor-pointer"
              />
            </div>
            <span className="text-xs text-zinc-400" aria-hidden="true">
              isaacadjei@portfolio - lab - 80x24
            </span>
            <span className="w-14" />
          </div>

          {/* Terminal body */}
          {!isMinimized && (
            <div
              ref={bodyRef}
              role="log"
              aria-label="Terminal output"
              aria-live="off"
              onClick={() => inputRef.current?.focus({ preventScroll: true })}
              className={`bg-zinc-950 px-5 py-4 overflow-y-auto cursor-text select-text ${
                isMaximized ? "flex-1" : "min-h-[420px] max-h-[580px]"
              }`}
            >
              {lines.map((line, i) => renderLine(line, i))}

              {booted && (
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="text-cyan-400 font-mono text-xs shrink-0" aria-hidden="true">
                    {HOST}
                  </span>
                  <span className="text-green-400 font-mono text-xs shrink-0" aria-hidden="true">
                    $
                  </span>
                  <div className="relative flex items-center flex-1 min-w-0">
                    <input
                      ref={inputRef}
                      type="text"
                      aria-label="Terminal command input. Type a command and press Enter."
                      value={inputVal}
                      onChange={(e) => setInputVal(e.target.value)}
                      onKeyDown={onKeyDown}
                      autoComplete="off"
                      autoCorrect="off"
                      spellCheck={false}
                      className="absolute inset-0 opacity-0 w-full bg-transparent outline-none"
                    />
                    <span className="text-amber-300 font-mono text-xs whitespace-pre" aria-hidden="true">
                      {inputVal}
                    </span>
                    <span
                      className="inline-block w-[7px] h-[13px] bg-amber-400 ml-px shrink-0 animate-[blink_1s_step-end_infinite]"
                      aria-hidden="true"
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </section>
      ) : (
        <div className="flex justify-center py-4">
          <button
            type="button"
            onClick={() => setWinState("normal")}
            className="font-mono text-xs text-muted-foreground hover:text-foreground border border-border rounded px-4 py-2 transition-colors"
          >
            restore terminal ↩
          </button>
        </div>
      )}

      {!isMaximized && (
        <div className="rounded-lg border border-border/60 bg-muted/30 px-6 py-5 space-y-3">
          <p className="text-xs font-mono text-primary uppercase tracking-widest">newsletter</p>
          <p className="text-sm font-medium">Stay in the loop</p>
          <p className="text-xs text-muted-foreground">
            Notes on tech, projects and more. No spam. Unsubscribe anytime.
          </p>
          <NewsletterForm variant="compact" />
        </div>
      )}

      {!isMaximized && (
        <p className="text-center text-xs text-muted-foreground font-mono">
          use{" "}
          <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 text-[10px]">
            {modLabel}
          </kbd>{" "}
          +{" "}
          <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 text-[10px]">I</kbd>{" "}
          to navigate the site
        </p>
      )}
    </div>
  )
}
