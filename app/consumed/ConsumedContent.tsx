"use client"

// I track each YouTube video's active state so only clicked videos load their iframe.
// This keeps the page fast even with 49 embeds on screen at once.
// Month = when I consumed it. Sorted oldest → newest by upload date; oldest content
// is assigned to January, newest to May, spread equally across the year.

import { useState } from "react"
import Link from "next/link"
import { Play, BookOpen, Music2, Headphones, Tv2, ExternalLink, LayoutList } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

type Month = "January" | "February" | "March" | "April" | "May"

const MONTH_CHIP: Record<Month, string> = {
  January:  "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  February: "bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20",
  March:    "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  April:    "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  May:      "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
}

const MONTHS: Month[] = ["January", "February", "March", "April", "May"]

// --- VIDEO DATA (49 videos) ---
// Sorted oldest → newest by upload date. Oldest 10 = January, next 10 = February, etc.
// uploaded = real YouTube upload date (extracted from uploadDate JSON-LD in page HTML).
const videos: Array<{ id: string; title: string; channel: string; month: Month; uploaded: string; tags: string[] }> = [
  // January — uploads 2015–2023 (oldest content)
  { id: "HRl0dvPRkSI",  title: "The Power of Nonverbal Communications",                            channel: "CMX",                   month: "January",  uploaded: "2015-11-04", tags: ["psychology", "communication"] },
  { id: "LNHBMFCzznE",  title: "After Watching This, Your Brain Will Not Be the Same",             channel: "TEDx Talks",            month: "January",  uploaded: "2015-12-15", tags: ["neuroscience", "education"] },
  { id: "BBz-Jyr23M4",  title: "Guitar Lesson 1 - Absolute Beginner? Start Here!",                 channel: "Andy Guitar",           month: "January",  uploaded: "2016-09-02", tags: ["guitar", "tutorial"] },
  { id: "sW9npZVpiMI",  title: "Why You NEED Math for Programming",                                channel: "Joma Tech",             month: "January",  uploaded: "2021-01-05", tags: ["maths", "programming"] },
  { id: "42QwoBvWXE0",  title: "Casio Classwiz FX-991EX Integration Tutorial",                     channel: "Calculator Expert",     month: "January",  uploaded: "2021-05-10", tags: ["maths", "calculator"] },
  { id: "_VvKeiwddPI",  title: "Music Theory Complete Course - Everything You Need to Know",       channel: "Woochia",               month: "January",  uploaded: "2022-02-16", tags: ["music", "theory"] },
  { id: "46dZH7LDbf8",  title: "Mock Google Coding Interview with a Meta Intern",                  channel: "NeetCode",              month: "January",  uploaded: "2022-11-15", tags: ["coding", "interview"] },
  { id: "BpPEoZW5IiY",  title: "Learn Rust Programming - Complete Course",                         channel: "freeCodeCamp.org",      month: "January",  uploaded: "2023-06-08", tags: ["rust", "programming"] },
  { id: "B5wCziuqnwk",  title: "Story of the Entire Bible, I Guess",                               channel: "Redeemed Zoomer",       month: "January",  uploaded: "2023-08-18", tags: ["faith", "bible"] },
  { id: "P6FORpg0KVo",  title: "How to Make Learning as Addictive as Social Media",                channel: "TED",                   month: "January",  uploaded: "2023-10-26", tags: ["learning", "education"] },
  // February — uploads 2023–2025
  { id: "p00zsi71t6I",  title: "How To Start Learning The Piano - Self Taught",                    channel: "Matthew Cawood",        month: "February", uploaded: "2023-12-20", tags: ["piano", "tutorial"] },
  { id: "lvO88XxNAzs",  title: "70 LeetCode Problems in 5+ Hours (Every Data Structure)",         channel: "stoney codes",          month: "February", uploaded: "2024-08-31", tags: ["coding", "algorithms"] },
  { id: "3V5LaqHqh4c",  title: "How I'd Learn to Code If I Had to Start Over",                     channel: "Catherine Li",          month: "February", uploaded: "2025-01-12", tags: ["coding", "career"] },
  { id: "Ag2fJaNbw3Q",  title: "Central Cee - Limitless (Music Video)",                            channel: "Central Cee",           month: "February", uploaded: "2025-01-23", tags: ["music", "uk-rap"] },
  { id: "O9v10jQkm5c",  title: "Data Structures Explained for Beginners",                          channel: "Sajjaad Khader",        month: "February", uploaded: "2025-03-04", tags: ["coding", "data-structures"] },
  { id: "VGPmNwuVji8",  title: "Shut Up and Grind",                                                channel: "Stoic Shift",           month: "February", uploaded: "2025-05-20", tags: ["motivation", "mindset"] },
  { id: "wkZC8oE8R7M",  title: "Jim Legxacy x Dave - 3x",                                         channel: "Jim Legxacy",           month: "February", uploaded: "2025-07-17", tags: ["music", "dave", "uk-rap"] },
  { id: "w4rG5GY9IlA",  title: "Learning Software Engineering During the Era of AI",               channel: "TEDx Talks",            month: "February", uploaded: "2025-07-23", tags: ["ai", "engineering"] },
  { id: "Xr6v0lI517A",  title: "If You Cannot Build Logic, You Cannot Solve LeetCode Problems",   channel: "Techie Bytess",         month: "February", uploaded: "2025-08-08", tags: ["coding", "leetcode"] },
  { id: "ZUjebLQl3is",  title: "How to Solve Inverting Op-Amp Exercises",                          channel: "YS Electronics",        month: "February", uploaded: "2025-09-02", tags: ["electronics", "engineering"] },
  // March — uploads Oct 2025–Feb 2026
  { id: "pdLEHfkwgV8",  title: "The Power of SIMPLE Editing",                                      channel: "Andrew",                month: "March",    uploaded: "2025-09-12", tags: ["creative", "video-editing"] },
  { id: "gaCY4QxfSzA",  title: "Coding is Hard Until You Learn This",                              channel: "Phillip Choi",          month: "March",    uploaded: "2025-11-05", tags: ["coding", "tutorial"] },
  { id: "-q66T2dNml0",  title: "Dave - Chapter 16 ft. Kano",                                       channel: "Santan Dave",           month: "March",    uploaded: "2025-11-26", tags: ["music", "dave"] },
  { id: "-zWdzUf6oWM",  title: "I Spent 24 Hours Learning Arduino",                                channel: "Tobias Tech",           month: "March",    uploaded: "2025-12-06", tags: ["electronics", "arduino"] },
  { id: "ttdBbHyK7yE",  title: "The Only Type of Editor That Can't Be Replaced",                   channel: "Under The Radar",       month: "March",    uploaded: "2025-12-12", tags: ["ai", "writing"] },
  { id: "h5kWDOuY2Uo",  title: "This New Pyramid Theory Explains the Missing Evidence",            channel: "DamiLee",               month: "March",    uploaded: "2026-01-29", tags: ["history", "archaeology"] },
  { id: "gmuTjeQUbTM",  title: "Harvard CS50 (2026) - Full Computer Science University Course",    channel: "freeCodeCamp.org",      month: "March",    uploaded: "2026-02-05", tags: ["cs", "education"] },
  { id: "QoQBzR1NIqI",  title: "Claude Code Full Course 4 Hours: Build & Sell (2026)",             channel: "Nick Saraev",           month: "March",    uploaded: "2026-02-12", tags: ["ai", "coding"] },
  { id: "-eyga0y6axY",  title: "Why Don't We Die More Often?",                                     channel: "Michael MacKelvie",     month: "March",    uploaded: "2026-02-24", tags: ["science", "biology"] },
  { id: "sFCmU9jG79k",  title: "When the Only Way to Win Is to Lose Everything",                   channel: "Soder Cinema",          month: "March",    uploaded: "2026-02-27", tags: ["faith", "motivation"] },
  // April — uploads Mar–Apr 2026
  { id: "L1QmHAJgxkE",  title: "Speak Smart: Master the Psychology of Powerful Communication",    channel: "The Focus Audiobook Room", month: "April", uploaded: "2026-03-08", tags: ["psychology", "communication"] },
  { id: "W9FfPpJGG5o",  title: "World's Biggest Polaroid Meets Ibrahim Mahama",                    channel: "The 20x24 Project",     month: "April",    uploaded: "2026-03-13", tags: ["art", "photography"] },
  { id: "ACcXaktKSr4",  title: "CULTUR FM Ghana Independence 2026 Live Afrobeats Mix",             channel: "CULTUR FM",             month: "April",    uploaded: "2026-03-14", tags: ["music", "afrobeats"] },
  { id: "1XYtTmCLmNE",  title: "The 'Buy Now Pay Later' Trap Is Getting Worse",                    channel: "Grant Rudow",           month: "April",    uploaded: "2026-03-21", tags: ["finance", "personal-finance"] },
  { id: "8smjYAsxAts",  title: "6 Robots You Can Build in 2026",                                   channel: "Nikodem Bartnik",       month: "April",    uploaded: "2026-03-24", tags: ["robotics", "engineering"] },
  { id: "S_oN3vlzpMw",  title: "How AI Agents & Claude Skills Work (Clearly Explained)",           channel: "Greg Isenberg",         month: "April",    uploaded: "2026-04-08", tags: ["ai", "agents"] },
  { id: "ywjyvKzc8e4",  title: "How I Would Learn Python FAST (If I Could Start Over)",            channel: "Andrew Codesmith",      month: "April",    uploaded: "2026-04-09", tags: ["python", "programming"] },
  { id: "44SAutzANVE",  title: "Our First Hackathon Together (We Won!)",                           channel: "Johnathan Mo",          month: "April",    uploaded: "2026-04-17", tags: ["tech", "hackathon"] },
  { id: "ujyQd2ltUr8",  title: "Jamie Carragher V 20 Football Fans",                               channel: "Zac Djellab",           month: "April",    uploaded: "2026-04-20", tags: ["football"] },
  { id: "ZY0LelvctsE",  title: "Dami Hope Exclusive On Break Up with Indiyah",                     channel: "We Need To Talk",       month: "April",    uploaded: "2026-04-21", tags: ["entertainment"] },
  // May — uploads late Apr–May 2026 (newest content)
  { id: "LzE6o8bWqdU",  title: "Justin Credible's Freestyle Series With Dave",                     channel: "Power 106 Los Angeles", month: "May",      uploaded: "2026-04-23", tags: ["music", "freestyle", "dave"] },
  { id: "sdhh7AYzsTY",  title: "1.5-Hour Study With Me: Hyper Efficient Deep Work",                channel: "iCanStudy",             month: "May",      uploaded: "2026-04-25", tags: ["study", "productivity"] },
  { id: "FXZnYcLEhDk",  title: "Dave ft. SZA - Affection (Music Video)",                           channel: "UkDrill Daily",         month: "May",      uploaded: "2026-05-04", tags: ["music", "dave", "uk-rap"] },
  { id: "55pTFVoclvE",  title: "I Was Laid Off by Atlassian",                                      channel: "Vasilios Syrakis",      month: "May",      uploaded: "2026-05-10", tags: ["tech", "career"] },
  { id: "PT1Vox_okpA",  title: "1 Muslim vs. 20 Christian Women",                                  channel: "Dr. Daf Show",          month: "May",      uploaded: "2026-05-16", tags: ["faith", "debate"] },
  { id: "EonibwnAEME",  title: "How to Catch Up In Life (Using Logic)",                            channel: "Alex Hormozi",          month: "May",      uploaded: "2026-05-18", tags: ["motivation", "self-improvement"] },
  { id: "f_tRmcIuWZQ",  title: "Xabi Alonso's In-Tray: How Can He Bring Chelsea Back to the Top?", channel: "Sky Sports News",      month: "May",      uploaded: "2026-05-18", tags: ["football", "analysis"] },
  { id: "sTvN67hGDrM",  title: "Psychology of People Who Love Fixing Things",                      channel: "Psychology Simplified", month: "May",      uploaded: "2026-05-19", tags: ["psychology"] },
  { id: "wYSncx9zLIU",  title: "Google I/O '26 Keynote",                                           channel: "Google",                month: "May",      uploaded: "2026-05-19", tags: ["tech", "google"] },
]

