"use client"

// Shared category nav for every consumed page - the hub and every dedicated subpage render this
// same bar, just with a different tab active, so it never disappears when switching category.

import { useRouter } from "next/navigation"
import { LayoutList, Tv2, Headphones, Music2, BookOpen, Newspaper, BookMarked, Globe } from "lucide-react"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { videos, podcasts, books, resources, articles, others } from "@/data/consumed"

export type ConsumedCategoryKey = "all" | "videos" | "audio" | "music" | "books" | "articles" | "resources" | "others"

const ROUTES: Record<Exclude<ConsumedCategoryKey, "all">, string> = {
  videos: "/consumed/videos",
  audio: "/consumed/podcasts",
  music: "/consumed/music",
  books: "/consumed/books",
  articles: "/consumed/articles",
  resources: "/consumed/resources",
  others: "/consumed/others",
}

interface ConsumedCategoryTabsProps {
  active: ConsumedCategoryKey
  counts?: Partial<Record<ConsumedCategoryKey, number>>
}

export function ConsumedCategoryTabs({ active, counts }: ConsumedCategoryTabsProps) {
  const router = useRouter()
  const c = {
    all: counts?.all,
    videos: counts?.videos ?? videos.length,
    audio: counts?.audio ?? podcasts.length,
    books: counts?.books ?? books.length,
    articles: counts?.articles ?? articles.length,
    resources: counts?.resources ?? resources.length,
    others: counts?.others ?? others.length,
  }

  return (
    <div className="space-y-3">
      <Tabs value={active}>
        <div className="flex flex-col items-center text-center gap-3">
          <span className="text-xs text-muted-foreground tracking-widest uppercase font-mono">Category</span>
          <TabsList className="flex-wrap h-auto gap-1 justify-center">
            <TabsTrigger value="all" onClick={() => router.push("/consumed")} className="gap-1.5">
              <LayoutList className="h-3.5 w-3.5" />
              All
              {c.all !== undefined && (
                <span className="ml-1 rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">{c.all}</span>
              )}
            </TabsTrigger>
            <TabsTrigger value="videos" onClick={() => router.push(ROUTES.videos)} className="gap-1.5">
              <Tv2 className="h-3.5 w-3.5" />
              Videos
              <span className="ml-1 rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">{c.videos}</span>
            </TabsTrigger>
            <TabsTrigger value="audio" onClick={() => router.push(ROUTES.audio)} className="gap-1.5">
              <Headphones className="h-3.5 w-3.5" />
              Audio
              <span className="ml-1 rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">{c.audio}</span>
            </TabsTrigger>
            <TabsTrigger value="music" onClick={() => router.push(ROUTES.music)} className="gap-1.5">
              <Music2 className="h-3.5 w-3.5" />
              Music
            </TabsTrigger>
            <TabsTrigger value="books" onClick={() => router.push(ROUTES.books)} className="gap-1.5">
              <BookOpen className="h-3.5 w-3.5" />
              Books
              <span className="ml-1 rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">{c.books}</span>
            </TabsTrigger>
            <TabsTrigger value="articles" onClick={() => router.push(ROUTES.articles)} className="gap-1.5">
              <Newspaper className="h-3.5 w-3.5" />
              Articles
              <span className="ml-1 rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">{c.articles}</span>
            </TabsTrigger>
            <TabsTrigger value="resources" onClick={() => router.push(ROUTES.resources)} className="gap-1.5">
              <BookMarked className="h-3.5 w-3.5" />
              Resources
              <span className="ml-1 rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">{c.resources}</span>
            </TabsTrigger>
            <TabsTrigger value="others" onClick={() => router.push(ROUTES.others)} className="gap-1.5">
              <Globe className="h-3.5 w-3.5" />
              Others
              <span className="ml-1 rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">{c.others}</span>
            </TabsTrigger>
          </TabsList>
        </div>
      </Tabs>
    </div>
  )
}
