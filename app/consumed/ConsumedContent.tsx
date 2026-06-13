"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import {
  Play, BookOpen, Music2, Headphones, Tv2, ExternalLink,
  LayoutList, ListVideo, Newspaper, BookMarked, Globe,
} from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

type Month =
  | "January" | "February" | "March" | "April" | "May" | "June"
  | "July" | "August" | "September" | "October" | "November" | "December"

const MONTH_NUMBER: Record<Month, number> = {
  January: 0, February: 1, March: 2,    April: 3,
  May: 4,     June: 5,     July: 6,     August: 7,
  September: 8, October: 9, November: 10, December: 11,
}

function isMonthAvailable(month: Month, preview: boolean): boolean {
  if (preview) return true
  const now = new Date()
  return now >= new Date(2026, MONTH_NUMBER[month], 1)
}

const MONTH_CHIP: Record<Month, string> = {
  January:   "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  February:  "bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20",
  March:     "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  April:     "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  May:       "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
  June:      "bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20",
  July:      "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20",
  August:    "bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-500/20",
  September: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20",
  October:   "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20",
  November:  "bg-lime-500/10 text-lime-600 dark:text-lime-400 border-lime-500/20",
  December:  "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
}

const MONTHS: Month[] = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
]

// --- TYPES ---
type VideoEntry = {
  id: string
  title: string
  channel: string
  month: Month
  uploaded: string
  tags: string[]
  description?: string
  isPlaylist?: true
}

type PodcastEntry = {
  spotifyId: string
  embedType: "episode" | "show"
  title: string
  show: string
  month: Month
  description?: string
}

type BookEntry = {
  title: string
  author: string
  genre: string
  genreColor: string
  month: Month
  note: string
  link?: string
}

type ResourceEntry = {
  title: string
  description: string
  url: string
  category: "Docs" | "Course" | "Tool" | "Blog" | "Reference"
  categoryColor: string
  month: Month
}

type OtherEntry = {
  title: string
  source: string
  url: string
  description: string
  month: Month
  tags: string[]
}

