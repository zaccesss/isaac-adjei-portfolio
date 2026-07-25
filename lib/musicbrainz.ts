// MusicBrainz genre enrichment, cross-referenced by the exact Spotify artist ID rather than a name
// search. A plain-text artist search on MusicBrainz (or Discogs, tested the same way) cannot
// reliably disambiguate a common name - confirmed live against my own top artist: searching "Dave"
// on both services surfaced a dozen different unrelated musicians, never the actual UK rapper.
// Looking up MusicBrainz's own indexed relationship to that exact Spotify profile URL resolves to
// the correct entity every time instead, since it is keyed by the unique URL rather than a fuzzy
// name match. Genres then come from MusicBrainz's own curated `genres` field (its own taxonomy,
// not the generic community `tags` field), which reads far cleaner than Last.fm's freeform tags -
// the same real artist that returned "french" as its top Last.fm tag resolves here to a clean
// ["hip hop", "uk drill"], both genuine genres, with the same {name, count} shape Last.fm's tags
// use, so it slots into the existing aggregateGenres() weighting with no changes needed there.
import { redis } from "@/lib/redis"
import { isJunkTag } from "@/lib/lastfm"

const MB_BASE = "https://musicbrainz.org/ws/2"
const USER_AGENT = "isaac-adjei-portfolio/1.0 (https://isaacadjei.me)"

export interface MusicBrainzGenre { name: string; count: number }

// MusicBrainz enforces 1 request/second per IP without an API key (no key is available for this
// endpoint at all). A single shared queue serialises every call this module makes, so a batch of
// several cold-cache artists in one request never bursts past that limit and gets silently
// rate-limited instead. Each artist needs up to two calls (the URL lookup, then the artist genres
// lookup), and results are cached for a week, so this queue is only ever a cost on a cold cache.
let queue: Promise<unknown> = Promise.resolve()
function throttled<T>(fn: () => Promise<T>): Promise<T> {
  const result = queue.then(fn, fn)
  queue = result.then(
    () => new Promise((resolve) => setTimeout(resolve, 1100)),
    () => new Promise((resolve) => setTimeout(resolve, 1100)),
  )
  return result
}

interface MbUrlRelation {
  urls?: { "relation-list"?: { relations?: { artist?: { id?: string } }[] }[] }[]
}
interface MbArtist {
  genres?: { name: string; count: number }[]
}

async function mbFetch<T>(path: string): Promise<T | null> {
  return throttled(async () => {
    try {
      const res = await fetch(`${MB_BASE}${path}`, {
        headers: { "User-Agent": USER_AGENT },
        signal: AbortSignal.timeout(5000),
      })
      if (!res.ok) return null
      return (await res.json()) as T
    } catch {
      return null
    }
  })
}

// Looks up an artist's genres via their exact Spotify artist id. Returns [] (not an error) when
// MusicBrainz has no matching URL relationship or no genre tags for that artist, so a caller can
// treat this as "nothing extra available" and fall back to another source without special-casing
// a failure.
export async function getMusicBrainzGenresBySpotifyId(spotifyArtistId: string): Promise<MusicBrainzGenre[]> {
  if (!spotifyArtistId) return []
  const cacheKey = `musicbrainz:genres:${spotifyArtistId}`
  if (redis) {
    const cached = await redis.get<MusicBrainzGenre[]>(cacheKey)
    if (cached) return cached
  }

  const spotifyUrl = `https://open.spotify.com/artist/${spotifyArtistId}`
  const urlLookup = await mbFetch<MbUrlRelation>(`/url/?query=url:%22${encodeURIComponent(spotifyUrl)}%22&fmt=json&inc=artist-rels`)
  const mbid = urlLookup?.urls?.[0]?.["relation-list"]?.[0]?.relations?.[0]?.artist?.id
  if (!mbid) {
    if (redis) await redis.set(cacheKey, [], { ex: 60 * 60 * 24 * 7 })
    return []
  }

  const artist = await mbFetch<MbArtist>(`/artist/${mbid}?inc=genres&fmt=json`)
  // MusicBrainz's own curated taxonomy is generally clean, but the same shared filter Last.fm's
  // tags go through is applied here too rather than assuming that - one shared, source-agnostic
  // rule beats trusting either source to always be clean on its own.
  const raw = (artist?.genres ?? []).filter((g) => !isJunkTag(g.name))
  // MusicBrainz's own genre "count" is a small vote tally (typically single digits), nothing like
  // Last.fm's roughly-0-to-100 scale for the same field name. Rescaled relative to this artist's
  // own top genre (matching how Last.fm's count is also only ever relative to that artist, not a
  // global scale) so the two sources merge on comparable terms in mergeGenreTags() rather than
  // MusicBrainz's tags always reading as negligibly low weight purely from a scale mismatch.
  const maxCount = Math.max(...raw.map((g) => g.count), 1)
  const genres: MusicBrainzGenre[] = raw.map((g) => ({ name: g.name, count: Math.round((g.count / maxCount) * 100) }))
  if (redis) await redis.set(cacheKey, genres, { ex: 60 * 60 * 24 * 7 })
  return genres
}

// Batches the lookup for many artists. Each individual lookup is already Redis-cached, so a
// request where every artist is warm resolves immediately with no throttling cost at all; only
// genuinely new artists pay the queued 1-per-second rate.
export async function getMusicBrainzGenresForArtists(
  artists: { id: string; name: string }[],
): Promise<Record<string, MusicBrainzGenre[]>> {
  const out: Record<string, MusicBrainzGenre[]> = {}
  await Promise.all(
    artists.map(async (a) => {
      out[a.name] = await getMusicBrainzGenresBySpotifyId(a.id)
    }),
  )
  return out
}
