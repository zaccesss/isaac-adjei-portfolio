"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import Image from "next/image"
import { posts } from "@/data/blog"
import { getPublishedTILEntries } from "@/data/til"
import { publications } from "@/data/respub"
import { useModKey } from "@/hooks/useModKey"
import GitHubStats from "@/components/shared/GitHubStats"
import WakatimeStats from "@/components/lab/WakatimeStats"
import SpotifyAnalytics from "@/components/lab/SpotifyAnalytics"
import GamingPanel from "@/components/lab/GamingPanel"
import BrailleDivider from "@/components/shared/marks/BrailleDivider"
import dynamic from "next/dynamic"

const PCBViewer = dynamic(() => import("@/components/lab/PCBViewer"), { ssr: false })

type WindowState = "normal" | "minimized" | "maximized" | "closed"
type LineType = "system" | "cmd-echo" | "output" | "error" | "info" | "blank" | "success" | "cmd-list" | "kv" | "link"

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
  { type: "system", text: "$ while true; do learn && build && ship; done" },
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
  blog: "https://www.isaacadjei.me/blog",
  blogfeed: "https://www.isaacadjei.me/blog/feed.xml",
  til: "https://www.isaacadjei.me/til",
  tilfeed: "https://www.isaacadjei.me/til/feed.xml",
  notes: "https://www.isaacadjei.me/notes",
  respub: "https://www.isaacadjei.me/respub",
  newsletter: "https://www.isaacadjei.me/newsletter",
  newsletterfeed: "https://www.isaacadjei.me/newsletter/feed.xml",
  consumed: "https://www.isaacadjei.me/consumed",
  tags: "https://www.isaacadjei.me/tags",
  search: "https://www.isaacadjei.me/search",
  pages: "https://www.isaacadjei.me/all-pages",
  github: "https://github.com/zaccesss",
  linkedin: "https://www.linkedin.com/in/isaacadjei",
  cv: "https://www.isaacadjei.me/api/cv-pdf",
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
    { type: "cmd-list", text: "  blogfeed     -  open blog RSS feed" },
    { type: "cmd-list", text: "  til          -  recent things I learned" },
    { type: "cmd-list", text: "  tilfeed      -  open TIL RSS feed" },
    { type: "cmd-list", text: "  notes        -  open notes" },
    { type: "cmd-list", text: "  respub       -  research and publications" },
    { type: "cmd-list", text: "  contact      -  open contact form" },
    { type: "cmd-list", text: "  links        -  open links page" },
    { type: "cmd-list", text: "  newsletter   -  open newsletter page" },
    { type: "cmd-list", text: "  newsletterfeed -  open newsletter RSS feed" },
    { type: "cmd-list", text: "  consumed      -  books, videos, podcasts and more" },
    { type: "cmd-list", text: "  tags         -  browse all topics" },
    { type: "cmd-list", text: "  search       -  search across everything" },
    { type: "cmd-list", text: "  pages        -  full directory of all public pages" },
    { type: "cmd-list", text: "  github       -  open GitHub profile" },
    { type: "cmd-list", text: "  linkedin     -  open LinkedIn profile" },
    { type: "blank", text: "" },
    { type: "info", text: "  writing" },
    { type: "cmd-list", text: "  posts        -  most read blog and TIL entries" },
    { type: "cmd-list", text: "  live         -  published posts" },
    { type: "cmd-list", text: "  drafts       -  works in progress" },
    { type: "cmd-list", text: "  topics       -  active tags" },
    { type: "blank", text: "" },
    { type: "info", text: "  explore" },
    { type: "cmd-list", text: "  ls           -  list site sections" },
    { type: "cmd-list", text: "  pwd          -  print working directory" },
    { type: "cmd-list", text: "  man          -  manual page for isaac" },
    { type: "cmd-list", text: "  stack        -  tech stack" },
    { type: "cmd-list", text: "  build        -  all active projects" },
    { type: "cmd-list", text: "  now          -  current main project" },
    { type: "cmd-list", text: "  future       -  upcoming projects" },
    { type: "cmd-list", text: "  grade        -  predicted degree classification" },
    { type: "cmd-list", text: "  uptime       -  how long this site has been live" },
    { type: "cmd-list", text: "  status       -  system status" },
    { type: "cmd-list", text: "  version      -  version info" },
    { type: "cmd-list", text: "  ping         -  ping isaacadjei.me" },
    { type: "cmd-list", text: "  rss          -  all RSS feeds" },
    { type: "cmd-list", text: "  date         -  current date" },
    { type: "cmd-list", text: "  time         -  current time" },
    { type: "cmd-list", text: "  echo [text]  -  echo something back" },
    { type: "blank", text: "" },
    { type: "info", text: "  coding stats  (live from database)" },
    { type: "cmd-list", text: "  stats        -  all-time coding overview" },
    { type: "cmd-list", text: "  streak       -  current coding streak" },
    { type: "cmd-list", text: "  today        -  coding hours in last 24h" },
    { type: "cmd-list", text: "  languages    -  top languages (30 days)" },
    { type: "cmd-list", text: "  vscode       -  editor breakdown" },
    { type: "cmd-list", text: "  os           -  operating system breakdown" },
    { type: "blank", text: "" },
    { type: "info", text: "  live" },
    { type: "cmd-list", text: "  playing      -  what I am listening to" },
    { type: "cmd-list", text: "  lastgame     -  last PS5 game" },
    { type: "cmd-list", text: "  pushed       -  last GitHub push" },
    { type: "blank", text: "" },
    { type: "info", text: "  connect" },
    { type: "cmd-list", text: "  collaborate  -  email for collaboration" },
    { type: "cmd-list", text: "  suggest      -  send a blog suggestion" },
    { type: "cmd-list", text: "  hire         -  why hire Isaac" },
    { type: "cmd-list", text: "  cv           -  download CV directly" },
    { type: "blank", text: "" },
    { type: "info", text: "  discover" },
    { type: "cmd-list", text: "  whoami       -  identity check" },
    { type: "cmd-list", text: "  ghana        -  origin story" },
    { type: "cmd-list", text: "  faith        -  what drives it all" },
    { type: "cmd-list", text: "  dad          -  in memory" },
    { type: "cmd-list", text: "  music        -  what I listen to" },
    { type: "cmd-list", text: "  coffee       -  fuel of choice" },
    { type: "cmd-list", text: "  motto        -  quick motivation" },
    { type: "cmd-list", text: "  mottos       -  all site mottos explained" },
    { type: "cmd-list", text: "  joke         -  one for the road" },
    { type: "cmd-list", text: "  hack         -  do not" },
    { type: "cmd-list", text: "  decrypt      -  classified message" },
    { type: "cmd-list", text: "  matrix       -  go deeper" },
    { type: "cmd-list", text: "  make         -  compile isaac.exe" },
    { type: "cmd-list", text: "  sudo         -  definitely do not" },
    { type: "cmd-list", text: "  approach     -  my code philosophy" },
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
    { type: "output", text: "  drwxr-xr-x  /til          things I learn" },
    { type: "output", text: "  drwxr-xr-x  /notes        what I am thinking" },
    { type: "output", text: "  drwxr-xr-x  /respub       research and publications" },
    { type: "output", text: "  drwxr-xr-x  /contact      get in touch" },
    { type: "output", text: "  drwxr-xr-x  /newsletter   stay updated" },
    { type: "output", text: "  drwxr-xr-x  /lab          you are here" },
    { type: "output", text: "  drwxr-xr-x  /consumed     books, videos, podcasts and more" },
    { type: "output", text: "  drwxr-xr-x  /tags         browse all topics" },
    { type: "output", text: "  drwxr-xr-x  /search       search across everything" },
    { type: "output", text: "  drwxr-xr-x  /all-pages    every public page" },
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
    { type: "output", text: "       projects(1), contact(1), blog(1)" },
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

  rss: () => [
    { type: "info", text: "RSS feeds - subscribe in your reader" },
    { type: "blank", text: "" },
    { type: "kv", text: "  blog        isaacadjei.me/blog/feed.xml" },
    { type: "kv", text: "  til         isaacadjei.me/til/feed.xml" },
    { type: "kv", text: "  newsletter  isaacadjei.me/newsletter/feed.xml" },
    { type: "blank", text: "" },
    { type: "output", text: "  run 'blogfeed', 'tilfeed' or 'newsletterfeed' to open a feed" },
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
    { type: "output", text: "  Either the first or with the first." },
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
    { type: "info", text: "currently building" },
    { type: "blank", text: "" },
    { type: "output", text: "  → Phaemos" },
    { type: "output", text: "    predictive maintenance platform" },
    { type: "output", text: "    FastAPI backend + Isolation Forest anomaly detection" },
    { type: "link", text: "    github.com/zaccesss/phaemos" },
    { type: "blank", text: "" },
    { type: "output", text: "  also run 'build' for all active projects" },
  ],

  grade: () => [
    { type: "info", text: "degree classification" },
    { type: "blank", text: "" },
    { type: "kv", text: "  institution   Aston University" },
    { type: "kv", text: "  programme     BEng Electronic Engineering and Computer Science" },
    { type: "link", text: "  www.aston.ac.uk/study/courses/electronic-engineering-and-computer-science-beng/" },
    { type: "kv", text: "  predicted     First Class (>=70%)" },
    { type: "kv", text: "  trajectory    on track" },
    { type: "blank", text: "" },
    { type: "output", text: '  "Vel Primus, Vel Cum Primis"' },
    { type: "output", text: "   either the first or with the first." },
  ],

  uptime: () => {
    const launched = new Date("2026-04-10")
    const ms = Date.now() - launched.getTime()
    const days = Math.floor(ms / 86400000)
    const hours = Math.floor((ms % 86400000) / 3600000)
    return [
      { type: "info", text: "portfolio uptime" },
      { type: "blank", text: "" },
      { type: "kv", text: "  online since   10 Apr 2026" },
      { type: "kv", text: `  uptime         ${days} days, ${hours} hours` },
      { type: "kv", text: "  host           Vercel Edge Network" },
      { type: "kv", text: "  status         all systems operational" },
      { type: "blank", text: "" },
      { type: "success", text: "  site is live at isaacadjei.me" },
    ]
  },


  mottos: () => [
    { type: "info", text: "site mottos - scattered across isaacadjei.me" },
    { type: "blank", text: "" },
    { type: "kv", text: "  boot        $ while true; do learn && build && ship; done" },
    { type: "output", text: "               the dev lifecycle in an infinite loop, no exit condition" },
    { type: "blank", text: "" },
    { type: "kv", text: "  github      $ git push origin career --force" },
    { type: "output", text: "               overwrite self-doubt with output" },
    { type: "blank", text: "" },
    { type: "kv", text: "  coding      $ rm -rf impostor_syndrome && touch grass" },
    { type: "output", text: "               delete the inner critic, touch reality" },
    { type: "blank", text: "" },
    { type: "kv", text: "  internship  $ ssh internship@2026 -i private_key.pem" },
    { type: "output", text: "               connecting to the next chapter" },
    { type: "blank", text: "" },
    { type: "kv", text: "  approach    // $ nohup hustle && disown impostor_syndrome" },
    { type: "output", text: "               run hustle in the background, detach self-doubt" },
  ],

  hire: () => [
    { type: "info", text: "why hire Isaac" },
    { type: "blank", text: "" },
    { type: "output", text: "  → BEng Electronic Engineering and Computer Science, Aston University" },
    { type: "output", text: "    predicted First Class" },
    { type: "blank", text: "" },
    { type: "output", text: "  → full stack: C, TypeScript, Python, Next.js, embedded systems" },
    { type: "output", text: "  → hardware: KiCad PCB design, AVR, ARM Cortex-M, ESP32" },
    { type: "output", text: "  → ML: TensorFlow, PyTorch, scikit-learn, anomaly detection" },
    { type: "blank", text: "" },
    { type: "output", text: "  → builds: Phaemos, avr-zac, Zaccess, open-source Git course" },
    { type: "output", text: "  → seeking 2026/2027 placement or internship" },
    { type: "blank", text: "" },
    { type: "kv", text: "  email    contact@isaacadjei.me" },
    { type: "kv", text: "  cv       run 'cv' to download" },
    { type: "kv", text: "  web      isaacadjei.me" },
  ],

  cv: () => [
    { type: "info", text: "downloading CV..." },
    { type: "blank", text: "" },
    { type: "output", text: "  opening isaacadjei.me/api/cv-pdf" },
    { type: "blank", text: "" },
    { type: "success", text: "  CV download started" },
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
    { type: "blank", text: "" },
    { type: "output", text: "  $ ssh internship@2026 -i private_key.pem" },
  ],

  approach: () => [
    { type: "info", text: "// my approach" },
    { type: "output", text: "  bool struggling = true;" },
    { type: "output", text: "  bool failing    = true;" },
    { type: "output", text: "  while (struggling || failing) {" },
    { type: "output", text: "      learn();      // Grow from the struggle" },
    { type: "output", text: "      retry();      // Push through failure" },
    { type: "output", text: "  }" },
    { type: "output", text: "  thrive();         // Embrace growth" },
    { type: "output", text: "  succeed();        // Achieve the goal" },
    { type: "output", text: '  printf("Mission accomplished.\\n");  // Celebrate victory' },
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
  blog: () => [
    { type: "info", text: "opening: isaacadjei.me/blog" },
    { type: "output", text: "launching in new tab..." },
  ],
  blogfeed: () => [
    { type: "info", text: "opening: isaacadjei.me/blog/feed.xml" },
    { type: "output", text: "launching in new tab..." },
  ],
  tilfeed: () => [
    { type: "info", text: "opening: isaacadjei.me/til/feed.xml" },
    { type: "output", text: "launching in new tab..." },
  ],
  til: () => {
    const entries = getPublishedTILEntries()
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5)
    return [
      { type: "info", text: `til - things I learned  (${getPublishedTILEntries().length} total)` },
      { type: "blank", text: "" },
      ...entries.map((e) => ({
        type: "output" as LineType,
        text: `  [${e.category}]  ${e.title}  · ${e.date}`,
      })),
      { type: "blank", text: "" },
      { type: "output", text: "  → isaacadjei.me/til" },
    ]
  },
  respub: () => [
    { type: "info", text: `research and publications  (${publications.length})` },
    { type: "blank", text: "" },
    ...publications.map((p) => ({
      type: "output" as LineType,
      text: `  [${p.year}]  ${p.title}  · ${p.venue}`,
    })),
    { type: "blank", text: "" },
    { type: "output", text: "  → isaacadjei.me/respub" },
  ],
  notes: () => [
    { type: "info", text: "opening: isaacadjei.me/notes" },
    { type: "output", text: "launching in new tab..." },
  ],
  newsletter: () => [
    { type: "info", text: "opening: isaacadjei.me/newsletter" },
    { type: "output", text: "launching in new tab..." },
  ],
  newsletterfeed: () => [
    { type: "info", text: "opening: isaacadjei.me/newsletter/feed.xml" },
    { type: "output", text: "launching in new tab..." },
  ],
  consumed: () => [
    { type: "info", text: "opening: isaacadjei.me/consumed" },
    { type: "output", text: "launching in new tab..." },
    { type: "output", text: "books, videos, podcasts, articles and resources" },
  ],
  pages: () => [
    { type: "info", text: "opening: isaacadjei.me/all-pages" },
    { type: "output", text: "launching in new tab..." },
    { type: "output", text: "every public page on this site in one place" },
  ],
  github: () => [
    { type: "info", text: "opening: github.com/zaccesss" },
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

// Theatrical commands play out line by line with real delays - each entry has a line and ms offset from command invocation.
type TheatricalStep = { line: Line; delay: number }
const THEATRICAL_COMMANDS: Record<string, TheatricalStep[]> = {
  hack: [
    { line: { type: "info",   text: "initiating sequence..." },                        delay: 0 },
    { line: { type: "output", text: "  > accessing mainframe..." },                    delay: 500 },
    { line: { type: "output", text: "  > bypassing firewall..." },                     delay: 1100 },
    { line: { type: "output", text: "  > decrypting vault..." },                       delay: 1800 },
    { line: { type: "blank",  text: "" },                                              delay: 2400 },
    { line: { type: "error",  text: "  ERROR 403: this terminal respects the law" },   delay: 2600 },
    { line: { type: "blank",  text: "" },                                              delay: 2600 },
    { line: { type: "output", text: "  nice try though." },                            delay: 2900 },
  ],

  coffee: [
    { line: { type: "info",    text: "brewing..." },                             delay: 0 },
    { line: { type: "blank",   text: "" },                                       delay: 300 },
    { line: { type: "output",  text: "  [          ] 0%" },                      delay: 400 },
    { line: { type: "output",  text: "  [==        ] 20%" },                     delay: 750 },
    { line: { type: "output",  text: "  [====      ] 40%" },                     delay: 1100 },
    { line: { type: "output",  text: "  [======    ] 60%" },                     delay: 1450 },
    { line: { type: "output",  text: "  [========  ] 80%" },                     delay: 1800 },
    { line: { type: "output",  text: "  [==========] 100%" },                    delay: 2150 },
    { line: { type: "blank",   text: "" },                                       delay: 2400 },
    { line: { type: "success", text: "  black coffee. no sugar. no milk." },     delay: 2600 },
    { line: { type: "output",  text: "  consistency fuel since 2019." },         delay: 2900 },
  ],

  decrypt: [
    { line: { type: "info",    text: "initiating decryption sequence..." },             delay: 0 },
    { line: { type: "blank",   text: "" },                                             delay: 300 },
    { line: { type: "output",  text: "  [###       ] decrypting block 1 of 3..." },    delay: 500 },
    { line: { type: "output",  text: "  [######    ] decrypting block 2 of 3..." },    delay: 1100 },
    { line: { type: "output",  text: "  [##########] decryption complete" },           delay: 1800 },
    { line: { type: "blank",   text: "" },                                             delay: 2100 },
    { line: { type: "success", text: "  ACCESS GRANTED" },                             delay: 2300 },
    { line: { type: "blank",   text: "" },                                             delay: 2500 },
    { line: { type: "info",    text: '  "build things that matter.' },                 delay: 2700 },
    { line: { type: "info",    text: '   everything else is noise."' },                delay: 3000 },
  ],

  matrix: [
    { line: { type: "system",  text: "01001000 01000101 01001100 01001100 01001111" }, delay: 0 },
    { line: { type: "system",  text: "01010000 01001000 01000001 01000101 01001101" }, delay: 300 },
    { line: { type: "system",  text: "01001111 01010011 00101011 00101011 01000011" }, delay: 600 },
    { line: { type: "blank",   text: "" },                                             delay: 900 },
    { line: { type: "success", text: "  wake up, Neo. the matrix has you." },          delay: 1100 },
    { line: { type: "blank",   text: "" },                                             delay: 1300 },
    { line: { type: "output",  text: "  jk. welcome to isaac's lab." },               delay: 1500 },
    { line: { type: "output",  text: "  you're already in the simulation." },          delay: 1800 },
  ],

  sudo: [
    { line: { type: "output",  text: "  [sudo] password for isaac:" },                delay: 0 },
    { line: { type: "output",  text: "  authenticating..." },                         delay: 800 },
    { line: { type: "blank",   text: "" },                                             delay: 1400 },
    { line: { type: "error",   text: "  sudo: permission denied" },                   delay: 1600 },
    { line: { type: "blank",   text: "" },                                             delay: 1600 },
    { line: { type: "output",  text: "  this terminal respects least privilege." },   delay: 1900 },
    { line: { type: "output",  text: "  nice try." },                                 delay: 2100 },
  ],

  zac: [
    { line: { type: "output",  text: "  scanning retina..." },                        delay: 0 },
    { line: { type: "output",  text: "  verifying identity..." },                     delay: 700 },
    { line: { type: "blank",   text: "" },                                             delay: 1300 },
    { line: { type: "success", text: "  ACCESS GRANTED." },                           delay: 1500 },
    { line: { type: "blank",   text: "" },                                             delay: 1700 },
    { line: { type: "output",  text: "  welcome to the inner circle." },              delay: 1900 },
    { line: { type: "output",  text: "  curiosity stat: +1" },                       delay: 2100 },
    { line: { type: "output",  text: "  perseverance stat: already maxed." },        delay: 2300 },
    { line: { type: "blank",   text: "" },                                             delay: 2500 },
    { line: { type: "output",  text: "  you found it. now go build something." },    delay: 2700 },
  ],

  make: [
    { line: { type: "info",    text: "building isaac..." },                            delay: 0 },
    { line: { type: "blank",   text: "" },                                             delay: 200 },
    { line: { type: "output",  text: "  CC     isaac.c -O2 -Wall" },                  delay: 350 },
    { line: { type: "output",  text: "  CC     curiosity.c -O2" },                    delay: 650 },
    { line: { type: "output",  text: "  CC     resilience.c -O2" },                   delay: 950 },
    { line: { type: "output",  text: "  LINK   isaac.o curiosity.o resilience.o" },   delay: 1350 },
    { line: { type: "output",  text: "  BUILD  isaac.exe" },                          delay: 1750 },
    { line: { type: "blank",   text: "" },                                             delay: 2100 },
    { line: { type: "output",  text: "  [##########] 100% build succeeded" },         delay: 2300 },
    { line: { type: "blank",   text: "" },                                             delay: 2600 },
    { line: { type: "success", text: "  ./isaac --mode=production --target=internship" }, delay: 2800 },
    { line: { type: "success", text: "  isaac deployed successfully." },               delay: 3100 },
  ],
}

function fmtSec(s: number): string {
  if (s < 60) return `${s}s`
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  if (h === 0) return `${m}m`
  if (m === 0) return `${h}h`
  return `${h}h ${m}m`
}

function pctOf(part: number, total: number): string {
  if (total === 0) return "0%"
  return `${Math.round((part / total) * 100)}%`
}

const ASYNC_COMMANDS: Record<string, () => Promise<Line[]>> = {
  posts: async () => {
    const r = await fetch("/api/top-content")
    if (!r.ok) throw new Error("fetch failed")
    const d = await r.json() as {
      topBlog: { slug: string; reads: number; title: string }[]
      topTil: { slug: string; reads: number; title: string }[]
    }
    const lines: Line[] = [{ type: "info", text: "most read content" }, { type: "blank", text: "" }]
    if (d.topBlog.length > 0) {
      lines.push({ type: "info", text: "  blog posts" })
      for (const p of d.topBlog) {
        lines.push({ type: "output", text: `  [${p.reads} reads]  ${p.title}` })
      }
      lines.push({ type: "blank", text: "" })
    }
    if (d.topTil.length > 0) {
      lines.push({ type: "info", text: "  til entries" })
      for (const t of d.topTil) {
        lines.push({ type: "output", text: `  [${t.reads} reads]  ${t.title}` })
      }
      lines.push({ type: "blank", text: "" })
    }
    if (d.topBlog.length === 0 && d.topTil.length === 0) {
      lines.push({ type: "output", text: "  no read data yet - check back later" })
      lines.push({ type: "blank", text: "" })
    }
    lines.push({ type: "output", text: "  → isaacadjei.me/blog" })
    lines.push({ type: "output", text: "  → isaacadjei.me/til" })
    return lines
  },

  stats: async () => {
    const r = await fetch("/api/wakatime-stats?period=all")
    if (!r.ok) throw new Error("fetch failed")
    const d = await r.json() as {
      totalSeconds: number; dailyAvgSeconds: number; activeDays: number
      bestDaySeconds: number; bestDayDate: string; codingStreak: number
    }
    if (!("totalSeconds" in d)) throw new Error("invalid response")
    return [
      { type: "info", text: "coding stats - all time" },
      { type: "blank", text: "" },
      { type: "kv", text: `  total time    ${fmtSec(d.totalSeconds)}` },
      { type: "kv", text: `  daily avg     ${fmtSec(d.dailyAvgSeconds)}` },
      { type: "kv", text: `  active days   ${d.activeDays}` },
      { type: "kv", text: `  best day      ${fmtSec(d.bestDaySeconds)}${d.bestDayDate ? ` (${d.bestDayDate})` : ""}` },
      { type: "kv", text: `  streak        ${d.codingStreak} day${d.codingStreak !== 1 ? "s" : ""}` },
      { type: "blank", text: "" },
      { type: "output", text: "  run 'languages', 'vscode', 'os' for breakdowns" },
    ]
  },

  streak: async () => {
    const r = await fetch("/api/wakatime-stats?period=all")
    if (!r.ok) throw new Error("fetch failed")
    const d = await r.json() as { codingStreak: number; activeDays: number }
    if (!("codingStreak" in d)) throw new Error("invalid response")
    const active = d.codingStreak > 0
    return [
      { type: "info", text: "coding streak" },
      { type: "blank", text: "" },
      { type: "kv", text: `  current       ${d.codingStreak} day${d.codingStreak !== 1 ? "s" : ""}` },
      { type: "kv", text: `  status        ${active ? "active" : "build something today"}` },
      { type: "blank", text: "" },
      active
        ? { type: "success", text: "  keep shipping." }
        : { type: "output", text: "  streaks are rebuilt one commit at a time." },
    ]
  },

  today: async () => {
    const r = await fetch("/api/wakatime-stats?period=24h")
    if (!r.ok) throw new Error("fetch failed")
    const d = await r.json() as {
      totalSeconds: number
      languages: { name: string; total_seconds: number }[]
      projects: { name: string; total_seconds: number }[]
    }
    if (!("totalSeconds" in d)) throw new Error("invalid response")
    const topLang = d.languages?.[0]
    const topProj = d.projects?.[0]
    return [
      { type: "info", text: "coding today - last 24 hours" },
      { type: "blank", text: "" },
      { type: "kv", text: `  time coded    ${fmtSec(d.totalSeconds)}` },
      ...(topLang ? [{ type: "kv" as LineType, text: `  top language  ${topLang.name}  (${fmtSec(topLang.total_seconds)})` }] : []),
      ...(topProj ? [{ type: "kv" as LineType, text: `  top project   ${topProj.name}  (${fmtSec(topProj.total_seconds)})` }] : []),
      { type: "blank", text: "" },
      d.totalSeconds > 0
        ? { type: "success", text: "  coding today. good." }
        : { type: "output", text: "  no coding recorded yet today." },
    ]
  },

  languages: async () => {
    const r = await fetch("/api/wakatime-stats?period=30d")
    if (!r.ok) throw new Error("fetch failed")
    const d = await r.json() as {
      totalSeconds: number
      languages: { name: string; total_seconds: number }[]
    }
    if (!("languages" in d)) throw new Error("invalid response")
    const langs = d.languages.slice(0, 6)
    return [
      { type: "info", text: "top languages - last 30 days" },
      { type: "blank", text: "" },
      ...langs.map((l) => ({
        type: "kv" as LineType,
        text: `  ${l.name.padEnd(14)}  ${pctOf(l.total_seconds, d.totalSeconds).padStart(4)}  (${fmtSec(l.total_seconds)})`,
      })),
      { type: "blank", text: "" },
      { type: "output", text: "  run 'stats' for full coding overview" },
    ]
  },

  vscode: async () => {
    const r = await fetch("/api/wakatime-stats?period=all")
    if (!r.ok) throw new Error("fetch failed")
    const d = await r.json() as {
      totalSeconds: number
      editors: { name: string; total_seconds: number }[]
    }
    if (!("editors" in d)) throw new Error("invalid response")
    const editors = d.editors.slice(0, 5)
    return [
      { type: "info", text: "editor breakdown - all time" },
      { type: "blank", text: "" },
      ...editors.map((e) => ({
        type: "kv" as LineType,
        text: `  ${e.name.padEnd(14)}  ${pctOf(e.total_seconds, d.totalSeconds).padStart(4)}  (${fmtSec(e.total_seconds)})`,
      })),
    ]
  },

  os: async () => {
    const r = await fetch("/api/wakatime-stats?period=all")
    if (!r.ok) throw new Error("fetch failed")
    const d = await r.json() as {
      totalSeconds: number
      operatingSystems: { name: string; total_seconds: number }[]
    }
    if (!("totalSeconds" in d)) throw new Error("invalid response")
    const osList = (d.operatingSystems ?? []).slice(0, 5)
    const lines: Line[] = [
      { type: "info", text: "operating system - all time" },
      { type: "blank", text: "" },
    ]
    if (osList.length > 0) {
      for (const os of osList) {
        const pct = d.totalSeconds > 0 ? Math.round((os.total_seconds / d.totalSeconds) * 100) : 0
        lines.push({ type: "kv", text: `  ${os.name.padEnd(14)} ${fmtSec(os.total_seconds)}  (${pct}%)` })
      }
    } else {
      lines.push({ type: "kv", text: "  macOS         primary development environment" })
      lines.push({ type: "kv", text: "  Windows       Lenovo + gaming PC setup" })
      lines.push({ type: "kv", text: "  Linux         embedded and server work" })
    }
    lines.push({ type: "blank", text: "" })
    lines.push({ type: "output", text: `  total coding time: ${fmtSec(d.totalSeconds)}` })
    return lines
  },

  playing: async () => {
    const res = await fetch("/api/spotify")
    const d = await res.json() as {
      playing?: boolean; paused?: boolean; type?: string;
      track?: string; artist?: string;
      lastPlayed?: { track: string; artist: string; type: string } | null
    }
    if (d.playing || d.paused) {
      const label = d.type === "episode" ? "podcast" : "track"
      const state = d.playing ? "● now playing" : "❙❙ paused"
      return [
        { type: "info", text: `spotify - ${state}` },
        { type: "blank", text: "" },
        { type: "output", text: `  [${label}]  ${d.track}` },
        { type: "output", text: `  by  ${d.artist}` },
      ]
    }
    if (d.lastPlayed) {
      const label = d.lastPlayed.type === "episode" ? "podcast" : "track"
      return [
        { type: "info", text: "spotify - last played" },
        { type: "blank", text: "" },
        { type: "output", text: `  [${label}]  ${d.lastPlayed.track}` },
        { type: "output", text: `  by  ${d.lastPlayed.artist}` },
      ]
    }
    return [{ type: "output", text: "  nothing playing right now" }]
  },

  lastgame: async () => {
    const res = await fetch("/api/ps5")
    const d = await res.json() as {
      online?: boolean; game?: string | null; lastGame?: string | null; lastSeen?: string | null
    }
    const game = d.online ? d.game : (d.lastGame ?? null)
    if (!game) return [{ type: "output", text: "  no game data available" }]
    const state = d.online ? "● online now" : `last seen ${d.lastSeen ? new Date(d.lastSeen).toLocaleDateString("en-GB", { day: "numeric", month: "short" }) : "recently"}`
    return [
      { type: "info", text: `ps5 - ${state}` },
      { type: "blank", text: "" },
      { type: "output", text: `  ${game}` },
    ]
  },

  pushed: async () => {
    const res = await fetch("/api/github-activity")
    const d = await res.json() as { repo?: string | null; relativeTime?: string | null }
    if (!d.repo) return [{ type: "output", text: "  no recent push found" }]
    return [
      { type: "info", text: "github - last push" },
      { type: "blank", text: "" },
      { type: "output", text: `  ${d.repo}` },
      { type: "output", text: `  ${d.relativeTime ?? "recently"}` },
    ]
  },
}

function renderLine(line: Line, i: number) {
  if (line.type === "blank") return <div key={i} className="h-2" />

  if (line.type === "link") {
    const url = line.text.trim()
    const href = url.startsWith("http") ? url : `https://${url}`
    return (
      <a
        key={i}
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="block font-mono text-xs text-primary underline underline-offset-2 hover:text-primary/70 transition-colors pl-4 leading-relaxed"
      >
        {url}
      </a>
    )
  }

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

  // Split on special tokens: → and ● live get their own colours; quoted command names turn green
  const parts = line.text.split(/(→|● live|'[a-z-]+')/
  )
  return (
    <div key={i} className={`font-mono text-xs leading-relaxed ${cls}`}>
      {parts.map((part, j) =>
        part === "→" ? (
          <span key={j} className="text-cyan-400">{"→"}</span>
        ) : part === "● live" ? (
          <span key={j} className="text-green-400">{"● live"}</span>
        ) : part.startsWith("'") && part.endsWith("'") ? (
          <span key={j} className="text-green-400 font-bold tracking-wide">{part.slice(1, -1)}</span>
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
            { type: "output", text: "type 'pages' to see every public page on this site." },
            { type: "output", text: "try: 'ls', 'man', 'stack', 'build', 'faith', 'dad'" },
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

  useEffect(() => {
    if (booted && inputRef.current) {
      inputRef.current.focus({ preventScroll: true })
    }
  }, [booted])

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

    // Theatrical commands play out line by line with real delays
    if (THEATRICAL_COMMANDS[cmd]) {
      setLines((prev) => [...prev, { type: "cmd-echo", text: trimmed }])
      setInputVal("")
      const steps = THEATRICAL_COMMANDS[cmd]
      const maxDelay = Math.max(...steps.map((s) => s.delay))
      steps.forEach(({ line, delay }) => {
        setTimeout(() => setLines((prev) => [...prev, line]), delay)
      })
      setTimeout(() => setLines((prev) => [...prev, { type: "blank", text: "" }]), maxDelay + 150)
      return
    }

    if (ASYNC_COMMANDS[cmd]) {
      setLines((prev) => [
        ...prev,
        { type: "cmd-echo", text: trimmed },
        { type: "info", text: "  fetching..." },
        { type: "blank", text: "" },
      ])
      setInputVal("")
      ASYNC_COMMANDS[cmd]()
        .then((output) => {
          setLines((prev) => [...prev.slice(0, -2), ...output, { type: "blank", text: "" }])
        })
        .catch(() => {
          setLines((prev) => [
            ...prev.slice(0, -2),
            { type: "error", text: "  fetch failed - check your connection" },
            { type: "blank", text: "" },
          ])
        })
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
              ⚠️ lab // work in progress ⚠️
            </p>
            <p className="font-mono text-xs text-muted-foreground">
              terminal, github stats, live coding stats, gaming panel, PCB viewer and hardware · more experiments incoming
            </p>
          </div>
          <div className="flex justify-center">
            <div className="rounded-lg border border-border/60 overflow-hidden">
              <Image
                src="/Media/giphy.gif"
                alt="Under construction"
                width={320}
                height={180}
                className="w-full max-w-[320px] h-auto object-cover"
                sizes="(max-width: 640px) 100vw, 320px"
                priority
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
              // !mt-0 overrides the parent's space-y-8 margin-top - that margin still applies
              // even with position: fixed, stacking on top of top-16 and creating a visible gap.
              // A plain mt-0 isn't enough: space-y-8's ":not([hidden]) ~ :not([hidden])" selector
              // has higher specificity than a single utility class, so this needs !important.
              ? "fixed top-16 inset-x-0 bottom-0 z-50 flex flex-col font-mono !mt-0"
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
              className={`bg-zinc-950 px-5 py-4 overflow-y-auto overscroll-contain cursor-text select-text ${
                isMaximized ? "flex-1" : "h-[400px] sm:h-[500px]"
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

      {!isMaximized && <GitHubStats />}
      {!isMaximized && <WakatimeStats />}
      {!isMaximized && <PCBViewer />}
      {!isMaximized && <GamingPanel />}
      {!isMaximized && <SpotifyAnalytics />}

      {!isMaximized && <BrailleDivider className="max-w-md mx-auto pt-2" />}

      {!isMaximized && (
        <p className="text-center text-xs text-muted-foreground font-mono">
          use{" "}
          <kbd suppressHydrationWarning className="rounded border border-border bg-muted px-1.5 py-0.5 text-[10px]">
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
