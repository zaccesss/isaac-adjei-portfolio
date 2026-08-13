"use client"

// I catch unhandled runtime errors at the root layout level and give visitors a
// calm fallback rather than a blank Next.js error screen.

import { useEffect } from "react"
import Link from "next/link"
import { AlertTriangle, RotateCcw, Home } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="container max-w-md py-32 flex flex-col items-center text-center gap-8">
      <div className="flex flex-col items-center gap-4">
        <div className="p-3 rounded-full bg-destructive/10">
          <AlertTriangle className="h-8 w-8 text-destructive" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">Something went wrong</h1>
          <p className="text-muted-foreground leading-relaxed">
            This page ran into an unexpected error. Try again or head back home.
          </p>
          {error.digest && (
            <p className="text-xs font-mono text-muted-foreground/60 pt-1">
              ref: {error.digest}
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-3 justify-center">
        <Button onClick={reset} variant="default" className="gap-2">
          <RotateCcw className="h-4 w-4" />
          Try again
        </Button>
        <Button asChild variant="outline" className="gap-2">
          <Link href="/">
            <Home className="h-4 w-4" />
            Go home
          </Link>
        </Button>
      </div>

      <p className="text-xs text-muted-foreground">
        If this keeps happening, email me at{" "}
        <a
          href="mailto:contact@isaacadjei.me"
          className="text-primary underline underline-offset-4 hover:text-primary/80 transition-colors"
        >
          contact@isaacadjei.me
        </a>
        .
      </p>
    </div>
  )
}