// --- VIDEO DATA ---
const videos: VideoEntry[] = [
  // January
  { id: "HRl0dvPRkSI",  title: "The Power of Nonverbal Communications",                            channel: "CMX",                            month: "January",   uploaded: "2015-11-04", tags: ["psychology", "communication"],   description: "How body language and non-verbal cues dominate human communication. Covers posture, eye contact and how to project confidence without saying a word." },
  { id: "LNHBMFCzznE",  title: "After Watching This, Your Brain Will Not Be the Same",             channel: "TEDx Talks",                     month: "January",   uploaded: "2015-12-15", tags: ["neuroscience", "education"],     description: "Dr. Lara Boyd on neuroplasticity. Why learning physically changes the brain and what that means for building lasting skills and habits." },
  { id: "BBz-Jyr23M4",  title: "Guitar Lesson 1: Absolute Beginner? Start Here!",                 channel: "Andy Guitar",                    month: "January",   uploaded: "2016-09-02", tags: ["guitar", "tutorial"],            description: "The starting point for anyone picking up a guitar for the first time. How to hold it, your first chord and how to read basic tab." },
  { id: "sW9npZVpiMI",  title: "Why You NEED Math for Programming",                                channel: "Joma Tech",                      month: "January",   uploaded: "2021-01-05", tags: ["maths", "programming"],          description: "A straight-talking case for why maths makes you a better programmer. Covers discrete maths, linear algebra and where they show up directly in CS." },
  { id: "42QwoBvWXE0",  title: "Casio Classwiz FX-991EX Integration Tutorial",                     channel: "Calculator Expert",              month: "January",   uploaded: "2021-05-10", tags: ["maths", "calculator"],           description: "Step-by-step guide to solving definite integrals on the Classwiz numerically. Genuinely useful for engineering exam prep." },
  { id: "_VvKeiwddPI",  title: "Music Theory Complete Course. Everything You Need to Know",       channel: "Woochia",                        month: "January",   uploaded: "2022-02-16", tags: ["music", "theory"],               description: "Full music theory walkthrough: notes, scales, chords, modes, rhythm and harmony. Solid foundation before getting serious about piano." },
  { id: "46dZH7LDbf8",  title: "Mock Google Coding Interview with a Meta Intern",                  channel: "NeetCode",                       month: "January",   uploaded: "2022-11-15", tags: ["coding", "interview"],           description: "Real-time coding interview simulation. Useful for seeing how to communicate your thought process out loud while solving a problem." },
  { id: "BpPEoZW5IiY",  title: "Learn Rust Programming. Complete Course",                         channel: "freeCodeCamp.org",               month: "January",   uploaded: "2023-06-08", tags: ["rust", "programming"],           description: "Four-hour Rust introduction covering ownership, borrowing, lifetimes and the type system. The best free starting point for systems-level Rust." },
  { id: "B5wCziuqnwk",  title: "Story of the Entire Bible, I Guess",                               channel: "Redeemed Zoomer",                month: "January",   uploaded: "2023-08-18", tags: ["faith", "bible"],                description: "Fast-paced chronological walkthrough of the entire Biblical narrative. Surprisingly entertaining and more theologically grounded than the title suggests." },
  { id: "P6FORpg0KVo",  title: "How to Make Learning as Addictive as Social Media",                channel: "TED",                            month: "January",   uploaded: "2023-10-26", tags: ["learning", "education"],         description: "Luis von Ahn on using gamification and spaced repetition to make learning feel compelling rather than like work." },
  // February
  { id: "p00zsi71t6I",  title: "How To Start Learning The Piano: Self Taught",                    channel: "Matthew Cawood",                 month: "February",  uploaded: "2023-12-20", tags: ["piano", "tutorial"],             description: "A practical guide for complete beginners. What to focus on first, how to structure practice without a teacher and what to avoid early on." },
  { id: "lvO88XxNAzs",  title: "70 LeetCode Problems in 5+ Hours (Every Data Structure)",         channel: "stoney codes",                   month: "February",  uploaded: "2024-08-31", tags: ["coding", "algorithms"],          description: "Marathon walkthrough of 70 LeetCode problems covering arrays, hashmaps, trees, graphs and dynamic programming. A solid reference session." },
  { id: "3V5LaqHqh4c",  title: "How I'd Learn to Code If I Had to Start Over",                     channel: "Catherine Li",                   month: "February",  uploaded: "2025-01-12", tags: ["coding", "career"],              description: "Honest retrospective on the most efficient path into programming. What to skip, what's essential and what order makes the most sense." },
  { id: "Ag2fJaNbw3Q",  title: "Central Cee. Limitless (Music Video)",                            channel: "Central Cee",                    month: "February",  uploaded: "2025-01-23", tags: ["music", "uk-rap"],               description: "Visually striking video for one of Central Cee's standout tracks. The production is clean and the delivery is effortless." },
  { id: "O9v10jQkm5c",  title: "Data Structures Explained for Beginners",                          channel: "Sajjaad Khader",                 month: "February",  uploaded: "2025-03-04", tags: ["coding", "data-structures"],     description: "Clear visual explanations of arrays, linked lists, stacks, queues, trees and graphs. Good before implementing any of them in code." },
  { id: "VGPmNwuVji8",  title: "Shut Up and Grind",                                                channel: "Stoic Shift",                    month: "February",  uploaded: "2025-05-20", tags: ["motivation", "mindset"],         description: "Short motivational piece on removing distractions and focusing on output. The kind of thing you watch when you need a reset." },
  { id: "wkZC8oE8R7M",  title: "Jim Legxacy x Dave: 3x",                                         channel: "Jim Legxacy",                    month: "February",  uploaded: "2025-07-17", tags: ["music", "dave", "uk-rap"],       description: "Collaborative track between Jim Legxacy and Dave. Two of the most articulate voices in UK rap trading bars. Real artistry." },
  { id: "w4rG5GY9IlA",  title: "Learning Software Engineering During the Era of AI",               channel: "TEDx Talks",                     month: "February",  uploaded: "2025-07-23", tags: ["ai", "engineering"],             description: "Addresses whether AI makes learning to code pointless. The answer is no. But what you need to learn changes significantly." },
  { id: "Xr6v0lI517A",  title: "If You Cannot Build Logic, You Cannot Solve LeetCode Problems",   channel: "Techie Bytess",                  month: "February",  uploaded: "2025-08-08", tags: ["coding", "leetcode"],            description: "Why most people fail at LeetCode: they memorise solutions instead of building the underlying reasoning. How to actually fix that." },
  { id: "ZUjebLQl3is",  title: "How to Solve Inverting Op-Amp Exercises",                          channel: "YS Electronics",                 month: "February",  uploaded: "2025-09-02", tags: ["electronics", "engineering"],    description: "Worked examples on inverting op-amp circuits. Gain calculations, virtual earth principle and practical applications in analogue design." },
  // March
  { id: "pdLEHfkwgV8",  title: "The Power of SIMPLE Editing",                                      channel: "Andrew",                         month: "March",     uploaded: "2025-09-12", tags: ["creative", "video-editing"],     description: "Why the most impactful editing decisions are the ones that remove things rather than add them. Applicable to writing and design too." },
  { id: "gaCY4QxfSzA",  title: "Coding is Hard Until You Learn This",                              channel: "Phillip Choi",                   month: "March",     uploaded: "2025-11-05", tags: ["coding", "tutorial"],            description: "The mental model shift that makes programming click. Thinking in terms of data transformations rather than sequences of instructions." },
  { id: "-q66T2dNml0",  title: "Dave: Chapter 16 ft. Kano",                                       channel: "Santan Dave",                    month: "March",     uploaded: "2025-11-26", tags: ["music", "dave"],                 description: "One of Dave's most praised tracks. A meditation on legacy, mortality and responsibility. The Kano feature adds exactly the right weight." },
  { id: "-zWdzUf6oWM",  title: "I Spent 24 Hours Learning Arduino",                                channel: "Tobias Tech",                    month: "March",     uploaded: "2025-12-06", tags: ["electronics", "arduino"],        description: "Condensed Arduino beginner sprint. Setup, sensors and basic motor control in 24 hours. Good for seeing what's achievable quickly." },
  { id: "ttdBbHyK7yE",  title: "The Only Type of Editor That Can't Be Replaced",                   channel: "Under The Radar",                month: "March",     uploaded: "2025-12-12", tags: ["ai", "writing"],                 description: "Makes the case that genuine creative voice and editorial judgement are the only things AI cannot fully replicate in content work." },
  { id: "h5kWDOuY2Uo",  title: "This New Pyramid Theory Explains the Missing Evidence",            channel: "DamiLee",                        month: "March",     uploaded: "2026-01-29", tags: ["history", "archaeology"],        description: "Architectural analysis of emerging theories about pyramid construction methods and why some conventional explanations still have gaps." },
  { id: "gmuTjeQUbTM",  title: "Harvard CS50 (2026). Full Computer Science University Course",    channel: "freeCodeCamp.org",               month: "March",     uploaded: "2026-02-05", tags: ["cs", "education"],               description: "The full CS50 2026 course in one video. C, Python, SQL, web development and AI. Probably the most comprehensive free CS resource anywhere." },
  { id: "QoQBzR1NIqI",  title: "Claude Code Full Course 4 Hours: Build & Sell (2026)",             channel: "Nick Saraev",                    month: "March",     uploaded: "2026-02-12", tags: ["ai", "coding"],                  description: "In-depth walkthrough of building and monetising products using Claude Code. Agentic coding workflows and real project examples from start to finish." },
  { id: "-eyga0y6axY",  title: "Why Don't We Die More Often?",                                     channel: "Michael MacKelvie",              month: "March",     uploaded: "2026-02-24", tags: ["science", "biology"],            description: "Explores the body's remarkable ability to maintain homeostasis. Why we're far more resilient than we tend to think." },
  { id: "sFCmU9jG79k",  title: "When the Only Way to Win Is to Lose Everything",                   channel: "Soder Cinema",                   month: "March",     uploaded: "2026-02-27", tags: ["faith", "motivation"],           description: "A short film essay on surrender, faith and the paradox of gaining by letting go. Quiet and stays with you." },
  // April
  { id: "L1QmHAJgxkE",  title: "Speak Smart: Master the Psychology of Powerful Communication",    channel: "The Focus Audiobook Room",       month: "April",     uploaded: "2026-03-08", tags: ["psychology", "communication"],   description: "Audiobook-style content on persuasive, clear and confident speech. Covers framing, tonality, presence and the psychology of how words land." },
  { id: "W9FfPpJGG5o",  title: "World's Biggest Polaroid Meets Ibrahim Mahama",                    channel: "The 20x24 Project",              month: "April",     uploaded: "2026-03-13", tags: ["art", "photography"],            description: "Ghanaian artist Ibrahim Mahama photographed on the world's largest Polaroid camera. Interesting intersection of art, technology and West African identity." },
  { id: "ACcXaktKSr4",  title: "CULTUR FM Ghana Independence 2026 Live Afrobeats Mix",             channel: "CULTUR FM",                      month: "April",     uploaded: "2026-03-14", tags: ["music", "afrobeats"],            description: "Live Ghana Independence Day broadcast from CULTUR FM. Afrobeats, highlife and two-plus hours of pure hometown energy." },
  { id: "1XYtTmCLmNE",  title: "The 'Buy Now Pay Later' Trap Is Getting Worse",                    channel: "Grant Rudow",                    month: "April",     uploaded: "2026-03-21", tags: ["finance", "personal-finance"],   description: "Data-driven breakdown of how BNPL schemes trap consumers in debt cycles. The model, the incentives and the real cost behind the convenience." },
  { id: "8smjYAsxAts",  title: "6 Robots You Can Build in 2026",                                   channel: "Nikodem Bartnik",                month: "April",     uploaded: "2026-03-24", tags: ["robotics", "engineering"],       description: "Practical overview of six robotics projects achievable with off-the-shelf components. From simple arm bots to autonomous navigation systems." },
  { id: "S_oN3vlzpMw",  title: "How AI Agents & Claude Skills Work (Clearly Explained)",           channel: "Greg Isenberg",                  month: "April",     uploaded: "2026-04-08", tags: ["ai", "agents"],                  description: "Clear explanation of AI agent architectures with a focus on Claude's tool use, memory and how multi-step autonomous workflows are structured." },
  { id: "ywjyvKzc8e4",  title: "How I Would Learn Python FAST (If I Could Start Over)",            channel: "Andrew Codesmith",               month: "April",     uploaded: "2026-04-09", tags: ["python", "programming"],         description: "Condensed Python learning path. What to focus on in the first 30 days to become genuinely productive as quickly as possible." },
  { id: "44SAutzANVE",  title: "Our First Hackathon Together (We Won!)",                           channel: "Johnathan Mo",                   month: "April",     uploaded: "2026-04-17", tags: ["tech", "hackathon"],             description: "Vlog of a 24-hour hackathon from idea to prototype to winning presentation. Good for understanding how to ship fast under real pressure." },
  { id: "ujyQd2ltUr8",  title: "Jamie Carragher V 20 Football Fans",                               channel: "Zac Djellab",                    month: "April",     uploaded: "2026-04-20", tags: ["football"],                      description: "Fan challenge format with Carragher fielding questions and debates from supporters. Light-hearted, honest football content." },
  { id: "ZY0LelvctsE",  title: "Dami Hope Exclusive On Break Up with Indiyah",                     channel: "We Need To Talk",                month: "April",     uploaded: "2026-04-21", tags: ["entertainment"],                 description: "Candid interview about the public breakup, life after Love Island and moving forward. Honest and grounded." },
  // May
  { id: "LzE6o8bWqdU",  title: "Justin Credible's Freestyle Series With Dave",                     channel: "Power 106 Los Angeles",          month: "May",       uploaded: "2026-04-23", tags: ["music", "freestyle", "dave"],    description: "Dave goes back-to-back in a freestyle series that shows exactly why he's considered one of the best technical MCs in UK rap right now." },
  { id: "sdhh7AYzsTY",  title: "1.5-Hour Study With Me: Hyper Efficient Deep Work",                channel: "iCanStudy",                      month: "May",       uploaded: "2026-04-25", tags: ["study", "productivity"],         description: "Study session following the iCanStudy method. Structured deep work blocks with the science behind why they're more effective than random revision." },
  { id: "FXZnYcLEhDk",  title: "Dave ft. SZA. Affection (Music Video)",                           channel: "UkDrill Daily",                  month: "May",       uploaded: "2026-05-04", tags: ["music", "dave", "uk-rap"],       description: "Cinematic music video for one of the standout collaborations of the year. SZA and Dave together is as good as it sounds." },
  { id: "55pTFVoclvE",  title: "I Was Laid Off by Atlassian",                                      channel: "Vasilios Syrakis",               month: "May",       uploaded: "2026-05-10", tags: ["tech", "career"],                description: "Personal account of a tech layoff. What it felt like, what to do next and how to reframe things when a company's direction changes without you." },
  { id: "PT1Vox_okpA",  title: "1 Muslim vs. 20 Christian Women",                                  channel: "Dr. Daf Show",                   month: "May",       uploaded: "2026-05-16", tags: ["faith", "debate"],               description: "Dialogue-format conversation about faith, theology and shared values between a Muslim scholar and a panel of Christian women. More thoughtful than the title suggests." },
  { id: "EonibwnAEME",  title: "How to Catch Up In Life (Using Logic)",                            channel: "Alex Hormozi",                   month: "May",       uploaded: "2026-05-18", tags: ["motivation", "self-improvement"], description: "Framework for closing the gap between where you are and where you want to be. Ruthlessly focused on output and compounding over feelings." },
  { id: "f_tRmcIuWZQ",  title: "Xabi Alonso's In-Tray: How Can He Bring Chelsea Back to the Top?", channel: "Sky Sports News",               month: "May",       uploaded: "2026-05-18", tags: ["football", "analysis"],          description: "Tactical analysis of what Xabi Alonso would need to fix at Chelsea. Press structure, squad balance and the cultural reset required." },
  { id: "sTvN67hGDrM",  title: "Psychology of People Who Love Fixing Things",                      channel: "Psychology Simplified",          month: "May",       uploaded: "2026-05-19", tags: ["psychology"],                    description: "Why some people are intrinsically motivated to fix and build. The psychology behind engineering and maker personalities." },
  { id: "wYSncx9zLIU",  title: "Google I/O '26 Keynote",                                           channel: "Google",                         month: "May",       uploaded: "2026-05-19", tags: ["tech", "google"],                description: "Google's main 2026 announcements: updated Gemini models, Project Astra progress, AI-first Android features and new developer tooling." },
  // June
  { id: "9xG6_BE_bps",  title: "Accra's Traffic Problem Explained",                                channel: "shaunn armah",                   month: "June",      uploaded: "2026-06-05", tags: ["ghana", "culture"],              description: "Urban documentary on why Accra's road network cannot keep up with population growth. Infrastructure gaps, land use and what the city is trying to do about it." },
  { id: "q5dqCeNEIFU",  title: "Introducing Kendrick Lamar to an Italian Poet",                    channel: "GUS",                            month: "June",      uploaded: "2026-05-03", tags: ["music", "culture"],              description: "Cross-cultural experiment: a classical Italian poet reacts to Kendrick Lamar's lyrics for the first time. What happens when hip-hop meets the Western literary canon." },
  { id: "XfGEMCb6BQU",  title: "What's Hidden Under Antarctica?",                                  channel: "Cleo Abram",                     month: "June",      uploaded: "2026-05-09", tags: ["science", "geography"],          description: "What lies beneath two miles of Antarctic ice: ancient lakes, mountain ranges and geological history that predates the ice sheet by millions of years." },
  { id: "jqdEqfHD22A",  title: "The Secret Behind Every Video You Can't Stop Watching",            channel: "Raygan",                         month: "June",      uploaded: "2026-05-13", tags: ["creative", "media"],             description: "Breaks down the structural hooks, pacing decisions and audience psychology behind high-retention video content. Useful whether you make videos or just want to understand why certain ones are addictive." },
  { id: "SAOod-8oR7Q",  title: "Vejrgang v Tekkz. EChampions League 2026 Round of 16",           channel: "EA SPORTS FC Pro",               month: "June",      uploaded: "2026-05-17", tags: ["football", "esports"],           description: "EA FC Pro match between two of the world's top competitive players. Clinical build-up and high-level tactical play from both sides." },
  { id: "SyQUSA86x0E",  title: "eChampions League 2026. Final League Phase Full Replay",          channel: "EA SPORTS FC Pro",               month: "June",      uploaded: "2026-05-21", tags: ["football", "esports"],           description: "Full broadcast replay of the final eChampions League group stage. Consolidates all the results and storylines heading into the knockout rounds." },
  { id: "E4rHj4ev9_c",  title: "NICOLAS99FC v VEJRGANG. EChampions League 2026 Quarter-Final",   channel: "EA SPORTS FC Pro",               month: "June",      uploaded: "2026-06-01", tags: ["football", "esports"],           description: "Quarter-final clash in the EA FC Pro tournament bracket. High-stakes match between two consistent performers in the competitive scene." },
  { id: "oE7FalNhrlY",  title: "We Flew to Morocco to Shoot Our Summer Collection",                channel: "Suavo",                          month: "June",      uploaded: "2026-06-07", tags: ["fashion", "brand"],              description: "Behind-the-scenes of the Suavo summer campaign shoot in Morocco. Location scouting, styling and the logistics behind producing a small-brand lookbook." },
  { id: "Snjx650iGhY",  title: "Verilog and VHDL Explained for Beginners",                        channel: "Uplatz",                         month: "June",      uploaded: "2026-06-12", tags: ["electronics", "engineering"],    description: "Side-by-side introduction to both hardware description languages. Covers syntax differences, combinational and sequential logic and when to use each in FPGA design." },
  { id: "PLZHQObOWTQDPD3MizzM2xVFitgF8hE_ab", title: "Essence of Linear Algebra",               channel: "3Blue1Brown",                    month: "June",      uploaded: "2016-08-04", tags: ["maths", "linear-algebra"], isPlaylist: true },
  // July
  { id: "EGU6j41JHUU",  title: "NSMQ 2018 Grand Finale",                                          channel: "NSMQ Ghana",                     month: "July",      uploaded: "2026-04-16", tags: ["ghana", "education"],            description: "The 2018 National Science and Maths Quiz grand final between Ghana's top secondary schools. High-pressure timed rounds covering science, maths and general knowledge." },
  { id: "e40IIEJcPtY",  title: "How My Brand Made 6 Figures on Black Friday",                     channel: "Suavo",                          month: "July",      uploaded: "2026-01-18", tags: ["business", "brand"],             description: "Suavo's breakdown of how a small clothing brand structures a Black Friday campaign. Product timing, email strategy, inventory management and what actually drove the revenue." },
  { id: "jVkeT8Inttc",  title: "Clothing Brand Owner. Week In The Life Vlog",                    channel: "Suavo",                          month: "July",      uploaded: "2025-06-03", tags: ["business", "brand"],             description: "A week following the Suavo brand through production, fulfilment and content creation. Honest look at the day-to-day of running a small independent fashion label." },
  { id: "BpdPSrQZ4I0",  title: "I Left the U.S. And Moved to Ghana. The Peace I Found",         channel: "Webnation",                     month: "July",      uploaded: "2026-03-15", tags: ["ghana", "culture"],              description: "Personal account of relocating from the US to Ghana and what that shift felt like. The pace, the community and what diaspora return looks like in practice." },
  { id: "8tVW8pBc8rQ",  title: "The REAL Reason Rawlings Killed 3 Former Ghana Presidents",       channel: "Bisi",                           month: "July",      uploaded: "2026-02-02", tags: ["ghana", "history"],              description: "Deep dive into the political motivations behind the executions of three former Ghanaian heads of state following the 1979 coup. Historical context on one of Ghana's most contested events." },
  { id: "-9bo8HlSxwQ",  title: "CS50x 2026. Artificial Intelligence",                            channel: "CS50",                           month: "July",      uploaded: "2026-01-01", tags: ["cs", "ai"],                      description: "Harvard's AI lecture from CS50x covering search, knowledge representation, inference, machine learning and neural networks at an introductory level." },
  { id: "UuIEbpQms8o",  title: "CS50x 2026. Lecture 0: Scratch",                                 channel: "CS50",                           month: "July",      uploaded: "2025-12-31", tags: ["cs", "education"],               description: "The opening CS50x lecture. Computational thinking, binary, algorithms and an introduction to programming concepts using MIT Scratch before any real code." },
  { id: "6Svu_ae5ebk",  title: "CS50x 2026. Lecture 3: Algorithms",                              channel: "CS50",                           month: "July",      uploaded: "2026-01-01", tags: ["cs", "algorithms"],              description: "CS50x lecture on sorting and searching algorithms. Big-O notation, binary search, bubble sort, merge sort and how to reason about efficiency." },
  { id: "HJP0a6vKvlo",  title: "CS50x 2026. Introduction",                                       channel: "CS50",                           month: "July",      uploaded: "2025-12-31", tags: ["cs", "education"],               description: "David Malan's introduction to the CS50 course structure and philosophy. Sets expectations for the year and explains why the course teaches in C before anything else." },
  { id: "9U9R4IxIACs",  title: "Example Interview Questions for FPGA, VHDL and Verilog",         channel: "nandland",                       month: "July",      uploaded: "2019-01-20", tags: ["electronics", "engineering"],    description: "nandland's walkthrough of real FPGA technical interview questions. Combinational logic, timing constraints, state machines and common synthesis pitfalls." },
  { id: "PLUl4u3cNGP62UTc77mJoubhDELSC8lfR0", title: "MIT 6.622. Power Electronics, Spring 2023", channel: "MIT OpenCourseWare",          month: "July",      uploaded: "2023-01-01", tags: ["electronics", "engineering"], isPlaylist: true },
  // August
  { id: "AwnfjcDCCmE",  title: "Dave. The Boy Who Played the Harp",                              channel: "Santan Dave",                    month: "August",    uploaded: "2026-02-26", tags: ["music", "dave"],                 description: "Dave's extended spoken word piece on grief, identity and what it means to carry culture. One of the more vulnerable pieces of his catalogue." },
  { id: "2IReMT_zjK8",  title: "The Best Way to Start Learning Verilog",                          channel: "Visual Electric",                month: "August",    uploaded: "2021-03-31", tags: ["electronics", "verilog"],        description: "Practical first steps into Verilog HDL. Module structure, wire and reg types, simulation and the difference between synthesis and simulation behaviour." },
  { id: "uy2GvFwVJU4",  title: "AutoCAD Tutorial for Beginners",                                  channel: "CAD CAM Tutorials",              month: "August",    uploaded: "2019-12-18", tags: ["engineering", "cad"],            description: "Core AutoCAD interface walkthrough for complete beginners. Drawing tools, layers, dimensions and the fundamental workflow for 2D technical drawings." },
  { id: "6QKFgdDg5Yg",  title: "AutoCAD Floor Plan Tutorial for Beginners",                       channel: "CAD CAM Tutorials",              month: "August",    uploaded: "2017-04-28", tags: ["engineering", "cad"],            description: "Guided floor plan project in AutoCAD from scratch. Walls, doors, windows, dimensions and annotation using standard architectural drawing conventions." },
  { id: "kjkJm15RTE8",  title: "Raspberry Pi AI Hat+ 2. Object Detection and VLM Demo",         channel: "RonsTechHub",                    month: "August",    uploaded: "2026-02-19", tags: ["electronics", "ai"],             description: "Live demo of the Raspberry Pi AI Hat+ running edge inference. Object detection and visual language model tasks running locally on a Pi at usable speeds." },
  { id: "UDAao5zZVJ0",  title: "How To Play Melody and Chords Together",                          channel: "LOVEWORLD MUSIC TUTORIAL CENTER", month: "August",   uploaded: "2025-08-04", tags: ["music", "piano"],                description: "Piano technique for combining a melody line in one hand with chord accompaniment in the other. Useful for gospel and contemporary worship styles." },
  { id: "FDFcLqSUijo",  title: "Ghanaian Praises for Beginners. Lesson 1",                       channel: "LOVEWORLD MUSIC TUTORIAL CENTER", month: "August",   uploaded: "2020-01-08", tags: ["music", "faith"],                description: "Introductory piano lesson for Ghanaian gospel praise songs. Chord patterns, rhythmic comping and how to play standard worship progressions." },
  { id: "mGuDXlZEoSc",  title: "Modern Robotics. Chapter 11.1: Control System Overview",        channel: "Northwestern Robotics",          month: "August",    uploaded: "2018-03-16", tags: ["robotics", "engineering"],       description: "Northwestern Robotics lecture on control theory fundamentals. PID control, feedback loops and how they are applied to robot joint and motion control." },
  { id: "PLggLP4f-rq02N54sD6xwdDWlDScvb32Pp", title: "Modern Robotics, Chapter 11: Robot Control", channel: "Northwestern Robotics",       month: "August",    uploaded: "2018-01-01", tags: ["robotics", "engineering"], isPlaylist: true },
  { id: "PLgwJf8NK-2e5PngHbdEadEun5XPvnn00N", title: "Digital Communication",                    channel: "Engineering Funda",              month: "August",    uploaded: "2021-01-01", tags: ["engineering", "communications"], isPlaylist: true },
  // September
  { id: "pTB0EiLXUC8",  title: "Object-Oriented Programming, Simplified",                        channel: "Programming with Mosh",          month: "September", uploaded: "2018-03-29", tags: ["programming", "cs"],             description: "Mosh's approachable introduction to OOP concepts. Classes, objects, encapsulation, inheritance and polymorphism with clear examples in a C-style language." },
  { id: "BBpAmxU_NQo",  title: "Data Structures and Algorithms for Beginners",                    channel: "Programming with Mosh",          month: "September", uploaded: "2019-12-10", tags: ["programming", "algorithms"],     description: "Mosh's beginner DSA course covering arrays, linked lists, stacks, queues, hash tables, trees and graphs. Clean explanations with animated diagrams." },
  { id: "8hly31xKli0",  title: "Algorithms and Data Structures. Full Course for Beginners",     channel: "freeCodeCamp.org",               month: "September", uploaded: "2021-03-18", tags: ["programming", "algorithms"],     description: "freeCodeCamp's comprehensive algorithms course covering time complexity, searching, sorting and graph algorithms. Good preparation for technical interviews." },
  { id: "1JZG9x_VOwA",  title: "How Does Your Mobile Phone Work? | ICT #1",                      channel: "Sabin Civil Engineering",        month: "September", uploaded: "2018-12-29", tags: ["engineering", "ict"],            description: "Explains the radio communication chain behind a phone call. Frequencies, modulation, base stations and how the cellular network routes voice and data." },
  { id: "PLUQpHm_JtukII_8U9pucV61MX2YE2CSUt", title: "Embedded C Programming",                  channel: "IIT Madras. BS in Electronic Systems", month: "September", uploaded: "2022-01-01", tags: ["embedded", "programming"], isPlaylist: true },
  { id: "PLPW8O6W-1chwyTzI3BHwBLbGQoPFxPAPM", title: "Modern Embedded Systems Programming Course", channel: "Quantum Leaps, LLC",          month: "September", uploaded: "2013-01-01", tags: ["embedded", "programming"], isPlaylist: true },
  { id: "PLQptsE6qQy8NmtF89dFbfWfTY0yQfxWCK", title: "Master C and Embedded C Programming",   channel: "NerdyElectronics",               month: "September", uploaded: "2020-01-01", tags: ["embedded", "programming"], isPlaylist: true },
  { id: "PL5Q2soXY2Zi9Eo29LMgKVcaydS7V1zZW3", title: "Digital Design and Computer Architecture. ETH Zurich, Spring 2025", channel: "Onur Mutlu Lectures", month: "September", uploaded: "2025-01-01", tags: ["cs", "engineering"], isPlaylist: true },
]

