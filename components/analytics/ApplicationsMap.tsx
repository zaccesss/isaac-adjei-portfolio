"use client"

// A real interactive map of application locations - pan/zoom/rotate/click, pulsing markers for
// recent applications (mirroring LiveStatusCards' own pulsing dots elsewhere on the dashboard).
// MapLibre GL JS (the open-source Mapbox GL fork) for the engine, OpenFreeMap for tiles - both
// genuinely free forever, no account, no API key, no card, and OpenFreeMap's tiles include real
// 3D building shapes. Only ever reads lat/lng from location_geocodes, which
// isaac-adjei-automations' geocode-locations.mjs job populates - this component never geocodes
// anything itself.
import { useMemo, useState } from "react"
import MapGL, { Marker, NavigationControl, Popup } from "react-map-gl/maplibre"
import "maplibre-gl/dist/maplibre-gl.css"
import { STATUS_COLOURS, normaliseStatus } from "@/lib/application-status"

const OPENFREEMAP_STYLE = "https://tiles.openfreemap.org/styles/liberty"
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

  const selectedPin = pins.find((p) => p.id === selected) ?? null
  const avgLat = pins.reduce((s, p) => s + p.lat, 0) / pins.length
  const avgLng = pins.reduce((s, p) => s + p.lng, 0) / pins.length

  return (
    <div className="flex flex-col gap-2">
      <div className="h-[420px] w-full overflow-hidden rounded-lg border border-border">
        <MapGL
          initialViewState={{ latitude: avgLat, longitude: avgLng, zoom: 3.5, pitch: 30 }}
          mapStyle={OPENFREEMAP_STYLE}
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
                <div className="relative cursor-pointer" title={`${pin.company} - ${pin.role}`}>
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
          {selectedPin && (
            <Popup
              latitude={selectedPin.lat}
              longitude={selectedPin.lng}
              onClose={() => setSelected(null)}
              closeButton
              closeOnClick={false}
              offset={12}
            >
              <div className="text-xs space-y-0.5 text-black">
                <p className="font-semibold">{selectedPin.company}</p>
                <p>{selectedPin.role}</p>
                <p className="text-muted-foreground">{selectedPin.status}</p>
                <p className="text-muted-foreground">{selectedPin.location}</p>
              </div>
            </Popup>
          )}
        </MapGL>
      </div>
      <p className="text-[10px] text-muted-foreground">
        {pins.length} geocoded application{pins.length !== 1 ? "s" : ""} shown
        {ungeocodedCount > 0 ? ` - ${ungeocodedCount} more waiting on the next geocoding run` : ""}.
        Pulsing pins mark applications from the last {RECENT_DAYS} days.
      </p>
    </div>
  )
}
