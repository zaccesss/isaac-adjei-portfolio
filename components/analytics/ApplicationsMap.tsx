"use client"

// A real interactive map of application locations - pan/zoom/rotate/click, pulsing markers for
// recent applications (mirroring LiveStatusCards' own pulsing dots elsewhere on the dashboard).
// MapLibre GL JS (the open-source Mapbox GL fork) for the engine, OpenFreeMap for tiles - both
// genuinely free forever, no account, no API key, no card. Only ever reads lat/lng from
// location_geocodes, which isaac-adjei-automations' geocode-locations.mjs job populates - this
// component never geocodes anything itself.
import { useMemo, useState } from "react"
import Link from "next/link"
import MapGL, { Marker, NavigationControl, Popup } from "react-map-gl/maplibre"
import "maplibre-gl/dist/maplibre-gl.css"
import { STATUS_COLOURS, normaliseStatus } from "@/lib/application-status"
import { Globe2, Map as MapIcon, ExternalLink } from "lucide-react"

// OpenFreeMap ships a handful of free vector styles - no satellite/aerial imagery exists in its
// free tier (that needs real aerial photography, which no genuinely free tile source hosts), so
// the toggle switches between its own styles rather than faking a satellite option.
const STYLES = {
  streets: { label: "Streets", url: "https://tiles.openfreemap.org/styles/liberty" },
  light: { label: "Light", url: "https://tiles.openfreemap.org/styles/positron" },
} as const

const RECENT_DAYS = 14

export interface MapApplication {
  id: string
  company: string
  role: string
  status: string
  location: string | null
  created_at: string
}

interface Geocode {
  location: string
  lat: number | null
  lng: number | null
}

