// Turns a raw applications.location string plus its geocode cache row into a real "City, Country
// code" display label - shared between the public applications-locations API route and the
// dashboard's own Applications analytics page, since both aggregate the same messy source data
// (fab/site codes, "N Locations" placeholders from a scraped job board) into city-level counts and
// both need the same city/country merge so two differently-worded raw strings for the same real
// city collapse into one point instead of showing as separate near-duplicate entries.
export interface GeocodeRow {
  location: string
  lat: number | null
  lng: number | null
  city?: string | null
  country_code?: string | null
}

export function cityLabel(raw: string, g: Pick<GeocodeRow, "city" | "country_code"> | undefined): string {
  if (g?.city && g?.country_code) return `${g.city}, ${g.country_code}`
  return raw
}

// A "Remote" location genuinely means something (a real remote-work role) even though it has no
// coordinate to plot - isaac-adjei-automations' geocode-locations.mjs now deliberately leaves these
// unresolved rather than let them land on a coincidentally-matching real place (previously "Remote"
// variants had all landed on an actual unincorporated place literally named Remote, Oregon). Rather
// than let that count silently vanish from the Top 10 cities charts, both charts fold it back in as
// its own explicit, non-geocoded "Remote" bucket - the map itself still cannot plot it, since it
// has no real coordinate, only the count-only charts can show it.
export function isRemoteLocation(raw: string): boolean {
  return /\bremote\b/i.test(raw)
}

export interface LocationPoint {
  location: string
  lat: number
  lng: number
  count: number
}

// Merges points that resolved to the same city/country label (or the same raw string, for anything
// not yet geocoded with city/country data) into one point with a summed count and a count-weighted
// average coordinate, rather than showing several near-duplicate pins/bars for the same real place.
export function mergeByLabel(rawPoints: LocationPoint[]): LocationPoint[] {
  const merged = new Map<string, { label: string; count: number; latSum: number; lngSum: number }>()
  for (const p of rawPoints) {
    const existing = merged.get(p.location)
    if (existing) {
      existing.count += p.count
      existing.latSum += p.lat * p.count
      existing.lngSum += p.lng * p.count
    } else {
      merged.set(p.location, { label: p.location, count: p.count, latSum: p.lat * p.count, lngSum: p.lng * p.count })
    }
  }
  return Array.from(merged.values()).map((m) => ({
    location: m.label,
    lat: m.latSum / m.count,
    lng: m.lngSum / m.count,
    count: m.count,
  }))
}
