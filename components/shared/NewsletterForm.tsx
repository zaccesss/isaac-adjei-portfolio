"use client"

import { useState } from "react"

interface NewsletterFormProps {
  variant?: "default" | "compact"
}

export default function NewsletterForm({ variant = "default" }: NewsletterFormProps) {
  const [email, setEmail] = useState("")
  const [state, setState] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [errorMsg, setErrorMsg] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setState("loading")
    setErrorMsg("")

    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      const data = await res.json()

      if (!res.ok) {
        setErrorMsg(data.error ?? "Something went wrong.")
        setState("error")
        return
      }

      setState("success")
      setEmail("")
    } catch {
      setErrorMsg("Something went wrong. Please try again.")
      setState("error")
    }
  }

  if (state === "success") {
    return (
      <div className="rounded-lg border border-border/60 bg-muted/30 px-6 py-5 text-center space-y-1">
        <p className="font-medium text-sm">You&apos;re on the list.</p>
        <p className="text-xs text-muted-foreground">
          Check your inbox to confirm your subscription.
        </p>
      </div>
    )
  }

  if (variant === "compact") {
    return (
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2 w-full max-w-sm">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          required
          disabled={state === "loading"}
          className="flex-1 rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={state === "loading"}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 whitespace-nowrap"
        >
          {state === "loading" ? "Subscribing..." : "Subscribe"}
        </button>
        {state === "error" && (
          <p className="text-xs text-destructive w-full">{errorMsg}</p>
        )}
      </form>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 w-full max-w-md">
      <div className="flex flex-col sm:flex-row gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          required
          disabled={state === "loading"}
          className="flex-1 rounded-md border border-border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={state === "loading"}
          className="rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 whitespace-nowrap"
        >
          {state === "loading" ? "Subscribing..." : "Subscribe"}
        </button>
      </div>
      {state === "error" && (
        <p className="text-xs text-destructive">{errorMsg}</p>
      )}
      <p className="text-xs text-muted-foreground">
        No spam. Unsubscribe anytime.
      </p>
    </form>
  )
}