export function ApplicationsMap({ apps, geocodes }: { apps: MapApplication[]; geocodes: Geocode[] }) {
  const [selected, setSelected] = useState<string | null>(null)
  const [hovered, setHovered] = useState<string | null>(null)
  // "light" (positron) is the default rather than "streets" (liberty) since liberty renders full
  // 3D building extrusions on every pan/zoom, which is genuinely GPU-heavy with many pins on
  // screen - positron is flat vector tiles with no extrusion layer, real work over cosmetics.
  const [style, setStyle] = useState<keyof typeof STYLES>("light")
  const [globe, setGlobe] = useState(false)
  // Lazy useState initialiser, not a bare Date.now() call in render - computed once on mount so
  // "recent" stays stable for the component's lifetime rather than shifting on every re-render.
  const [nowMs] = useState(() => Date.now())

  const geocodeByLocation = useMemo(() => {
    const m = new Map<string, { lat: number; lng: number }>()
    for (const g of geocodes) {
      if (g.lat != null && g.lng != null) m.set(g.location, { lat: g.lat, lng: g.lng })
    }
    return m
  }, [geocodes])

  const pins = useMemo(() => {
    const recentCutoff = nowMs - RECENT_DAYS * 24 * 60 * 60 * 1000
    return apps
      .filter((a) => a.location)
      .map((a) => {
        const coords = geocodeByLocation.get(a.location as string)
        if (!coords) return null
        return {
          ...a,
          ...coords,
          isRecent: new Date(a.created_at).getTime() >= recentCutoff,
        }
      })
      .filter((p): p is NonNullable<typeof p> => p !== null)
  }, [apps, geocodeByLocation, nowMs])

  const ungeocodedCount = apps.filter((a) => a.location && !geocodeByLocation.has(a.location)).length

  if (pins.length === 0) {
    return (
      <p className="text-xs text-muted-foreground py-12 text-center">
        No geocoded locations yet. {ungeocodedCount > 0 ? `${ungeocodedCount} location${ungeocodedCount !== 1 ? "s" : ""} waiting on the next geocoding run.` : "Add a location to an application to see it here."}
      </p>
    )
  }

  const activePin = pins.find((p) => p.id === (selected ?? hovered)) ?? null
  const avgLat = pins.reduce((s, p) => s + p.lat, 0) / pins.length
  const avgLng = pins.reduce((s, p) => s + p.lng, 0) / pins.length

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-end gap-1">
        {(Object.entries(STYLES) as [keyof typeof STYLES, (typeof STYLES)[keyof typeof STYLES]][]).map(([key, s]) => (
          <button
            key={key}
            type="button"
            onClick={() => setStyle(key)}
            className={`text-[10px] px-2 py-1 rounded border transition-colors ${style === key ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:text-foreground"}`}
          >
            {s.label}
          </button>
        ))}
        <button
          type="button"
          onClick={() => setGlobe((g) => !g)}
          title="Toggle globe projection"
          className={`flex items-center gap-1 text-[10px] px-2 py-1 rounded border transition-colors ${globe ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:text-foreground"}`}
        >
          {globe ? <Globe2 className="h-3 w-3" /> : <MapIcon className="h-3 w-3" />}
          {globe ? "Globe" : "Flat"}
        </button>
      </div>
      <div className="h-[420px] w-full overflow-hidden rounded-lg border border-border">
        <MapGL
          initialViewState={{ latitude: avgLat, longitude: avgLng, zoom: 3.5 }}
          mapStyle={STYLES[style].url}
          projection={globe ? "globe" : "mercator"}
          style={{ width: "100%", height: "100%" }}
        >
          <NavigationControl position="top-right" />
          {pins.map((pin) => {
            const colour = STATUS_COLOURS[normaliseStatus(pin.status)] ?? "hsl(var(--primary))"
            return (
              <Marker
                key={pin.id}
                latitude={pin.lat}
                longitude={pin.lng}
                onClick={(e) => {
                  e.originalEvent.stopPropagation()
                  setSelected(pin.id)
                }}
              >
                <div
                  className="relative cursor-pointer"
                  onMouseEnter={() => setHovered(pin.id)}
                  onMouseLeave={() => setHovered((h) => (h === pin.id ? null : h))}
                >
                  {pin.isRecent && (
                    <span
                      className="absolute inset-0 rounded-full animate-ping"
                      style={{ background: colour, opacity: 0.5 }}
                    />
                  )}
                  <span
                    className="relative block h-3 w-3 rounded-full border-2 border-white shadow"
                    style={{ background: colour }}
                  />
                </div>
              </Marker>
            )
          })}
          {activePin && (
            <Popup
              latitude={activePin.lat}
              longitude={activePin.lng}
              onClose={() => { setSelected(null); setHovered(null) }}
              closeButton={selected === activePin.id}
              closeOnClick={false}
              offset={12}
            >
              <div className="text-xs space-y-1 text-black min-w-[140px]">
                <p className="font-semibold">{activePin.company}</p>
                <p>{activePin.role}</p>
                <p className="flex items-center gap-1">
                  <span className="inline-block h-2 w-2 rounded-full" style={{ background: STATUS_COLOURS[normaliseStatus(activePin.status)] ?? "hsl(var(--primary))" }} />
                  {activePin.status}
                </p>
                <p className="text-muted-foreground">{activePin.location}</p>
                {selected === activePin.id && (
                  <Link
                    href="/dashboard/applications"
                    className="flex items-center gap-1 text-primary hover:underline pt-1"
                  >
                    Open in Applications <ExternalLink className="h-3 w-3" />
                  </Link>
                )}
              </div>
            </Popup>
          )}
        </MapGL>
      </div>
      <p className="text-[10px] text-muted-foreground">
        {pins.length} geocoded application{pins.length !== 1 ? "s" : ""} shown
        {ungeocodedCount > 0 ? ` - ${ungeocodedCount} more waiting on the next geocoding run` : ""}.
        Pulsing pins mark applications from the last {RECENT_DAYS} days. Hover a pin for a quick
        preview, click it to open the full popup with a link back to the application.
      </p>
    </div>
  )
}
