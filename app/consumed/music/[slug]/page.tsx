import type { Metadata } from "next"
import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, ExternalLink } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { artists, genres } from "@/data/consumed/music"
import { consumedSlug } from "@/lib/tags"

type Artist = (typeof artists)[number]

function findArtist(slug: string): Artist | null {
  return artists.find((a) => consumedSlug(a.name) === slug) ?? null
}

export function generateStaticParams() {
  return artists.map((a) => ({ slug: consumedSlug(a.name) }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const artist = findArtist(slug)
  if (!artist) return { title: "Not found" }
  return {
    title: `${artist.name} - Music`,
    description: artist.note,
    alternates: { canonical: `https://www.isaacadjei.me/consumed/music/${slug}` },
    openGraph: {
      images: [`/api/og?title=${encodeURIComponent(artist.name)}&description=${encodeURIComponent(artist.note)}`],
    },
  }
}

const GENRE_COLOUR = Object.fromEntries(genres.map((g) => [g.label, g.color]))

export default async function MusicArtistPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const artist = findArtist(slug)
  if (!artist) notFound()

  const ytUrl = artist.youtubeId
    ? `https://www.youtube.com/watch?v=${artist.youtubeId}`
    : null

  const genreColor = GENRE_COLOUR[artist.genre] ?? "bg-muted/40 text-muted-foreground border-border/40"

  return (
    <div className="container max-w-3xl py-24 space-y-10">
      <nav className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Link href="/consumed" className="hover:text-foreground transition-colors">Consumed</Link>
        <span>/</span>
        <Link href="/consumed/music" className="hover:text-foreground transition-colors">Music</Link>
      </nav>

      <div className="space-y-4">
        <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${genreColor}`}>
          {artist.genre}
        </span>
        <h1 className="text-4xl font-bold tracking-tight">{artist.name}</h1>
        <p className="text-base text-muted-foreground leading-relaxed">{artist.note}</p>
      </div>

      {artist.youtubeId && (
        <>
          <Separator />
          <section className="space-y-4">
            <h2 className="text-xs font-mono text-primary uppercase tracking-widest">Featured</h2>
            <div className="relative aspect-video rounded-xl overflow-hidden border border-border/60">
              <iframe
                src={`https://www.youtube.com/embed/${artist.youtubeId}?rel=0`}
                title={`${artist.name} - featured video`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute inset-0 w-full h-full"
                loading="lazy"
              />
            </div>
            {ytUrl && (
              <a
                href={ytUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                Watch on YouTube
              </a>
            )}
          </section>
        </>
      )}

      <Separator />

      <Link
        href="/consumed/music"
        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to Music
      </Link>
    </div>
  )
}
