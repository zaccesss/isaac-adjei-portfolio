// I render individual consumed item pages for all six categories.
// Slugs are computed at build time from item titles - no data file changes needed.

import type { Metadata } from "next"
import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  books,
  videos,
  podcasts,
  articles,
  resources,
  others,
  MONTH_CHIP,
  RESOURCE_CHIP,
  type BookEntry,
  type VideoEntry,
  type PodcastEntry,
  type LinkEntry,
  type ResourceEntry,
} from "@/data/consumed"
import { consumedSlug } from "@/lib/tags"

const CATEGORY_META = {
  books:     { label: "Books",     back: "/consumed/books"     },
  videos:    { label: "Videos",    back: "/consumed/videos"    },
  podcasts:  { label: "Podcasts",  back: "/consumed/podcasts"  },
  articles:  { label: "Articles",  back: "/consumed/articles"  },
  resources: { label: "Resources", back: "/consumed/resources" },
  others:    { label: "Others",    back: "/consumed/others"    },
} as const

type ValidCategory = keyof typeof CATEGORY_META

function isValidCategory(cat: string): cat is ValidCategory {
  return cat in CATEGORY_META
}

type Found =
  | { type: "book";     item: BookEntry }
  | { type: "video";    item: VideoEntry }
  | { type: "podcast";  item: PodcastEntry }
  | { type: "link";     item: LinkEntry }
  | { type: "resource"; item: ResourceEntry }

function findItem(category: string, slug: string): Found | null {
  if (category === "books") {
    const item = books.find((b) => consumedSlug(b.title) === slug)
    return item ? { type: "book", item } : null
  }
  if (category === "videos") {
    const item = videos.find((v) => consumedSlug(v.title) === slug)
    return item ? { type: "video", item } : null
  }
  if (category === "podcasts") {
    const item = podcasts.find((p) => consumedSlug(p.title) === slug)
    return item ? { type: "podcast", item } : null
  }
  if (category === "articles") {
    const item = articles.find((a) => consumedSlug(a.title) === slug)
    return item ? { type: "link", item } : null
  }
  if (category === "resources") {
    const item = resources.find((r) => consumedSlug(r.title) === slug)
    return item ? { type: "resource", item } : null
  }
  if (category === "others") {
    const item = others.find((o) => consumedSlug(o.title) === slug)
    return item ? { type: "link", item } : null
  }
  return null
}

export async function generateStaticParams() {
  return [
    ...books.map((b) => ({ category: "books",     slug: consumedSlug(b.title) })),
    ...videos.map((v) => ({ category: "videos",    slug: consumedSlug(v.title) })),
    ...podcasts.map((p) => ({ category: "podcasts",  slug: consumedSlug(p.title) })),
    ...articles.map((a) => ({ category: "articles",  slug: consumedSlug(a.title) })),
    ...resources.map((r) => ({ category: "resources", slug: consumedSlug(r.title) })),
    ...others.map((o) => ({ category: "others",    slug: consumedSlug(o.title) })),
  ]
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string; slug: string }>
}): Promise<Metadata> {
  const { category, slug } = await params
  const found = findItem(category, slug)
  if (!found) return { title: "Not found" }
  const description =
    found.type === "book"     ? found.item.note :
    found.type === "video"    ? found.item.description :
    found.type === "podcast"  ? found.item.description :
    found.type === "link"     ? found.item.description :
    found.type === "resource" ? found.item.description :
    undefined
  const title = `${found.item.title} - Consumed`
  const desc = description ?? found.item.title
  return {
    title,
    description: desc,
    alternates: { canonical: `https://www.isaacadjei.me/consumed/${category}/${slug}` },
    openGraph: {
      images: [`/api/og?title=${encodeURIComponent(found.item.title)}&description=${encodeURIComponent(desc)}`],
    },
  }
}

const PROSE_LINK = "text-primary underline underline-offset-2 hover:text-primary/80 transition-colors"
const TAG_PILL   = "rounded-full border border-border/40 bg-muted/40 px-2.5 py-0.5 text-xs text-muted-foreground"

export default async function ConsumedItemPage({
  params,
}: {
  params: Promise<{ category: string; slug: string }>
}) {
  const { category, slug } = await params

  if (!isValidCategory(category)) notFound()

  const found = findItem(category, slug)
  if (!found) notFound()

  const meta = CATEGORY_META[category]

  return (
    <div className="container max-w-3xl py-24 space-y-10">
      <nav className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Link href="/consumed" className="hover:text-foreground transition-colors">Consumed</Link>
        <span>/</span>
        <Link href={meta.back} className="hover:text-foreground transition-colors">{meta.label}</Link>
      </nav>

      {found.type === "book"     && <BookView     book={found.item}     />}
      {found.type === "video"    && <VideoView    video={found.item}    />}
      {found.type === "podcast"  && <PodcastView  podcast={found.item}  />}
      {found.type === "link"     && <LinkView     item={found.item}     category={category} />}
      {found.type === "resource" && <ResourceView resource={found.item} />}

      <Link
        href={meta.back}
        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to {meta.label}
      </Link>
    </div>
  )
}