// --- PODCAST DATA (12 episodes/shows) ---
// Sorted oldest → newest by publish date; oldest 2 = January, newest 2 = May.
// uploaded stored for data accuracy but not displayed.
const podcasts: Array<{ spotifyId: string; embedType: "episode" | "show"; title: string; show: string; month: Month }> = [
  // January — oldest episodes (2021–2022)
  { spotifyId: "0F5rRvSDDbLP31FJj4Vi2i", embedType: "episode", title: "Perception and the Past",                                                      show: "Psychology Unplugged",          month: "January"  },
  { spotifyId: "73lIx1idgSoMixnTocVNF2", embedType: "episode", title: "Habits and Routines",                                                          show: "Growing With The Flow",         month: "January"  },
  // February — 2022 episodes
  { spotifyId: "1dowFN3k8EfF3wPjchgKzM", embedType: "episode", title: "Anxiety... Breakaway",                                                         show: "Psychology Unplugged",          month: "February" },
  { spotifyId: "3TxjF2mZy9S9I9GL5eZ8sq", embedType: "episode", title: "Sleep Toolkit: Tools for Optimising Sleep and Sleep-Wake Timing",             show: "Huberman Lab",                  month: "February" },
  // March — late 2022–early 2023
  { spotifyId: "5rIjNxwPxdCcgr9bSt0Pby", embedType: "episode", title: "A Harvard Psychologist Teaches Us How to Increase Our Emotional Intelligence", show: "Imposters",                     month: "March"    },
  { spotifyId: "070Y622pJOmkWOaNIwIU7H", embedType: "episode", title: "A Financial Goals Master List (n=310)",                                        show: "The Rational Reminder Podcast", month: "March"    },
  { spotifyId: "3t8iUSntRaSqsNzAQOX72I", embedType: "episode", title: "You Don't Actually Know What Your Future Self Wants",                          show: "TED Business",                  month: "March"    },
  // April — 2023–2025
  { spotifyId: "5YoXzNLPgiaJ209C1dhfdy", embedType: "episode", title: "Learning to Take Action for a Meaningful Life with Gregg Krech",              show: "The One You Feed",              month: "April"    },
  { spotifyId: "2VzVgDcHpBBWCHKvMJuyeN", embedType: "episode", title: "The Hidden Art Of Reinventing Yourself - Matthew McConaughey",                show: "Modern Wisdom",                 month: "April"    },
  { spotifyId: "1mHvxLBGnoMasgADgLPyan", embedType: "episode", title: "Men's Mental Health: No One's Coming to Save You",                            show: "Mount Mindset",                 month: "April"    },
  // May — ongoing shows (no single episode date)
  { spotifyId: "6IbUKct9KkYSVkrDRvH25X", embedType: "show",    title: "Message of The Day (MoTD)",                                                   show: "Message of The Day (MoTD)",     month: "May"      },
  { spotifyId: "0XrOqvxlqQI6bmdYHuIVnr", embedType: "show",    title: "Modern Wisdom",                                                               show: "Modern Wisdom",                 month: "May"      },
]

