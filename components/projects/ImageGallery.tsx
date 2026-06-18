"use client"

// Photo gallery grid with a fullscreen lightbox.
// Keyboard navigation: ArrowLeft / ArrowRight to move between images, Escape to close.
// I use useCallback for the keyboard handler so it can be safely added and removed
// from the document event listener without stale closure issues.

import { useState, useEffect, useCallback } from "react"
import Image from "next/image"
import { X, ChevronLeft, ChevronRight } from "lucide-react"

interface Props {
  images: string[]
  title: string
}

export default function ImageGallery({ images, title }: Props) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  const openLightbox = (index: number) => setLightboxIndex(index)
  const closeLightbox = () => setLightboxIndex(null)

  const prev = useCallback(() => {
    if (lightboxIndex === null) return
    setLightboxIndex((lightboxIndex - 1 + images.length) % images.length)
  }, [lightboxIndex, images.length])

  const next = useCallback(() => {
    if (lightboxIndex === null) return
    setLightboxIndex((lightboxIndex + 1) % images.length)
  }, [lightboxIndex, images.length])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (lightboxIndex === null) return
      if (e.key === "Escape") closeLightbox()
      if (e.key === "ArrowLeft") prev()
      if (e.key === "ArrowRight") next()
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [lightboxIndex, prev, next])

  if (images.length === 0) return null

  return (
    <>
      {/* Gallery grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {images.map((src, i) => (
          <button
            key={i}
            onClick={() => openLightbox(i)}
            className="group relative h-44 w-full overflow-hidden rounded-md bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            aria-label={`View ${title} image ${i + 1}`}
          >
            <Image
              src={src}
              alt={`${title} - image ${i + 1}`}
              fill
              className="object-cover sm:transition-transform sm:duration-300 sm:group-hover:scale-110"
              sizes="(max-width: 640px) 50vw, 33vw"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
          </button>
        ))}
      </div>

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          onClick={closeLightbox}
        >
          {/* Close */}
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors z-10"
            aria-label="Close"
          >
            <X className="h-7 w-7" />
          </button>

          {/* Prev */}
          {images.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                prev()
              }}
              className="absolute left-4 text-white/80 hover:text-white transition-colors z-10"
              aria-label="Previous image"
            >
              <ChevronLeft className="h-9 w-9" />
            </button>
          )}

          {/* Image */}
          <div
            className="relative max-h-[90vh] max-w-5xl w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={images[lightboxIndex]}
              alt={`${title} - image ${lightboxIndex + 1}`}
              width={1200}
              height={800}
              sizes="(max-width: 768px) 100vw, 1200px"
              className="object-contain max-h-[90vh] w-full rounded-md"
              priority
            />
          </div>

          {/* Next */}
          {images.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                next()
              }}
              className="absolute right-4 text-white/80 hover:text-white transition-colors z-10"
              aria-label="Next image"
            >
              <ChevronRight className="h-9 w-9" />
            </button>
          )}

          {/* Counter */}
          <p className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/60 text-sm">
            {lightboxIndex + 1} / {images.length}
          </p>
        </div>
      )}
    </>
  )
}