// --- PODCAST DATA ---
const podcasts: PodcastEntry[] = [
  // January
  { spotifyId: "0F5rRvSDDbLP31FJj4Vi2i", embedType: "episode", title: "Perception and the Past",                                                      show: "Psychology Unplugged",              month: "January",   description: "How unresolved past experiences distort present-day perception. Covers cognitive filtering, emotional memory and how to separate what is actually happening from what your history tells you is happening." },
  { spotifyId: "73lIx1idgSoMixnTocVNF2", embedType: "episode", title: "Habits and Routines",                                                          show: "Growing With The Flow",             month: "January",   description: "A grounded conversation on building daily structure that actually holds. The difference between habits that stick and those that fade after two weeks." },
  // February
  { spotifyId: "1dowFN3k8EfF3wPjchgKzM", embedType: "episode", title: "Anxiety.. Breakaway",                                                         show: "Psychology Unplugged",              month: "February",  description: "On the link between anxiety and the need for control. How avoidance reinforces anxiety loops and what it takes to break the pattern rather than just manage the symptoms." },
  { spotifyId: "3TxjF2mZy9S9I9GL5eZ8sq", embedType: "episode", title: "Sleep Toolkit: Tools for Optimising Sleep and Sleep-Wake Timing",             show: "Huberman Lab",                      month: "February",  description: "Huberman's master episode on sleep science. Circadian rhythms, cortisol timing, light exposure, temperature and every practical protocol for improving sleep quality and consistency." },
  // March
  { spotifyId: "5rIjNxwPxdCcgr9bSt0Pby", embedType: "episode", title: "A Harvard Psychologist Teaches Us How to Increase Our Emotional Intelligence", show: "Imposters",                         month: "March",     description: "Susan David on emotional agility: the ability to sit with difficult feelings without being controlled by them. Practical and grounded in decades of research." },
  { spotifyId: "070Y622pJOmkWOaNIwIU7H", embedType: "episode", title: "A Financial Goals Master List (n=310)",                                        show: "The Rational Reminder Podcast",     month: "March",     description: "Data from 310 financial planning clients distilled into the most common and most meaningful financial goals. Useful for thinking clearly about what money is actually for." },
  { spotifyId: "3t8iUSntRaSqsNzAQOX72I", embedType: "episode", title: "You Don't Actually Know What Your Future Self Wants",                          show: "TED Business",                      month: "March",     description: "The psychology of affective forecasting. Why we are reliably wrong about what will make us happy and how to make better long-term decisions despite that." },
  // April
  { spotifyId: "5YoXzNLPgiaJ209C1dhfdy", embedType: "episode", title: "Learning to Take Action for a Meaningful Life with Gregg Krech",              show: "The One You Feed",                  month: "April",     description: "Gregg Krech on Naikan and Morita therapy. Two Japanese practices that shift focus from feeling to doing. The core idea: you don't need to feel ready to act." },
  { spotifyId: "2VzVgDcHpBBWCHKvMJuyeN", embedType: "episode", title: "The Hidden Art Of Reinventing Yourself. Matthew McConaughey",                show: "Modern Wisdom",                     month: "April",     description: "McConaughey on identity, ego and what it actually takes to change direction in life. Honest and surprisingly philosophical for a conversation this wide-ranging." },
  { spotifyId: "1mHvxLBGnoMasgADgLPyan", embedType: "episode", title: "Men's Mental Health: No One's Coming to Save You",                            show: "Mount Mindset",                     month: "April",     description: "Direct conversation on male mental health: why men resist getting help, the cultural factors behind it and what genuine self-reliance looks like versus emotional suppression." },
  // May
  { spotifyId: "6IbUKct9KkYSVkrDRvH25X", embedType: "show",    title: "Message of The Day (MoTD)",                                                   show: "Message of The Day (MoTD)",         month: "May",       description: "Daily Christian devotional podcast. Short, scripture-grounded and consistent. What I put on in the morning when I want something centred rather than motivational." },
  { spotifyId: "0XrOqvxlqQI6bmdYHuIVnr", embedType: "show",    title: "Modern Wisdom",                                                               show: "Modern Wisdom",                     month: "May",       description: "Chris Williamson's flagship podcast. Long-form conversations with psychologists, philosophers, athletes and scientists. Covers masculinity, performance, relationships and meaning." },
  // June
  { spotifyId: "6gu36E8bZ4T4faM9AE2g8T", embedType: "episode", title: "World Cup 2026 Starts Today",                                                 show: "Sound Waves",                       month: "June",      description: "Reaction and preview episode for the 2026 World Cup opening. Group stage expectations, host city impressions and early tournament storylines." },
  { spotifyId: "3AAjf9zQUl0KClT5rtDZv8", embedType: "episode", title: "Breakfast In Bed. Zach Bryan",                                               show: "Sound Waves",                       month: "June",      description: "Sound Waves react to and discuss Zach Bryan's latest release. Music criticism and personal takes on country-adjacent storytelling." },
  { spotifyId: "7Gdal11XQbXAOz7RnvLPdR", embedType: "episode", title: "ArrDee on Hidden Addiction and Becoming a Dad",                               show: "We Need To Talk with Paul C. Brunson", month: "June",   description: "UK rapper ArrDee opens up about addiction he kept hidden from the public and how fatherhood changed his priorities. More revealing than most artist interviews." },
  { spotifyId: "2yX2aqrQLfpB9cd8swjDZI", embedType: "episode", title: "Things Got Heated Discussing Our Argument Styles...",                         show: "He Said, She Said",                 month: "June",      description: "Relationship conversation that turns honest when the hosts reveal their own disagreement patterns. On communication differences and why arguments escalate." },
  // July
  { spotifyId: "0S7i5g2b2i9zzrCyW0DCnh", embedType: "episode", title: "The Darkest Recovery Interview I've Ever Done: 23 Years an Addict",           show: "The Dozen with Liam Tuffs",         month: "July",      description: "A raw, unflinching account of 23 years in addiction. The cycles, the relapses and what recovery actually looks like when it finally takes hold." },
  { spotifyId: "4mHPZWgWXDRQvZFYx60qEm", embedType: "episode", title: "Ex-Spy: What I Discovered Researching the $1B Adult Industry",               show: "The Dozen with Liam Tuffs",         month: "July",      description: "Former intelligence officer on what his investigation into the adult entertainment industry revealed about trafficking, money flows and who actually benefits. Uncomfortable but necessary." },
  { spotifyId: "5kP6r6qhqcEebNNsLWzulp", embedType: "episode", title: "SpaceX IPO is All Systems Go. DTNS 5289",                                   show: "Daily Tech News Show",              month: "July",      description: "Daily Tech News Show covering the latest signals around a SpaceX public listing. What it would mean for the space industry and Starlink's trajectory." },
  { spotifyId: "5MaY5K72FPfA0ZtQDdt0eP", embedType: "episode", title: "Microsoft Gets Honest About Xbox. DTNS 5288",                               show: "Daily Tech News Show",              month: "July",      description: "Coverage of Microsoft's shift in Xbox strategy. Platform-first versus hardware-first thinking and what that means for the console market going forward." },
  // August
  { spotifyId: "47VLMDm34viJqiYxy0ECTL", embedType: "episode", title: "Anthropic Releases Mythos-Class Model to the Public. DTNS 5286",            show: "Daily Tech News Show",              month: "August",    description: "DTNS coverage of Anthropic's flagship model release. Benchmark context, deployment details and what it means for the broader AI model race." },
  { spotifyId: "66IIG9zfZVEpykBrA4omyX", embedType: "episode", title: "Apple's New Take on Intelligence. WWDC 2026. DTNS 5285",                   show: "Daily Tech News Show",              month: "August",    description: "Post-WWDC 2026 breakdown from Daily Tech News Show. Apple's new AI features, on-device inference strategy and how it compares to what Google and Microsoft announced." },
  { spotifyId: "0n63bKhJlSAuR4j5P80SGi", embedType: "episode", title: "Do People Hate Tech Now?. DTNS Live",                                        show: "Daily Tech News Show",              month: "August",    description: "Live conversation on the shifting public attitude toward the tech industry. Layoffs, AI anxiety and why the cultural mood around Silicon Valley has soured." },
  { spotifyId: "4UoQrEKJzGSXgkyH2ED10O", embedType: "episode", title: "Microplastics: How Worried Should You Be?",                                   show: "Science Vs",                        month: "August",    description: "Science Vs digs into the actual research on microplastics in the body. What the evidence shows, what it doesn't and how to calibrate concern without panic." },
  // September
  { spotifyId: "7JcKDRsCslDFHKTWWKt9m6", embedType: "episode", title: "The Fascinating History of Dandelions",                                       show: "Stuff You Should Know",             month: "September", description: "Josh and Chuck on the overlooked history of dandelions. Medicinal use, culinary history and why something classified as a weed was once grown deliberately." },
  { spotifyId: "1n7da1vz4aMq9GaQXCLPPD", embedType: "episode", title: "Basic Electrical and Electronics Engineering",                                show: "Knowledge Flow: Unlocking Minds Through Books", month: "September", description: "Audiobook-format introduction to electrical and electronics fundamentals. Covers Ohm's Law, circuits, components and basic theory before any hands-on work." },
  { spotifyId: "0gKSpVmVEpaKZuTytKq0cs", embedType: "episode", title: "Episode 158: Quantum Electrodynamics Part 1",                                 show: "The Science of Everything Podcast", month: "September", description: "Introduction to QED: the quantum field theory describing how light and matter interact. The framework behind every electromagnetic phenomenon." },
  { spotifyId: "45Dc7Z1fAPGOCjxiyBgqiU", embedType: "episode", title: "How Electricity Works. For Visual Learners",                                 show: "Engineering Mindset",               month: "September", description: "The Engineering Mindset on electric current, voltage, resistance and power. Visual analogies that make abstract electrical concepts concrete and intuitive." },
  { spotifyId: "41lGgkqtzGAoEpjKFt2sje", embedType: "episode", title: "Exploring PLC and Robot Integration with YRG Robotics Chris Elston",          show: "The Robot Report Podcast",          month: "September", description: "Industrial automation conversation covering how PLCs and robot arms are integrated in manufacturing settings. The protocols, the architecture and what the job actually looks like." },
]

