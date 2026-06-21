// Last.fm enrichment. Spotify deprecated artist genres (Mar 2025), so genre data now comes
// from Last.fm's artist.getTopTags - a read-only public lookup by artist name. Only
// LASTFM_API_KEY is needed (no auth, no scrobbling). Tags are cached in Redis for 7 days
// since an artist's genres barely move. Fails soft (returns []) when the key is missing so
// the lab still renders without it.
import { redis } from "@/lib/redis"

const LASTFM_API_KEY = process.env.LASTFM_API_KEY
const BASE = "https://ws.audioscrobbler.com/2.0/"

// Tags Last.fm returns that are not genres - dropped so the genre charts stay clean
const JUNK_TAGS = new Set([
  "seen live", "favorites", "favourites", "favorite", "favourite", "spotify",
  "my music", "love", "beautiful", "amazing", "best", "awesome", "music",
  "under 2000 listeners", "albums i own", "want to see live",
])

export interface LastfmTag { name: string; count: number }

export async function getArtistTags(artist: string): Promise<LastfmTag[]> {
  if (!LASTFM_API_KEY || !artist) return []
  const cacheKey = `lastfm:tags:${artist.toLowerCase()}`
  if (redis) {
    const cached = await redis.get<LastfmTag[]>(cacheKey)
    if (cached) return cached
  }
  try {
    const url =
      `${BASE}?method=artist.gettoptags&artist=${encodeURIComponent(artist)}` +
      `&api_key=${LASTFM_API_KEY}&format=json&autocorrect=1`
    const res = await fetch(url, { signal: AbortSignal.timeout(5000) })
    if (!res.ok) return []
    const data = (await res.json()) as { toptags?: { tag?: { name: string; count: number }[] } }
    const tags = (data.toptags?.tag ?? [])
      .map((t) => ({ name: t.name.toLowerCase().trim(), count: t.count }))
      .filter((t) => t.count > 0 && !JUNK_TAGS.has(t.name))
      .slice(0, 5)
    if (redis) await redis.set(cacheKey, tags, { ex: 60 * 60 * 24 * 7 })
    return tags
  } catch {
    return []
  }
}

// Fetch tags for many artists in parallel (each individually cached)
export async function getTagsForArtists(names: string[]): Promise<Record<string, LastfmTag[]>> {
  const out: Record<string, LastfmTag[]> = {}
  await Promise.all(
    names.map(async (name) => {
      out[name] = await getArtistTags(name)
    }),
  )
  return out
}

// Aggregate genres across a ranked artist list: higher-ranked artists weigh more, and each
// artist's tags weigh by their Last.fm strength. Returns sorted [{ genre, value }].
export function aggregateGenres(
  artists: { rank: number; tags: LastfmTag[] }[],
): { genre: string; value: number }[] {
  const totals = new Map<string, number>()
  for (const { rank, tags } of artists) {
    const rankWeight = 1 / Math.sqrt(rank)
    for (const t of tags) {
      totals.set(t.name, (totals.get(t.name) ?? 0) + (t.count / 100) * rankWeight)
    }
  }
  return [...totals.entries()]
    .map(([genre, value]) => ({ genre, value: Math.round(value * 1000) / 1000 }))
    .sort((a, b) => b.value - a.value)
}
