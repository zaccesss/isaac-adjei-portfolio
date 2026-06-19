// I render the music subpage - artists, genres and live Spotify status. No client hooks needed since SpotifyNowPlaying handles its own polling.
import Link from "next/link"
import { ArrowLeft, Music2, ExternalLink } from "lucide-react"
import { cn } from "@/lib/utils"
import { artists, genres } from "@/data/consumed"
import { consumedSlug } from "@/lib/tags"
import { SpotifyNowPlaying } from "@/components/consumed/SpotifyNowPlaying"
import { Separator } from "@/components/ui/separator"

export default function MusicContent() {
  return (
    <div className="container py-24 space-y-10">
      <div className="space-y-4 max-w-2xl">
        <Link
          href="/consumed"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Consumed
        </Link>
        <div className="flex items-center gap-3">
          <Music2 className="h-5 w-5 text-muted-foreground" />
          <h1 className="text-4xl font-bold tracking-tight">Music</h1>
        </div>
        <p className="text-base text-muted-foreground leading-relaxed">
          Artists and genres on heavy rotation this year. The music tab captures what shapes the mood of work sessions, commutes and quiet mornings.
        </p>
      </div>

      <div className="flex justify-center">
        <SpotifyNowPlaying />
      </div>

      <Separator />

      <div className="space-y-4">
        <h2 className="text-sm font-mono text-muted-foreground uppercase tracking-widest">Artists</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {artists.map((a) => (
            <Link
              key={a.name}
              href={`/consumed/music/${consumedSlug(a.name)}`}
              className="group rounded-xl border border-border/60 bg-card p-4 space-y-1.5 block hover:border-primary/40 transition-colors"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">{a.name}</p>
                  <p className="text-xs text-muted-foreground">{a.genre}</p>
                </div>
                {a.youtubeId && (
                  <ExternalLink className="h-3.5 w-3.5 shrink-0 text-muted-foreground/40 group-hover:text-primary/60 transition-colors" />
                )}
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">{a.note}</p>
            </Link>
          ))}
        </div>
      </div>

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

      <p className="text-xs text-muted-foreground max-w-lg leading-relaxed">
        I listen to far more than I can list here. Songs come and go with the season.
        The genres above are the constants.
      </p>
    </div>
  )
}