function BookView({ book }: { book: BookEntry }) {
  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <div className="flex flex-wrap gap-2">
          <span className={cn("inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium", book.genreColor)}>
            {book.genre}
          </span>
          <span className={cn("inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium", MONTH_CHIP[book.month])}>
            {book.month} 2026
          </span>
        </div>
        <h1 className="text-4xl font-bold tracking-tight leading-tight">{book.title}</h1>
        <p className="text-xl text-muted-foreground">{book.author}</p>
      </div>

      <section className="space-y-4">
        <h2 className="text-xs font-mono text-primary uppercase tracking-widest">Notes</h2>
        <p className="text-base leading-relaxed">{book.note}</p>
        {book.link && (
          <p className="text-sm text-muted-foreground leading-relaxed">
            {book.link.includes("amazon") ? (
              <>Find it on <a href={book.link} target="_blank" rel="noopener noreferrer" className={PROSE_LINK}>Amazon UK</a>. Most university libraries also stock the physical edition - worth checking before buying.</>
            ) : (
              <>Available free at <a href={book.link} target="_blank" rel="noopener noreferrer" className={PROSE_LINK}>{book.link.replace(/^https?:\/\//, "").split("/")[0]}</a>.</>
            )}
          </p>
        )}
      </section>
    </div>
  )
}

function VideoView({ video }: { video: VideoEntry }) {
  const ytUrl = video.isPlaylist
    ? `https://www.youtube.com/playlist?list=${video.id}`
    : `https://www.youtube.com/watch?v=${video.id}`

  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <div className="flex flex-wrap gap-2">
          <span className={cn("inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium", MONTH_CHIP[video.month])}>
            {video.month} 2026
          </span>
          {video.tags.map((tag) => (
            <span key={tag} className={TAG_PILL}>{tag}</span>
          ))}
        </div>
        <h1 className="text-4xl font-bold tracking-tight leading-tight">{video.title}</h1>
        <p className="text-xl text-muted-foreground">{video.channel}</p>
      </div>

      <div className="relative aspect-video rounded-xl overflow-hidden border border-border/60">
        <iframe
          src={
            video.isPlaylist
              ? `https://www.youtube.com/embed/videoseries?list=${video.id}`
              : `https://www.youtube.com/embed/${video.id}?rel=0`
          }
          title={video.title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 w-full h-full"
          loading="lazy"
        />
      </div>

      {video.description && (
        <section className="space-y-4">
          <h2 className="text-xs font-mono text-primary uppercase tracking-widest">Notes</h2>
          <p className="text-base leading-relaxed">{video.description}</p>
          <p className="text-sm text-muted-foreground">
            {video.isPlaylist ? "Full playlist " : "Watch it "}
            on <a href={ytUrl} target="_blank" rel="noopener noreferrer" className={PROSE_LINK}>YouTube</a>.
          </p>
        </section>
      )}
    </div>
  )
}

function PodcastView({ podcast }: { podcast: PodcastEntry }) {
  const spotifyUrl = `https://open.spotify.com/${podcast.embedType}/${podcast.spotifyId}`

  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <span className={cn("inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium", MONTH_CHIP[podcast.month])}>
          {podcast.month} 2026
        </span>
        <h1 className="text-4xl font-bold tracking-tight leading-tight">{podcast.title}</h1>
        <p className="text-xl text-muted-foreground">{podcast.show}</p>
      </div>

      <iframe
        src={`https://open.spotify.com/embed/${podcast.embedType}/${podcast.spotifyId}?utm_source=generator`}
        width="100%"
        height={podcast.embedType === "show" ? "232" : "152"}
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
        loading="lazy"
        className="rounded-xl border border-border/40"
        title={podcast.title}
      />

      {podcast.description && (
        <section className="space-y-4">
          <h2 className="text-xs font-mono text-primary uppercase tracking-widest">Notes</h2>
          <p className="text-base leading-relaxed">{podcast.description}</p>
          <p className="text-sm text-muted-foreground">
            Listen on <a href={spotifyUrl} target="_blank" rel="noopener noreferrer" className={PROSE_LINK}>Spotify</a>.
          </p>
        </section>
      )}
    </div>
  )
}

function LinkView({ item, category }: { item: LinkEntry; category: string }) {
  const label = category === "articles" ? "essay" : "resource"
  const sourceDisplay = item.source.length > 40 ? item.source.replace(/^https?:\/\//, "") : item.source

  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <div className="flex flex-wrap gap-2">
          <span className={cn("inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium", MONTH_CHIP[item.month])}>
            {item.month} 2026
          </span>
          {item.tags.map((tag) => (
            <span key={tag} className={TAG_PILL}>{tag}</span>
          ))}
        </div>
        <h1 className="text-4xl font-bold tracking-tight leading-tight">{item.title}</h1>
        <p className="text-xl text-muted-foreground">{item.source}</p>
      </div>

      <section className="space-y-4">
        <h2 className="text-xs font-mono text-primary uppercase tracking-widest">Notes</h2>
        <p className="text-base leading-relaxed">{item.description}</p>
        <p className="text-sm text-muted-foreground">
          Read the original {label} at{" "}
          <a href={item.url} target="_blank" rel="noopener noreferrer" className={PROSE_LINK}>{sourceDisplay}</a>.
        </p>
      </section>
    </div>
  )
}

function ResourceView({ resource }: { resource: ResourceEntry }) {
  const chip = RESOURCE_CHIP[resource.category]
  const domain = resource.url.replace(/^https?:\/\//, "").split("/")[0]

  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <div className="flex flex-wrap gap-2">
          <span className={cn("inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium", chip)}>
            {resource.category}
          </span>
          <span className={cn("inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium", MONTH_CHIP[resource.month])}>
            {resource.month} 2026
          </span>
        </div>
        <h1 className="text-4xl font-bold tracking-tight leading-tight">{resource.title}</h1>
        <p className="text-sm font-mono text-muted-foreground">{domain}</p>
      </div>

      <section className="space-y-4">
        <h2 className="text-xs font-mono text-primary uppercase tracking-widest">Notes</h2>
        <p className="text-base leading-relaxed">{resource.description}</p>
        <p className="text-sm text-muted-foreground">
          Visit at <a href={resource.url} target="_blank" rel="noopener noreferrer" className={PROSE_LINK}>{domain}</a>.
        </p>
      </section>
    </div>
  )
}
