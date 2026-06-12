"use client"

// I mount invisible sentinel divs at 25%, 50%, 75%, and 100% of the article
// and fire a one-time POST to /api/blog/read-event when each is scrolled into view.
// Using IntersectionObserver means there is zero scroll-listener overhead.

import { useEffect, useRef } from "react"

// I track which thresholds have already been reported so each fires at most once.
const THRESHOLDS = [25, 50, 75, 100] as const
type Depth = (typeof THRESHOLDS)[number]

export default function ScrollDepthTracker({ slug }: { slug: string }) {
  // I store the set of already-reported depths across re-renders without
  // triggering a re-render itself.
  const reported = useRef<Set<Depth>>(new Set())

  useEffect(() => {
    // I skip firing when there is no slug to record against.
    if (!slug) return

    const sentinels: HTMLElement[] = []
    const observers: IntersectionObserver[] = []

    for (const depth of THRESHOLDS) {
      // I create an invisible 1px div positioned at the relevant article percentage.
      const el = document.createElement("div")
      el.style.cssText = `
        position: absolute;
        top: ${depth}%;
        left: 0;
        height: 1px;
        width: 1px;
        pointer-events: none;
        visibility: hidden;
      `
      // I append the sentinel to the article element if it exists, otherwise the body.
      const article = document.querySelector("article") ?? document.body
      article.style.position = article.style.position || "relative"
      article.appendChild(el)
      sentinels.push(el)

      const observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            // I only fire once per threshold to avoid duplicate events on scroll up/down.
            if (entry.isIntersecting && !reported.current.has(depth)) {
              reported.current.add(depth)
              // I use sendBeacon when available so the request is not cancelled by
              // rapid navigation — it queues even if the page is closing.
              const payload = JSON.stringify({ slug, depth })
              if (navigator.sendBeacon) {
                navigator.sendBeacon(
                  "/api/blog/read-event",
                  new Blob([payload], { type: "application/json" }),
                )
              } else {
                // I fall back to a fire-and-forget fetch for older browsers.
                fetch("/api/blog/read-event", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: payload,
                  keepalive: true,
                }).catch(() => undefined)
              }
              // I disconnect once fired so the observer is not retained in memory.
              observer.disconnect()
            }
          }
        },
        { threshold: 0 },
      )

      observer.observe(el)
      observers.push(observer)
    }

    // I clean up all sentinels and observers when the component unmounts or slug changes.
    return () => {
      for (const obs of observers) obs.disconnect()
      for (const el of sentinels) el.remove()
    }
  }, [slug])

  // I render nothing — the tracker is purely behavioural.
  return null
}
