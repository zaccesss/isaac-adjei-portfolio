"use client"

import { useEffect, useRef } from "react"

const THRESHOLDS = [25, 50, 75, 100] as const
type Depth = (typeof THRESHOLDS)[number]

export default function ScrollDepthTracker({
  slug,
  postType = "blog",
}: {
  slug: string
  postType?: "blog" | "til"
}) {
  const reported = useRef<Set<Depth>>(new Set())

  useEffect(() => {
    if (!slug) return

    const sentinels: HTMLElement[] = []
    const observers: IntersectionObserver[] = []

    for (const depth of THRESHOLDS) {
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
      const article = document.querySelector("article") ?? document.body
      article.style.position = article.style.position || "relative"
      article.appendChild(el)
      sentinels.push(el)

      const observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting && !reported.current.has(depth)) {
              reported.current.add(depth)
              const payload = JSON.stringify({ slug, depth, type: postType })
              if (navigator.sendBeacon) {
                navigator.sendBeacon(
                  "/api/blog/read-event",
                  new Blob([payload], { type: "application/json" }),
                )
              } else {
                fetch("/api/blog/read-event", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: payload,
                  keepalive: true,
                }).catch(() => undefined)
              }
              observer.disconnect()
            }
          }
        },
        { threshold: 0 },
      )

      observer.observe(el)
      observers.push(observer)
    }

    return () => {
      for (const obs of observers) obs.disconnect()
      for (const el of sentinels) el.remove()
    }
  }, [slug, postType])

  return null
}