// --- BOOK DATA (10 books, 2 per month) ---
const books: Array<{ title: string; author: string; genre: string; genreColor: string; month: Month; note: string }> = [
  { title: "The Art of Electronics",           author: "Horowitz & Hill",      genre: "Electronics",      genreColor: "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20",       month: "January",  note: "The definitive reference for anyone working with analogue and digital circuits." },
  { title: "Clean Code",                       author: "Robert C. Martin",     genre: "Software",         genreColor: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",    month: "January",  note: "A handbook of agile software craftsmanship. Changed how I think about naming and structure." },
  { title: "Atomic Habits",                    author: "James Clear",          genre: "Self-Improvement", genreColor: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20", month: "February", note: "Tiny changes compound into remarkable results. Practical and honest." },
  { title: "The Pragmatic Programmer",         author: "Hunt & Thomas",        genre: "Software",         genreColor: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",    month: "February", note: "From journeyman to master. Evergreen advice on software craftsmanship." },
  { title: "Sapiens",                          author: "Yuval Noah Harari",    genre: "History",          genreColor: "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20", month: "March", note: "A brief history of humankind. Reads fast and reframes everything you think you know." },
  { title: "Deep Work",                        author: "Cal Newport",          genre: "Productivity",     genreColor: "bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20", month: "March", note: "Rules for focused success in a distracted world. Essential reading as a student builder." },
  { title: "Computer Organization and Design", author: "Patterson & Hennessy", genre: "Computer Science", genreColor: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",   month: "April",    note: "The hardware and software interface. Dense but invaluable for understanding how computers really work." },
  { title: "Thinking, Fast and Slow",          author: "Daniel Kahneman",      genre: "Psychology",       genreColor: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20", month: "April", note: "Two systems that drive the way we think. Applies directly to decision-making under pressure." },
  { title: "The Alchemist",                    author: "Paulo Coelho",         genre: "Fiction",          genreColor: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",    month: "May",      note: "A journey to follow your personal legend. Short and stays with you." },
  { title: "48 Laws of Power",                 author: "Robert Greene",        genre: "Strategy",         genreColor: "bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border-zinc-500/20",    month: "May",      note: "Timeless principles of power and strategy. Read it to understand the world, not to exploit it." },
]

// --- MUSIC DATA ---
const artists: Array<{ name: string; genre: string; note: string; youtubeId?: string }> = [
  { name: "Dave (Santan Dave)", genre: "UK Rap / Spoken Word", note: "My most-played artist this year. Chapter 16, Affection, and the Power 106 freestyle are on repeat.", youtubeId: "-q66T2dNml0" },
  { name: "Central Cee",        genre: "UK Rap",               note: "Limitless is an incredible video. The production is clean.",                                            youtubeId: "Ag2fJaNbw3Q" },
  { name: "Jim Legxacy",        genre: "UK Rap",               note: "The 3x collab with Dave is different. Real artistry.",                                                  youtubeId: "wkZC8oE8R7M" },
]

const genres: Array<{ label: string; description: string; color: string }> = [
  { label: "Gospel and CCM",        description: "What I start most mornings with. Keeps me grounded when everything else is loud.",          color: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20" },
  { label: "Afrobeats and Highlife", description: "Ghana in my veins. CULTUR FM, hometown sounds, the full culture.",                        color: "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20" },
  { label: "UK Rap",                description: "Dave, Central Cee, Jim Legxacy. London music for a London-based life.",                     color: "bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20" },
  { label: "Lo-fi",                 description: "The background for every deep work session. Pairs with the study videos above.",             color: "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20" },
  { label: "Piano",                 description: "Learning and listening. Chopin, cinematic pieces and whatever I find to practise.",          color: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20" },
]

// --- VIDEO CARD ---
function VideoCard({
  video,
  active,
  onActivate,
}: {
  video: (typeof videos)[0]
  active: boolean
  onActivate: () => void
}) {
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
        <div className="flex flex-wrap gap-1 items-center">
          <span className={cn("inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium", MONTH_CHIP[video.month])}>
            {video.month.slice(0, 3)}
          </span>
          {video.tags.slice(0, 1).map((tag) => (
            <span key={tag} className="rounded-full border border-border/40 bg-muted/40 px-2 py-0.5 text-[10px] text-muted-foreground">
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

// --- MAIN COMPONENT ---
export default function ConsumedContent() {
  const [activeMonth, setActiveMonth] = useState<string>("all")
  const [activeVideos, setActiveVideos] = useState<Set<string>>(new Set())

  const filterByMonth = <T extends { month: Month }>(items: T[]) =>
    activeMonth === "all" ? items : items.filter((i) => i.month === activeMonth)

  const filteredVideos   = filterByMonth(videos)
  const filteredPodcasts = filterByMonth(podcasts)
  const filteredBooks    = filterByMonth(books)
  const totalFiltered    = filteredVideos.length + filteredPodcasts.length + filteredBooks.length

  const activateVideo = (id: string) =>
    setActiveVideos((prev) => new Set([...prev, id]))

  const monthsToShow = activeMonth === "all" ? MONTHS : [activeMonth as Month]

  return (
    <div className="container py-24 space-y-10">
      {/* Header */}
      <div className="space-y-4 max-w-2xl">
        <div className="flex items-center gap-3">
          <h1 className="text-4xl font-bold tracking-tight">Consumed</h1>
          <span className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-mono text-primary font-medium">2026</span>
        </div>
        <p className="text-lg text-muted-foreground leading-relaxed">
          Everything I have watched, listened to and read so far this year. Videos, podcasts, books and music.
          More will be added as the year goes on.
        </p>
      </div>

      {/* Month filter */}
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
        {MONTHS.map((m) => (
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
            Podcasts
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
        </TabsList>

        {/* ALL — content grouped by month, January first */}
        <TabsContent value="all">
          {totalFiltered === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">No content for this month yet.</p>
          ) : (
            <div className="space-y-16">
              {monthsToShow.map((month) => {
                const mv = filteredVideos.filter((v) => v.month === month)
                const mp = filteredPodcasts.filter((p) => p.month === month)
                const mb = filteredBooks.filter((b) => b.month === month)
                const total = mv.length + mp.length + mb.length
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
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {mp.length > 0 && (
                      <div className="space-y-3">
                        <p className="flex items-center gap-2 text-xs font-mono text-muted-foreground uppercase tracking-widest">
                          <Headphones className="h-3.5 w-3.5" />
                          Podcasts ({mp.length})
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {mp.map((p) => (
                            <a
                              key={p.spotifyId}
                              href={`https://open.spotify.com/${p.embedType}/${p.spotifyId}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="group flex items-start gap-3 rounded-xl border border-border/60 bg-card p-4 hover:border-border transition-colors"
                            >
                              <div className="mt-0.5 shrink-0 w-8 h-8 rounded-md bg-emerald-500/10 flex items-center justify-center">
                                <Headphones className="h-4 w-4 text-emerald-500" />
                              </div>
                              <div className="flex-1 min-w-0 space-y-0.5">
                                <p className="text-xs font-medium text-foreground line-clamp-2 group-hover:text-primary transition-colors">{p.title}</p>
                                <p className="text-[10px] text-muted-foreground">{p.show}</p>
                              </div>
                              <ExternalLink className="h-3 w-3 shrink-0 text-muted-foreground mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </a>
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
                            </div>
                          ))}
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

        {/* PODCASTS */}
        <TabsContent value="podcasts">
          {filteredPodcasts.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">No podcasts for this month yet.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {filteredPodcasts.map((p) => (
                <div key={p.spotifyId} className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <p className="text-sm font-medium text-foreground line-clamp-2">{p.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{p.show}</p>
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
                  <p className="text-xs text-muted-foreground leading-relaxed">{b.note}</p>
                </div>
              ))}
            </div>
          )}
          <p className="mt-8 text-xs text-muted-foreground text-center max-w-lg mx-auto leading-relaxed">
            General reading list for the year across engineering, software and broader topics.
            More added as the year progresses.
          </p>
        </TabsContent>

        {/* MUSIC */}
        <TabsContent value="music">
          <div className="space-y-10">
            <div className="space-y-4">
              <h2 className="text-sm font-mono text-muted-foreground uppercase tracking-widest">Featured Artists</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {artists.map((a) => (
                  <div key={a.name} className="flex flex-col gap-3 rounded-xl border border-zinc-700/60 bg-gradient-to-br from-zinc-900 to-zinc-800 p-5">
                    <div className="space-y-0.5">
                      <p className="text-sm font-semibold text-white">{a.name}</p>
                      <p className="text-xs text-zinc-400">{a.genre}</p>
                    </div>
                    <p className="text-xs text-zinc-400 leading-relaxed">{a.note}</p>
                    {a.youtubeId && (
                      <a
                        href={`https://www.youtube.com/watch?v=${a.youtubeId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs text-zinc-300 hover:text-white transition-colors mt-auto"
                      >
                        <Play className="h-3 w-3" />
                        Watch on YouTube
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <h2 className="text-sm font-mono text-muted-foreground uppercase tracking-widest">Genres</h2>
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

            <Separator />

            <p className="text-xs text-muted-foreground max-w-lg leading-relaxed">
              I listen to far more than I can list here. Songs come and go with the season.
              The genres above are the constants. Check the{" "}
              <Link href="/notes" className="text-foreground underline underline-offset-4 hover:text-primary transition-colors">
                Notes page
              </Link>{" "}
              for the Spotify now-playing widget if you want to see what is actually on at any given moment.
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
