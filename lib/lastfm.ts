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

// Last.fm's tags mix genuine genres with nationality, so an artist's own #1 tag can come back
// as a bare country or demonym rather than a genre at all - confirmed live against real listening
// history, where "Dave" (a UK rapper) topped out at "french" and "Kamal." at "United Kingdom",
// neither of which describes a genre. Checked as an EXACT match only, never a substring: several
// real genre names are themselves compound terms that legitimately include a place word - "french
// house", "UK drill", "UK garage", "k-pop", "j-pop" - and a substring check would wrongly blocklist
// every one of those alongside the bare place names this is actually meant to catch.
const PLACE_TAGS = new Set([
  "uk", "united kingdom", "england", "english", "britain", "british", "scotland", "scottish",
  "wales", "welsh", "ireland", "irish", "france", "french", "germany", "german", "italy", "italian",
  "spain", "spanish", "usa", "america", "american", "canada", "canadian", "australia", "australian",
  "nigeria", "nigerian", "ghana", "ghanaian", "jamaica", "jamaican", "africa", "african", "europe",
  "european", "asia", "asian", "korea", "korean", "japan", "japanese", "china", "chinese", "brazil",
  "brazilian", "mexico", "mexican", "russia", "russian", "india", "indian", "sweden", "swedish",
  "norway", "norwegian", "denmark", "danish", "netherlands", "dutch", "poland", "polish", "portugal",
  "portuguese", "south africa", "south african",
])

// Last.fm's tags are free-form and anyone can add one to any artist, so a low-data artist
// can come back with nothing but junk - e.g. an *arr media-manager label like
// "funk_add_to_lidarr_batch_5" someone tagged onto an artist by mistake. Real genre tags are
// always space or hyphen separated ("hip hop", "drum-and-bass"), never snake_case, so an
// underscore is a reliable enough signal to drop it rather than trying to blocklist every
// possible junk string.
function isJunkTag(name: string): boolean {
  return JUNK_TAGS.has(name) || PLACE_TAGS.has(name) || name.includes("_")
}

export interface LastfmTag { name: string; count: number }

// Normalise a genre for de-duplication: "hip-hop", "hip hop" and "Hip Hop" all collapse to
// the same key so they merge into a single genre instead of showing twice. A trailing plural
// "s" is dropped too so "afrobeats" folds into "afrobeat"; the length guard leaves short keys
// like "rnb" alone. The most popular spelling is kept for display, so nothing stored changes.
export function genreKey(name: string): string {
  const key = name.toLowerCase().replace(/[\s\-_/&]+/g, "")
  return key.length > 3 ? key.replace(/s$/, "") : key
}

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

    // Last.fm returns tags newest-popularity-first; keep the first spelling of each genre
    const raw = (data.toptags?.tag ?? [])
      .map((t) => ({ name: t.name.toLowerCase().trim(), count: t.count }))
      .filter((t) => t.count > 0 && !isJunkTag(t.name))
    const seen = new Set<string>()
    const tags: LastfmTag[] = []
    for (const t of raw) {
      const k = genreKey(t.name)
      if (seen.has(k)) continue
      seen.add(k)
      tags.push(t)
      if (tags.length >= 5) break
    }

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
// artist's tags weigh by their Last.fm strength. De-duplicates by normalised key (so
// "hip-hop" and "hip hop" merge), keeping the most popular spelling for display.
export function aggregateGenres(
  artists: { rank: number; tags: LastfmTag[] }[],
): { genre: string; value: number }[] {
  const totals = new Map<string, { value: number; display: string; count: number }>()
  for (const { rank, tags } of artists) {
    const rankWeight = 1 / Math.sqrt(rank)
    for (const t of tags) {
      const k = genreKey(t.name)
      const cur = totals.get(k)
      if (cur) {
        cur.value += (t.count / 100) * rankWeight
        if (t.count > cur.count) { cur.display = t.name; cur.count = t.count }
      } else {
        totals.set(k, { value: (t.count / 100) * rankWeight, display: t.name, count: t.count })
      }
    }
  }
  return [...totals.values()]
    .map(({ display, value }) => ({ genre: display, value: Math.round(value * 1000) / 1000 }))
    .sort((a, b) => b.value - a.value)
}