// --- BOOK DATA ---
const books: BookEntry[] = [
  // January
  { title: "The Art of Electronics",           author: "Horowitz & Hill",           genre: "Electronics",      genreColor: "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20",        month: "January",   note: "The definitive reference for anyone working with analogue and digital circuits.",                                                                     link: "https://www.amazon.co.uk/dp/0521809266" },
  { title: "Clean Code",                       author: "Robert C. Martin",          genre: "Software",         genreColor: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",   month: "January",   note: "A handbook of agile software craftsmanship. Changed how I think about naming and structure.",                                                           link: "https://www.amazon.co.uk/dp/0132350882" },
  // February
  { title: "Atomic Habits",                    author: "James Clear",               genre: "Self-Improvement", genreColor: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20", month: "February", note: "Tiny changes compound into remarkable results. Practical and honest.",                                                                               link: "https://www.amazon.co.uk/dp/1847941834" },
  { title: "The Pragmatic Programmer",         author: "Hunt & Thomas",             genre: "Software",         genreColor: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",   month: "February",  note: "From journeyman to master. Evergreen advice on software craftsmanship.",                                                                             link: "https://www.amazon.co.uk/dp/0135957052" },
  // March
  { title: "Sapiens",                          author: "Yuval Noah Harari",         genre: "History",          genreColor: "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20", month: "March", note: "A brief history of humankind. Reads fast and reframes everything you think you know.",                                                              link: "https://www.amazon.co.uk/dp/0099590085" },
  { title: "Deep Work",                        author: "Cal Newport",               genre: "Productivity",     genreColor: "bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20", month: "March", note: "Rules for focused success in a distracted world. Essential reading as a student builder.",                                                       link: "https://www.amazon.co.uk/dp/0349411905" },
  // April
  { title: "Computer Organization and Design", author: "Patterson & Hennessy",      genre: "Computer Science", genreColor: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",   month: "April",     note: "The hardware and software interface. Dense but invaluable for understanding how computers really work.",                                              link: "https://www.amazon.co.uk/dp/0128203315" },
  { title: "Thinking, Fast and Slow",          author: "Daniel Kahneman",           genre: "Psychology",       genreColor: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20", month: "April", note: "Two systems that drive the way we think. Applies directly to decision-making under pressure.",                                              link: "https://www.amazon.co.uk/dp/0141033576" },
  // May
  { title: "The Alchemist",                    author: "Paulo Coelho",              genre: "Fiction",          genreColor: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",   month: "May",       note: "A journey to follow your personal legend. Short and stays with you.",                                                                               link: "https://www.amazon.co.uk/dp/0722532938" },
  { title: "48 Laws of Power",                 author: "Robert Greene",             genre: "Strategy",         genreColor: "bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border-zinc-500/20",   month: "May",       note: "Timeless principles of power and strategy. Read it to understand the world, not to exploit it.",                                                      link: "https://www.amazon.co.uk/dp/1861972784" },
  // June
  { title: "The Mythical Man-Month",           author: "Frederick P. Brooks Jr.",   genre: "Software",         genreColor: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",   month: "June",      note: "Essays on software engineering from 1975 that are still embarrassingly accurate. The insight on why adding people to a late project makes it later is permanent wisdom.", link: "https://www.amazon.co.uk/dp/0201835959" },
  { title: "Introduction to Algorithms (CLRS)", author: "Cormen, Leiserson, Rivest & Stein", genre: "Computer Science", genreColor: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20", month: "June", note: "The definitive algorithms reference. Heavy, but pairs perfectly with the MIT and CS50 content being worked through this year.",          link: "https://www.amazon.co.uk/dp/026204630X" },
  // July
  { title: "Digital Design",                   author: "Morris Mano",               genre: "Electronics",      genreColor: "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20",        month: "July",      note: "The standard text on digital logic design. Directly supports the digital design and computer architecture playlists.",                              link: "https://www.amazon.co.uk/dp/0273764101" },
  { title: "The 7 Habits of Highly Effective People", author: "Stephen R. Covey",  genre: "Self-Improvement", genreColor: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20", month: "July",     note: "A framework for personal and professional effectiveness built on principles rather than quick fixes. The private victory before the public one.",   link: "https://www.amazon.co.uk/dp/1982137274" },
  // August
  { title: "Power Electronics",                author: "Daniel Hart",               genre: "Electronics",      genreColor: "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20",        month: "August",    note: "Covers the theory behind switching circuits and converters. Companion to the MIT 6.622 Power Electronics course.",                                   link: "https://www.amazon.co.uk/dp/0073380679" },
  { title: "Make: Electronics",                author: "Charles Platt",             genre: "Electronics",      genreColor: "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20",        month: "August",    note: "Hands-on, experiment-driven introduction to electronics. Great for bridging the gap between theory and practice on the bench.",                     link: "https://www.amazon.co.uk/dp/1680450263" },
  // September
  { title: "Embedded Systems: Introduction to ARM Cortex-M Microcontrollers, Vol. 1", author: "Jonathan Valvano", genre: "Embedded Systems", genreColor: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20", month: "September", note: "Free textbook from UT Austin covering ARM embedded programming in depth. Directly relevant to the embedded C and systems content.", link: "https://users.ece.utexas.edu/~valvano/embed/toc1.htm" },
  { title: "The C Programming Language",       author: "Kernighan & Ritchie",       genre: "Programming",      genreColor: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",   month: "September", note: "The K&R C book. Concise and definitive. Worth reading cover to cover before going deeper into embedded C.",                                          link: "https://www.amazon.co.uk/dp/0131103628" },
]

// --- MUSIC DATA ---
const artists: Array<{ name: string; genre: string; note: string; youtubeId?: string }> = [
  { name: "Dave (Santan Dave)", genre: "UK Rap / Spoken Word", note: "My most-played artist this year. Chapter 16, Affection, The Boy Who Played the Harp and the Power 106 freestyle are all on repeat.", youtubeId: "-q66T2dNml0" },
  { name: "Central Cee",        genre: "UK Rap",               note: "Limitless is an incredible video. The production is clean.",                                                                             youtubeId: "Ag2fJaNbw3Q" },
  { name: "Jim Legxacy",        genre: "UK Rap",               note: "The 3x collab with Dave is different. Real artistry.",                                                                                   youtubeId: "wkZC8oE8R7M" },
]

const genres: Array<{ label: string; description: string; color: string }> = [
  { label: "Gospel and CCM",         description: "What I start most mornings with. Keeps me grounded when everything else is loud.",        color: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20" },
  { label: "Afrobeats and Highlife", description: "Ghana in my veins. CULTUR FM, hometown sounds, the full culture.",                       color: "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20" },
  { label: "UK Rap",                 description: "Dave, Central Cee, Jim Legxacy. London music for a London-based life.",                  color: "bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20" },
  { label: "Lo-fi",                  description: "The background for every deep work session. Pairs with the study videos above.",          color: "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20" },
  { label: "Piano",                  description: "Learning and listening. Chopin, cinematic pieces and whatever I find to practise.",       color: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20" },
]

// --- RESOURCE DATA ---
const RESOURCE_CHIP: Record<ResourceEntry["category"], string> = {
  Docs:      "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20",
  Course:    "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  Tool:      "bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20",
  Blog:      "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  Reference: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
}

const resources: ResourceEntry[] = [
  // January
  { title: "Developer Roadmaps",           description: "Visual, community-driven roadmaps for any developer track. I use the Frontend and Full-Stack paths regularly to check coverage gaps.",                                 url: "https://roadmap.sh",                                   category: "Reference", categoryColor: "", month: "January"   },
  { title: "MDN Web Docs",                 description: "The definitive JavaScript, HTML and CSS reference. Every browser API, every method, every edge case documented clearly.",                                              url: "https://developer.mozilla.org",                        category: "Docs",      categoryColor: "", month: "January"   },
  { title: "Khan Academy",                 description: "Free maths and science courses from arithmetic through to linear algebra and calculus. The video explanations are genuinely excellent. I use it to fill gaps quickly.", url: "https://khanacademy.org",                              category: "Course",    categoryColor: "", month: "January"   },
  // February
  { title: "The Odin Project",             description: "A free, open-source full-stack curriculum. Works through HTML, CSS, JavaScript, Node and Ruby from scratch. Project-driven.",                                         url: "https://theodinproject.com",                           category: "Course",    categoryColor: "", month: "February"  },
  { title: "web.dev by Google",            description: "Google's canonical resource for modern web development. Performance, accessibility, Core Web Vitals and Progressive Web Apps.",                                       url: "https://web.dev",                                      category: "Reference", categoryColor: "", month: "February"  },
  { title: "MIT OpenCourseWare",           description: "Free lecture notes, exams and videos from MIT across every engineering discipline. EE, CS, maths, physics. The electronics and signals courses are exceptional.",    url: "https://ocw.mit.edu",                                  category: "Course",    categoryColor: "", month: "February"  },
  // March
  { title: "CS50x 2026",                   description: "Harvard's free introduction to computer science. Covers C, Python, SQL, web development and AI. Probably the best free CS course available.",                         url: "https://cs50.harvard.edu/x",                           category: "Course",    categoryColor: "", month: "March"     },
  { title: "Exercism",                     description: "Code practice in 70+ languages with real mentors. I use it alongside LeetCode for language-specific fluency rather than just algorithms.",                            url: "https://exercism.org",                                 category: "Tool",      categoryColor: "", month: "March"     },
  { title: "GitHub Student Developer Pack", description: "Free access to 100+ developer tools for verified students. GitHub Pro, domains, cloud credits, JetBrains IDEs and more. Worth activating immediately.",            url: "https://education.github.com/pack",                    category: "Tool",      categoryColor: "", month: "March"     },
  // April
  { title: "Paul Graham Essays",           description: "Essays on startups, work, life and thinking. 'How to Do Great Work', 'Keep Your Identity Small' and 'Maker's Schedule' are the ones I return to most.",             url: "https://paulgraham.com/articles.html",                 category: "Blog",      categoryColor: "", month: "April"     },
  { title: "DevDocs",                      description: "A fast, offline-capable API documentation browser. Aggregates docs for 300+ libraries in one searchable interface. Genuinely faster than Googling.",                url: "https://devdocs.io",                                   category: "Tool",      categoryColor: "", month: "April"     },
  { title: "Hackster.io",                  description: "Community platform for hardware and electronics projects. Arduino, Raspberry Pi, ESP32, FPGA and everything in between. Good for project ideas and circuit references.", url: "https://hackster.io",                               category: "Reference", categoryColor: "", month: "April"     },
  // May
  { title: "freeCodeCamp News",            description: "Practical programming articles, tutorials and project breakdowns. Not clickbait. The technical content is genuinely solid.",                                         url: "https://freecodecamp.org/news",                        category: "Blog",      categoryColor: "", month: "May"       },
  { title: "Overreacted",                  description: "Dan Abramov's personal blog. Deep dives on React, JavaScript mental models and how to think about software. Slow posts but always worth it.",                         url: "https://overreacted.io",                               category: "Blog",      categoryColor: "", month: "May"       },
  { title: "Farnam Street",                description: "Mental models, decision-making frameworks and thinking tools. The reading list alone is worth visiting. Pairs well with Atomic Habits and Thinking Fast and Slow.",   url: "https://fs.blog",                                      category: "Blog",      categoryColor: "", month: "May"       },
  // June
  { title: "Embedded Artistry",            description: "High-quality embedded systems blog covering firmware architecture, testing, tooling and career advice. One of the best resources in the embedded space.",             url: "https://embeddedartistry.com",                         category: "Blog",      categoryColor: "", month: "June"      },
  { title: "Learn-C.org",                  description: "Interactive C tutorial in the browser. Exercises run live. Good for quickly filling gaps before going deeper into embedded C material.",                              url: "https://learn-c.org",                                  category: "Course",    categoryColor: "", month: "June"      },
  { title: "Hacker News",                  description: "The main tech and startup community on the internet. The comment threads on technical posts are often as valuable as the articles themselves.",                        url: "https://news.ycombinator.com",                         category: "Reference", categoryColor: "", month: "June"      },
  // July
  { title: "Nand to Tetris",               description: "Build a modern computer from first principles. Starting from logic gates, through CPU design, up to an OS and compiler. Free and genuinely mind-expanding.",         url: "https://nand2tetris.org",                              category: "Course",    categoryColor: "", month: "July"      },
  { title: "Nandland",                     description: "The best free FPGA, VHDL and Verilog tutorials available. Clear explanations with working examples. Pairs directly with the FPGA interview video.",                  url: "https://nandland.com",                                 category: "Reference", categoryColor: "", month: "July"      },
  { title: "FPGA4Fun",                     description: "Mini FPGA projects with working Verilog/VHDL code. VGA output, UART, SPI, PWM and more. The project-first approach makes new concepts stick faster.",              url: "https://fpga4fun.com",                                 category: "Reference", categoryColor: "", month: "July"      },
  // August
  { title: "SparkFun Learn",               description: "Hands-on electronics tutorials from basic circuits to microcontrollers and sensors. Great for bridging textbook theory to real hardware on the bench.",               url: "https://learn.sparkfun.com",                           category: "Reference", categoryColor: "", month: "August"    },
  { title: "Electronics Tutorials",        description: "Comprehensive reference covering every circuit topology, component and formula with worked examples. Where I go when I need the maths behind a circuit.",             url: "https://electronics-tutorials.ws",                     category: "Reference", categoryColor: "", month: "August"    },
  { title: "Ben Eater's Website",          description: "Ben Eater builds working computers and graphics systems from discrete logic chips on breadboards and explains every step. One of the best hardware educators online.", url: "https://eater.net",                                    category: "Blog",      categoryColor: "", month: "August"    },
  // September
  { title: "UT Austin. Embedded Systems", description: "Jonathan Valvano's free embedded systems textbooks, lab materials and lecture notes from UT Austin. Matches the ARM Cortex-M book listed in Books.",                 url: "https://users.ece.utexas.edu/~valvano/embed",          category: "Course",    categoryColor: "", month: "September" },
  { title: "cppreference.com",             description: "The authoritative C and C++ reference. Every standard library function, template and language feature documented precisely. My tab-completion for C.",               url: "https://cppreference.com",                             category: "Docs",      categoryColor: "", month: "September" },
  { title: "OSDev Wiki",                   description: "The community wiki for building operating systems from scratch. Bootloaders, memory management, interrupts and kernel architecture. Excellent low-level reference.",  url: "https://wiki.osdev.org",                               category: "Reference", categoryColor: "", month: "September" },
]

// --- OTHERS DATA (articles, essays, blog posts) ---
const others: OtherEntry[] = [
  // January
  { title: "Maker's Schedule, Manager's Schedule",                       source: "Paul Graham",              url: "https://paulgraham.com/makersschedule.html",                                                                           description: "Why meetings destroy programmers' productivity and how the two types of schedule fundamentally conflict. I think about this every time someone books a 30-minute call in the middle of my afternoon.",                                       month: "January",   tags: ["productivity", "work"] },
  { title: "You and Your Research",                                       source: "Richard Hamming",          url: "https://www.cs.virginia.edu/~robins/YouAndYourResearch.html",                                                          description: "Hamming's legendary 1986 talk on what separates people who do important work from those who don't. The question he asks. 'What are the important problems of your field?'. Has stayed with me.",                                         month: "January",   tags: ["science", "engineering", "career"] },
  { title: "Putting the 'You' in CPU",                                    source: "cpu.land",                 url: "https://cpu.land",                                                                                                     description: "A deep, visual, surprisingly fun explanation of how CPUs actually execute code. From machine instructions down to transistor-level logic. One of the best pieces of hardware writing I've read.",                                          month: "January",   tags: ["hardware", "cs", "explainer"] },
  // February
  { title: "The Law of Leaky Abstractions",                               source: "Joel on Software",         url: "https://joelonsoftware.com/2002/11/11/the-law-of-leaky-abstractions/",                                               description: "All non-trivial abstractions are leaky. The higher the level of the tool, the more you need to understand what's below it to debug it. Still completely true in 2026.",                                                                    month: "February",  tags: ["software", "engineering"] },
  { title: "The Cathedral and the Bazaar",                                source: "Eric S. Raymond",          url: "http://www.catb.org/~esr/writings/cathedral-bazaar/cathedral-bazaar/",                                               description: "The essay that defined open source philosophy. Why releasing early and often leads to better software than centralised, planned development. Foundational reading for anyone contributing to open source.",                                 month: "February",  tags: ["open-source", "software"] },
  { title: "How to Read a Paper",                                         source: "Srinivasan Keshav",        url: "https://web.stanford.edu/class/ee384m/Handouts/HowtoReadPaper.pdf",                                                   description: "A three-pass method for reading research papers that has genuinely changed how fast I can extract value from technical literature. Two pages, completely practical.",                                                                        month: "February",  tags: ["study", "research", "learning"] },
  // March
  { title: "The Grug Brained Developer",                                  source: "grugbrain.dev",            url: "https://grugbrain.dev",                                                                                                description: "A fictional caveman programmer explains why complexity is the enemy of software. Funny, but the advice is completely serious and more relevant than most conference talks.",                                                              month: "March",     tags: ["software", "complexity"] },
  { title: "Choose Boring Technology",                                    source: "Dan McKinley",             url: "https://mcfunley.com/choose-boring-technology",                                                                       description: "Why you should default to well-understood tools over exciting new ones. The cost of adopting novel technology is almost always higher than it looks. Changed how I evaluate frameworks.",                                                   month: "March",     tags: ["engineering", "decision-making"] },
  { title: "How to Pick a Career (That Actually Fits You)",               source: "Wait But Why",             url: "https://waitbutwhy.com/2018/04/picking-career.html",                                                                  description: "Tim Urban's framework for thinking about career choices. Social conditioning, the 'Cook vs. Chef' mindset and how to figure out what you actually want independent of what people expect of you.",                                          month: "March",     tags: ["life", "career"] },
  // April
  { title: "Salary Negotiation: Make More Money, Be More Valued",        source: "kalzumeus.com",            url: "https://kalzumeus.com/2012/01/23/salary-negotiation/",                                                               description: "The most practical salary negotiation guide ever written. Every engineer should read this before their first offer. The section on not naming a number first changed how I think about interviews.",                                        month: "April",     tags: ["career", "finance"] },
  { title: "How to Be Successful",                                        source: "Sam Altman",               url: "https://blog.samaltman.com/how-to-be-successful",                                                                     description: "Thirteen points from Sam Altman on what actually drives long-term success. Compound growth, self-belief, network leverage. Dense and honest, written for people who are serious about output.",                                             month: "April",     tags: ["career", "mindset"] },
  { title: "Transistors. The Invention That Changed the World",           source: "SparkFun Learn",           url: "https://learn.sparkfun.com/tutorials/transistors/all",                                                                 description: "SparkFun's excellent written walkthrough of how transistors actually work. From basic theory to BJT and MOSFET behaviour with circuit examples. The kind of grounding you need before anything else in electronics.",                  month: "April",     tags: ["hardware", "electronics", "explainer"] },
  // May
  { title: "How to Do Great Work",                                        source: "Paul Graham",              url: "https://paulgraham.com/greatwork.html",                                                                               description: "Long essay on finding and doing work that matters. The best writing I've come across on the topic of choosing what to spend your working life on. And why excitement is the right compass.",                                               month: "May",       tags: ["work", "motivation"] },
  { title: "The Feynman Technique: The Best Way to Learn Anything",       source: "Farnam Street",            url: "https://fs.blog/feynman-technique/",                                                                                  description: "Feynman's four-step approach to learning anything deeply. Teach it simply, identify gaps, go back to source, refine. The method behind the myth.",                                                                                         month: "May",       tags: ["learning", "study"] },
  { title: "Africa's Tech Ecosystem, Explained",                          source: "TechCabal",                url: "https://techcabal.com",                                                                                                description: "TechCabal is the best English-language publication covering African tech. I read it for the Ghana and West Africa coverage specifically. Funding rounds, startup failures, infrastructure stories and the people building here.",           month: "May",       tags: ["ghana", "tech", "africa"] },
  // June
  { title: "What Is ChatGPT Doing and Why Does It Work?",                 source: "Stephen Wolfram",          url: "https://writings.stephenwolfram.com/2023/02/what-is-chatgpt-doing-and-why-does-it-work/",                          description: "The clearest technical explanation of how large language models actually work. Written for people who understand maths. Long, but worth every minute.",                                                                                    month: "June",      tags: ["ai", "explainer"] },
  { title: "The Pragmatic Engineer Newsletter",                            source: "Gergely Orosz",            url: "https://newsletter.pragmaticengineer.com",                                                                             description: "The highest-quality newsletter about software engineering and big tech I've found. Deep dives on engineering culture, compensation, system design and what senior engineers actually do day to day.",                                          month: "June",      tags: ["engineering", "career"] },
  { title: "How Does GPS Work?",                                           source: "Bartosz Ciechanowski",     url: "https://ciechanow.ski/gps/",                                                                                         description: "One of the most beautiful technical explainers on the internet. Interactive, visually stunning breakdown of how GPS triangulation, satellite timing and signal processing actually work.",                                                   month: "June",      tags: ["hardware", "engineering", "explainer"] },
  // July
  { title: "Write Code That Is Easy to Delete, Not Easy to Extend",       source: "programming is terrible",  url: "https://programmingisterrible.com/post/139222674273/write-code-that-is-easy-to-delete-not-easy-to",              description: "Good code isn't the code that's easiest to add to. It's the code that's easiest to throw away when you get it wrong. Completely changed how I think about abstraction and reuse.",                                                       month: "July",      tags: ["software", "design"] },
  { title: "How Digital Audio Works",                                      source: "Bartosz Ciechanowski",     url: "https://ciechanow.ski/sound/",                                                                                       description: "Interactive, physics-first explanation of how sound is captured, digitised and reproduced. Sampling theory, Nyquist and DACs explained without hand-waving.",                                                                              month: "July",      tags: ["hardware", "audio", "explainer"] },
  { title: "Jerry John Rawlings",                                          source: "Wikipedia",                url: "https://en.wikipedia.org/wiki/Jerry_Rawlings",                                                                         description: "Rawlings was one of the most consequential figures in Ghanaian history. Coup leader, revolutionary and later democratic president. The Wikipedia article is thorough and the best single starting point for understanding his arc.",          month: "July",      tags: ["ghana", "history", "politics"] },
  // August
  { title: "The Absolute Minimum Every Software Developer Must Know About Unicode", source: "Joel on Software", url: "https://joelonsoftware.com/2003/10/08/the-absolute-minimum-every-software-developer-absolutely-positively-must-know-about-unicode-and-character-sets-no-excuses/", description: "Written in 2003 and still assigned reading. If you don't understand why your string code breaks on emoji or Arabic text, this is the post.",                            month: "August",    tags: ["software", "encoding"] },
  { title: "What Every Programmer Should Know About Memory",               source: "LWN.net",                  url: "https://lwn.net/Articles/250967/",                                                                                   description: "Ulrich Drepper's definitive paper on CPU caches, memory bandwidth and why memory access patterns matter as much as algorithm complexity in real systems. Dense but essential for systems-level work.",                                        month: "August",    tags: ["hardware", "systems", "performance"] },
  { title: "Apple Intelligence at WWDC 2026: What It Means for Developers", source: "Apple Developer",        url: "https://developer.apple.com/news/",                                                                                  description: "Breakdown of Apple's AI announcements at WWDC 2026. On-device inference, the new APIs and how this changes what's possible to build on Apple platforms. Pairs with the DTNS podcast coverage.",                                           month: "August",    tags: ["tech", "ai", "apple"] },
  // September
  { title: "Beating the Averages",                                         source: "Paul Graham",              url: "https://paulgraham.com/avg.html",                                                                                    description: "The Blub Paradox: a programmer fluent in a weak language can't see why a more powerful language is better. Made me take Lisp and Haskell seriously as thought-expanding tools, not just curiosities.",                                     month: "September", tags: ["programming", "languages"] },
  { title: "Big-O Algorithm Complexity Cheat Sheet",                       source: "bigocheatsheet.com",       url: "https://www.bigocheatsheet.com",                                                                                        description: "The definitive reference for algorithm and data structure time and space complexity. Every common structure and sorting algorithm in one page. I keep this open during anything competitive programming related.",                              month: "September", tags: ["cs", "algorithms"] },
  { title: "FreeRTOS. Getting Started with Real-Time Operating Systems",  source: "FreeRTOS.org",             url: "https://www.freertos.org/Documentation/01-FreeRTOS-quick-start/01-Beginners-guide/01-RTOS-fundamentals",              description: "The official FreeRTOS introduction. Covers what an RTOS actually does, how the scheduler works, tasks, queues and semaphores. The right place to start before writing any real-time firmware.",                                             month: "September", tags: ["hardware", "embedded", "rtos"] },
]

// --- VIDEO CARD ---
function VideoCard({
  video,
  active,
  onActivate,
  compact = false,
}: {
  video: VideoEntry
  active: boolean
  onActivate: () => void
  compact?: boolean
}) {
  if (video.isPlaylist) {
    return (
      <div className="flex flex-col rounded-xl border border-border/60 bg-card overflow-hidden hover:border-border transition-colors">
        <div className="relative aspect-video">
          <iframe
            src={`https://www.youtube.com/embed/videoseries?list=${video.id}`}
            title={video.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
            loading="lazy"
            className="absolute inset-0 w-full h-full"
          />
        </div>
        <div className="flex flex-col gap-2 p-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0 space-y-0.5">
              <div className="flex items-center gap-1.5">
                <span className="rounded-full bg-zinc-700/60 px-1.5 py-0.5 text-[9px] text-zinc-400 font-medium">Playlist</span>
              </div>
              <p className="text-xs font-medium text-foreground leading-snug line-clamp-2">{video.title}</p>
            </div>
            <a
              href={`https://www.youtube.com/playlist?list=${video.id}`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Open playlist on YouTube"
              className="shrink-0 text-muted-foreground hover:text-foreground transition-colors mt-0.5"
            >
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
          <p className="text-xs text-muted-foreground">{video.channel}</p>
          {!compact && video.description && (
            <p className="text-[10px] text-muted-foreground leading-relaxed">{video.description}</p>
          )}
          <div className="flex flex-wrap gap-1 items-center">
            <span className={cn("inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium", MONTH_CHIP[video.month])}>
              {video.month.slice(0, 3)}
            </span>
            {(compact ? video.tags.slice(0, 1) : video.tags).map((tag) => (
              <span key={tag} className="rounded-full border border-border/40 bg-muted/40 px-2 py-0.5 text-[10px] text-muted-foreground">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="group flex flex-col rounded-xl border border-border/60 bg-card overflow-hidden hover:border-border transition-colors">
      <div className="relative aspect-video bg-zinc-900">
        {active ? (
          <iframe
            src={`https://www.youtube.com/embed/${video.id}?autoplay=1&rel=0`}
            title={video.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 w-full h-full"
          />
        ) : (
          <button
            type="button"
            onClick={onActivate}
            aria-label={`Play ${video.title}`}
            className="absolute inset-0 w-full h-full cursor-pointer"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`https://img.youtube.com/vi/${video.id}/hqdefault.jpg`}
              alt={video.title}
              className="w-full h-full object-cover"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
                <Play className="h-5 w-5 text-zinc-900 ml-0.5" fill="currentColor" />
              </div>
            </div>
          </button>
        )}
      </div>
      <div className="flex flex-col gap-2 p-3">
        <div className="flex items-start justify-between gap-2">
          <p className="text-xs font-medium text-foreground leading-snug line-clamp-2 flex-1">{video.title}</p>
          <a
            href={`https://www.youtube.com/watch?v=${video.id}`}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Open on YouTube"
            className="shrink-0 text-muted-foreground hover:text-foreground transition-colors mt-0.5"
          >
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
        <p className="text-xs text-muted-foreground">{video.channel}</p>
        {!compact && video.description && (
          <p className="text-[10px] text-muted-foreground leading-relaxed">{video.description}</p>
        )}
        <div className="flex flex-wrap gap-1 items-center">
          <span className={cn("inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium", MONTH_CHIP[video.month])}>
            {video.month.slice(0, 3)}
          </span>
          {(compact ? video.tags.slice(0, 1) : video.tags).map((tag) => (
            <span key={tag} className="rounded-full border border-border/40 bg-muted/40 px-2 py-0.5 text-[10px] text-muted-foreground">
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

// --- RESOURCE CARD ---
function ResourceCard({ resource }: { resource: ResourceEntry }) {
  const chip = RESOURCE_CHIP[resource.category]
  return (
    <a
      href={resource.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex flex-col gap-3 rounded-xl border border-border/60 bg-card p-4 hover:border-border transition-colors"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="space-y-0.5 flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground leading-snug group-hover:text-primary transition-colors line-clamp-1">{resource.title}</p>
          <p className="text-[10px] text-muted-foreground truncate">{resource.url.replace(/^https?:\/\//, "")}</p>
        </div>
        <ExternalLink className="h-3.5 w-3.5 shrink-0 text-muted-foreground group-hover:text-foreground transition-colors mt-0.5" />
      </div>
      <p className="text-xs text-muted-foreground leading-relaxed flex-1">{resource.description}</p>
      <div className="flex items-center gap-2">
        <span className={cn("inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium", chip)}>
          {resource.category}
        </span>
        <span className={cn("inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium", MONTH_CHIP[resource.month])}>
          {resource.month.slice(0, 3)}
        </span>
      </div>
    </a>
  )
}

// --- OTHER CARD ---
function OtherCard({ item }: { item: OtherEntry }) {
  return (
    <a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex flex-col gap-3 rounded-xl border border-border/60 bg-card p-4 hover:border-border transition-colors"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="space-y-0.5 flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground leading-snug group-hover:text-primary transition-colors line-clamp-2">{item.title}</p>
          <p className="text-[10px] text-muted-foreground">{item.source}</p>
        </div>
        <ExternalLink className="h-3.5 w-3.5 shrink-0 text-muted-foreground group-hover:text-foreground transition-colors mt-0.5" />
      </div>
      <p className="text-xs text-muted-foreground leading-relaxed flex-1">{item.description}</p>
      <div className="flex flex-wrap items-center gap-1.5">
        <span className={cn("inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium", MONTH_CHIP[item.month])}>
          {item.month.slice(0, 3)}
        </span>
        {item.tags.map((tag) => (
          <span key={tag} className="rounded-full border border-border/40 bg-muted/40 px-2 py-0.5 text-[10px] text-muted-foreground">
            {tag}
          </span>
        ))}
      </div>
    </a>
  )
}

// --- SPOTIFY NOW PLAYING WIDGET ---
type SpotifyState = {
  playing: boolean
  paused?: boolean
  track?: string
  artist?: string
  albumArt?: string | null
  progressMs?: number
  durationMs?: number
  lastPlayed?: { track: string; artist: string; albumArt?: string | null } | null
}

function formatMs(ms: number): string {
  const s = Math.floor(ms / 1000)
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`
  return `${m}:${String(sec).padStart(2, "0")}`
}

function SpotifyNowPlaying() {
  const [data, setData] = useState<SpotifyState>({ playing: false })
  const [progressMs, setProgressMs] = useState(0)

  useEffect(() => {
    async function poll() {
      try {
        const res = await fetch("/api/spotify")
        if (res.ok) {
          const d: SpotifyState = await res.json()
          setData(d)
          setProgressMs(d.progressMs ?? 0)
        }
      } catch {}
    }
    poll()
    const id = setInterval(poll, 30000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    if (!data.playing) return
    const id = setInterval(() => {
      setProgressMs((p) => Math.min(p + 1000, data.durationMs ?? p))
    }, 1000)
    return () => clearInterval(id)
  }, [data.playing, data.durationMs])

  const hasTrack = data.playing || data.paused
  const progress = hasTrack && data.durationMs ? progressMs / data.durationMs : 0
  const displayTrack = hasTrack
    ? { track: data.track, artist: data.artist, albumArt: data.albumArt }
    : data.lastPlayed
    ? { track: data.lastPlayed.track, artist: data.lastPlayed.artist, albumArt: data.lastPlayed.albumArt }
    : null
  const label = data.playing ? "Live on Spotify" : data.paused ? "Paused" : "Last Played"

  if (!displayTrack) return null

  return (
    <div className="w-full max-w-sm">
      <div className={cn("rounded-xl border border-border/60 bg-card p-4 space-y-3", data.paused && "opacity-70")}>
        <div className="flex items-center gap-2">
          <span className={cn("text-[10px] font-semibold uppercase tracking-widest", data.playing ? "text-green-500" : "text-muted-foreground")}>
            {label}
          </span>
          <a href="https://open.spotify.com/user/zaccesss" target="_blank" rel="noopener noreferrer" aria-label="Open Spotify profile" className="ml-auto text-muted-foreground hover:text-foreground transition-colors">
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
        {displayTrack ? (
          <div className="flex items-center gap-3">
            {displayTrack.albumArt ? (
              <Image src={displayTrack.albumArt} alt={displayTrack.track ?? "Album art"} width={48} height={48} className="rounded-lg shrink-0" unoptimized />
            ) : (
              <div className="w-12 h-12 rounded-lg bg-muted shrink-0 flex items-center justify-center text-lg">♫</div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">{displayTrack.track}</p>
              <p className="text-xs text-muted-foreground truncate">{displayTrack.artist}</p>
            </div>
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">Not listening to anything right now.</p>
        )}
        {hasTrack && data.durationMs && (
          <div className="space-y-1">
            <div className="h-1 w-full rounded-full bg-muted overflow-hidden">
              <div
                className={cn("h-full rounded-full transition-all", data.playing ? "bg-green-500" : "bg-muted-foreground/40")}
                style={{ width: `${progress * 100}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-muted-foreground font-mono">
              <span>{formatMs(progressMs)}</span>
              <span>{formatMs(data.durationMs)}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// --- MAIN COMPONENT ---
export default function ConsumedContent() {
  const searchParams = useSearchParams()
  const preview = searchParams.get("preview") === "1"

  const [activeMonth, setActiveMonth] = useState<string>("all")
  const [activeVideos, setActiveVideos] = useState<Set<string>>(new Set())

  const availableMonths = MONTHS.filter((m) => isMonthAvailable(m, preview))

  const filterByMonth = <T extends { month: Month }>(items: T[]) => {
    const visible = items.filter((i) => isMonthAvailable(i.month, preview))
    return activeMonth === "all" ? visible : visible.filter((i) => i.month === activeMonth)
  }

  const filteredVideos    = filterByMonth(videos)
  const filteredPodcasts  = filterByMonth(podcasts)
  const filteredBooks     = filterByMonth(books)
  const filteredResources = filterByMonth(resources)
  const filteredOthers    = filterByMonth(others)
  const totalFiltered     = filteredVideos.length + filteredPodcasts.length + filteredBooks.length + filteredResources.length + filteredOthers.length

  const activateVideo = (id: string) =>
    setActiveVideos((prev) => new Set([...prev, id]))

  const monthsToShow = activeMonth === "all" ? availableMonths : [activeMonth as Month]

  return (
    <div className="container py-24 space-y-10">
      {/* Header */}
      <div className="space-y-4 max-w-2xl">
        <h1 className="text-4xl font-bold tracking-tight">Consumed</h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          Everything I have watched, listened to and read so far this year. Videos, podcasts, books, music, resources and more. More content will be added as the year goes on. See what I am up to right now on my{" "}
          <Link href="/now" className="text-foreground underline underline-offset-4 hover:text-primary transition-colors">
            Now page
          </Link>
          .
        </p>
      </div>

      {/* Year + Month filter */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground tracking-widest uppercase font-mono">Year</span>
          <span className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-mono text-primary font-medium">2026</span>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setActiveMonth("all")}
            className={cn(
              "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
              activeMonth === "all"
                ? "border-primary bg-primary/10 text-primary"
                : "border-border/60 text-muted-foreground hover:border-border hover:text-foreground"
            )}
          >
            All
          </button>
          {availableMonths.map((m) => (
            <button
              type="button"
              key={m}
              onClick={() => setActiveMonth(m)}
              className={cn(
                "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                activeMonth === m
                  ? cn("border-current", MONTH_CHIP[m])
                  : "border-border/60 text-muted-foreground hover:border-border hover:text-foreground"
              )}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      <Separator />

      {/* Tabs */}
      <Tabs defaultValue="all">
        <TabsList className="mb-6 flex-wrap h-auto gap-1">
          <TabsTrigger value="all" className="gap-1.5">
            <LayoutList className="h-3.5 w-3.5" />
            All
            <span className="ml-1 rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">{totalFiltered}</span>
          </TabsTrigger>
          <TabsTrigger value="videos" className="gap-1.5">
            <Tv2 className="h-3.5 w-3.5" />
            Videos
            <span className="ml-1 rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">{filteredVideos.length}</span>
          </TabsTrigger>
          <TabsTrigger value="podcasts" className="gap-1.5">
            <Headphones className="h-3.5 w-3.5" />
            Audio
            <span className="ml-1 rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">{filteredPodcasts.length}</span>
          </TabsTrigger>
          <TabsTrigger value="books" className="gap-1.5">
            <BookOpen className="h-3.5 w-3.5" />
            Books
            <span className="ml-1 rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">{filteredBooks.length}</span>
          </TabsTrigger>
          <TabsTrigger value="music" className="gap-1.5">
            <Music2 className="h-3.5 w-3.5" />
            Music
          </TabsTrigger>
          <TabsTrigger value="resources" className="gap-1.5">
            <BookMarked className="h-3.5 w-3.5" />
            Resources
            <span className="ml-1 rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">{filteredResources.length}</span>
          </TabsTrigger>
          <TabsTrigger value="others" className="gap-1.5">
            <Newspaper className="h-3.5 w-3.5" />
            Others
            <span className="ml-1 rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">{filteredOthers.length}</span>
          </TabsTrigger>
        </TabsList>

        {/* ALL */}
        <TabsContent value="all">
          {totalFiltered === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">No content for this month yet.</p>
          ) : (
            <div className="space-y-16">
              {monthsToShow.map((month) => {
                const mv = filteredVideos.filter((v) => v.month === month)
                const mp = filteredPodcasts.filter((p) => p.month === month)
                const mb = filteredBooks.filter((b) => b.month === month)
                const mr = filteredResources.filter((r) => r.month === month)
                const mo = filteredOthers.filter((o) => o.month === month)
                const total = mv.length + mp.length + mb.length + mr.length + mo.length
                if (total === 0) return null
                return (
                  <section key={month} className="space-y-8">
                    <div className="flex items-center gap-3">
                      <h2 className="text-lg font-bold tracking-tight">{month}</h2>
                      <span className={cn("rounded-full border px-2.5 py-0.5 text-xs font-medium", MONTH_CHIP[month])}>
                        {total} {total === 1 ? "item" : "items"}
                      </span>
                      <div className="flex-1 h-px bg-border/60" />
                    </div>

                    {mv.length > 0 && (
                      <div className="space-y-3">
                        <p className="flex items-center gap-2 text-xs font-mono text-muted-foreground uppercase tracking-widest">
                          <Tv2 className="h-3.5 w-3.5" />
                          Videos ({mv.length})
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                          {mv.map((v) => (
                            <VideoCard
                              key={v.id}
                              video={v}
                              active={activeVideos.has(v.id)}
                              onActivate={() => activateVideo(v.id)}
                              compact
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {mp.length > 0 && (
                      <div className="space-y-3">
                        <p className="flex items-center gap-2 text-xs font-mono text-muted-foreground uppercase tracking-widest">
                          <Headphones className="h-3.5 w-3.5" />
                          Audio ({mp.length})
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {mp.map((p) => (
                            <div key={p.spotifyId} className="space-y-2">
                              <div className="flex items-center justify-between gap-2">
                                <div>
                                  <p className="text-xs font-medium text-foreground line-clamp-1">{p.title}</p>
                                  <p className="text-[10px] text-muted-foreground">{p.show}</p>
                                </div>
                                <span className={cn("shrink-0 inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium", MONTH_CHIP[p.month])}>
                                  {p.month.slice(0, 3)}
                                </span>
                              </div>
                              <iframe
                                src={`https://open.spotify.com/embed/${p.embedType}/${p.spotifyId}?utm_source=generator`}
                                width="100%"
                                height="152"
                                frameBorder="0"
                                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                                loading="lazy"
                                className="rounded-xl"
                                title={p.title}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {mb.length > 0 && (
                      <div className="space-y-3">
                        <p className="flex items-center gap-2 text-xs font-mono text-muted-foreground uppercase tracking-widest">
                          <BookOpen className="h-3.5 w-3.5" />
                          Books ({mb.length})
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {mb.map((b) => (
                            <div key={b.title} className="flex flex-col gap-2 rounded-xl border border-border/60 bg-card p-4 hover:border-border transition-colors">
                              <div className="flex items-start justify-between gap-2">
                                <div className="space-y-0.5">
                                  <p className="text-xs font-semibold text-foreground leading-snug">{b.title}</p>
                                  <p className="text-[10px] text-muted-foreground">{b.author}</p>
                                </div>
                                <span className={cn("shrink-0 inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium", b.genreColor)}>
                                  {b.genre}
                                </span>
                              </div>
                              <p className="text-[10px] text-muted-foreground leading-relaxed">{b.note}</p>
                              {b.link && (
                                <a
                                  href={b.link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-[10px] font-medium text-muted-foreground hover:text-foreground transition-colors self-start"
                                >
                                  <ExternalLink className="h-3 w-3" />
                                  {b.link.includes("amazon") ? "Amazon" : "Free resource"}
                                </a>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {mr.length > 0 && (
                      <div className="space-y-3">
                        <p className="flex items-center gap-2 text-xs font-mono text-muted-foreground uppercase tracking-widest">
                          <BookMarked className="h-3.5 w-3.5" />
                          Resources ({mr.length})
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {mr.map((r) => <ResourceCard key={r.title} resource={r} />)}
                        </div>
                      </div>
                    )}

                    {mo.length > 0 && (
                      <div className="space-y-3">
                        <p className="flex items-center gap-2 text-xs font-mono text-muted-foreground uppercase tracking-widest">
                          <Newspaper className="h-3.5 w-3.5" />
                          Articles ({mo.length})
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {mo.map((o) => <OtherCard key={o.title} item={o} />)}
                        </div>
                      </div>
                    )}
                  </section>
                )
              })}
            </div>
          )}
        </TabsContent>

        {/* VIDEOS */}
        <TabsContent value="videos">
          <div className="mb-6 space-y-1">
            <h2 className="text-base font-semibold text-foreground">Videos</h2>
            <p className="text-sm text-muted-foreground">
              Videos and playlists watched throughout the year. Lectures, tutorials, talks, music videos and everything in between. Click any thumbnail to play inline.
            </p>
          </div>
          {filteredVideos.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">No videos for this month yet.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredVideos.map((v) => (
                <VideoCard
                  key={v.id}
                  video={v}
                  active={activeVideos.has(v.id)}
                  onActivate={() => activateVideo(v.id)}
                />
              ))}
            </div>
          )}
        </TabsContent>

        {/* AUDIO */}
        <TabsContent value="podcasts">
          <div className="mb-6 space-y-1">
            <h2 className="text-base font-semibold text-foreground">Audio</h2>
            <p className="text-sm text-muted-foreground">
              Podcast episodes and shows listened to this year. Play them directly here where possible. Spans a wide range of topics and formats.
            </p>
          </div>
          {filteredPodcasts.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">No audio for this month yet.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {filteredPodcasts.map((p) => (
                <div key={p.spotifyId} className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0 space-y-0.5">
                      <p className="text-sm font-medium text-foreground line-clamp-2">{p.title}</p>
                      <p className="text-xs text-muted-foreground">{p.show}</p>
                      {p.description && (
                        <p className="text-[10px] text-muted-foreground leading-relaxed pt-0.5">{p.description}</p>
                      )}
                    </div>
                    <span className={cn("shrink-0 inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium", MONTH_CHIP[p.month])}>
                      {p.month.slice(0, 3)}
                    </span>
                  </div>
                  <iframe
                    src={`https://open.spotify.com/embed/${p.embedType}/${p.spotifyId}?utm_source=generator`}
                    width="100%"
                    height="152"
                    frameBorder="0"
                    allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                    loading="lazy"
                    className="rounded-xl"
                    title={p.title}
                  />
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* BOOKS */}
        <TabsContent value="books">
          <div className="mb-6 space-y-1">
            <h2 className="text-base font-semibold text-foreground">Books</h2>
            <p className="text-sm text-muted-foreground">
              Books read or worked through this year. Covers a range of topics across engineering, software, science and life. Links go to Amazon UK or a free version where one exists.
            </p>
          </div>
          {filteredBooks.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">No books for this month yet.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredBooks.map((b) => (
                <div key={b.title} className="flex flex-col gap-3 rounded-xl border border-border/60 bg-card p-5 hover:border-border transition-colors">
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-0.5">
                      <p className="text-sm font-semibold text-foreground leading-snug">{b.title}</p>
                      <p className="text-xs text-muted-foreground">{b.author}</p>
                    </div>
                    <span className={cn("shrink-0 inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium", MONTH_CHIP[b.month])}>
                      {b.month.slice(0, 3)}
                    </span>
                  </div>
                  <span className={cn("self-start inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-medium", b.genreColor)}>
                    {b.genre}
                  </span>
                  <p className="text-xs text-muted-foreground leading-relaxed flex-1">{b.note}</p>
                  {b.link && (
                    <a
                      href={b.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors self-start mt-auto"
                    >
                      <ExternalLink className="h-3 w-3" />
                      {b.link.includes("amazon") ? "Amazon" : "Free resource"}
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* MUSIC */}
        <TabsContent value="music">
          <div className="mb-6 space-y-1">
            <h2 className="text-base font-semibold text-foreground">Music</h2>
            <p className="text-sm text-muted-foreground">
              Artists and genres on heavy rotation this year. The music tab captures what shapes the mood of work sessions, commutes and quiet mornings. Things that come up so often they deserve a proper mention.
            </p>
          </div>
          <div className="space-y-10">
            <div className="flex justify-center">
              <SpotifyNowPlaying />
            </div>

            <Separator />

            <div className="space-y-4">
              <h3 className="text-sm font-mono text-muted-foreground uppercase tracking-widest">Genres</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {genres.map((g) => (
                  <div key={g.label} className="rounded-xl border border-border/60 bg-card p-4 space-y-1.5">
                    <span className={cn("inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium", g.color)}>
                      {g.label}
                    </span>
                    <p className="text-xs text-muted-foreground leading-relaxed">{g.description}</p>
                  </div>
                ))}
              </div>
            </div>

            <p className="text-xs text-muted-foreground max-w-lg leading-relaxed">
              I listen to far more than I can list here. Songs come and go with the season.
              The genres above are the constants.
            </p>
          </div>
        </TabsContent>

        {/* RESOURCES */}
        <TabsContent value="resources">
          <div className="mb-6 space-y-1">
            <h2 className="text-base font-semibold text-foreground">Resources</h2>
            <p className="text-sm text-muted-foreground">
              Websites, tools, documentation and learning platforms I have found useful. The places I keep returning to when studying, building or debugging.
            </p>
          </div>
          {filteredResources.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">No resources for this month yet.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredResources.map((r) => (
                <ResourceCard key={r.title} resource={r} />
              ))}
            </div>
          )}
        </TabsContent>

        {/* OTHERS */}
        <TabsContent value="others">
          <div className="mb-6 space-y-1">
            <h2 className="text-base font-semibold text-foreground">Others</h2>
            <p className="text-sm text-muted-foreground">
              Articles, essays and blog posts worth reading. Things that made me think or changed my perspective on something. Covers software, hardware, career, culture, faith and general ideas.
            </p>
          </div>
          {filteredOthers.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">No articles for this month yet.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredOthers.map((o) => (
                <OtherCard key={o.title} item={o} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
