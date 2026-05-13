"use client"

// Contact form with three layers of spam protection:
// 1. Honeypot field (_hp) - hidden from real users but bots fill it in, so if it's not empty I reject the submission.
// 2. Cloudflare Turnstile CAPTCHA - verifies the user is human before the form is submitted.
// 3. Server-side rate limiting in the API route (3 submissions per IP per 10 minutes).
// Failed requests show the API's `error` string when present (Turnstile hostname mismatch, rate limit, etc.).

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Send, Loader2 } from "lucide-react"
import { Turnstile } from "@marsidev/react-turnstile"
import type { TurnstileInstance } from "@marsidev/react-turnstile"

export default function ContactForm() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" })
  // Mirror of the Turnstile token for enabling the submit button; the widget ref is the source of truth at send time.
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null)
  // Server-returned error text (e.g. Turnstile hostname mismatch) so users see more than a generic failure.
  const [errorDetail, setErrorDetail] = useState<string | null>(null)
  const turnstileRef = useRef<TurnstileInstance>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorDetail(null)

    // Prefer getResponse() from the widget: React state can lag behind or hold an expired token while the UI still looks "solved".
    const liveToken = turnstileRef.current?.getResponse?.() ?? turnstileToken
    if (!liveToken) return

    setStatus("loading")
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          _hp:
            (e.currentTarget as HTMLFormElement).querySelector<HTMLInputElement>("[name=_hp]")
              ?.value ?? "",
          turnstileToken: liveToken,
        }),
      })

      // API always returns JSON with either { success: true } or { error: string }.
      const data = (await res.json().catch(() => ({}))) as { success?: boolean; error?: string }

      if (!res.ok) {
        setStatus("error")
        setErrorDetail(data.error ?? `Something went wrong (${res.status}). Please try again.`)
        setTurnstileToken(null)
        turnstileRef.current?.reset()
        return
      }

      setStatus("success")
      setForm({ name: "", email: "", subject: "", message: "" })
      setTurnstileToken(null)
      turnstileRef.current?.reset()
    } catch {
      setStatus("error")
      setErrorDetail("Network error. Check your connection and try again.")
      setTurnstileToken(null)
      turnstileRef.current?.reset()
    }
  }

  const field =
    "w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Honeypot: leave empty; if filled, API returns fake success so scrapers cannot probe the endpoint. */}
      <input
        type="text"
        name="_hp"
        autoComplete="off"
        aria-hidden="true"
        tabIndex={-1}
        className="hidden"
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="name" className="text-sm font-medium">
            Name
          </label>
          <input
            id="name"
            type="text"
            required
            placeholder="Your name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className={field}
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium">
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            placeholder="your@email.com"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className={field}
          />
        </div>
      </div>
      <div className="space-y-2">
        <label htmlFor="subject" className="text-sm font-medium">
          Subject
        </label>
        <input
          id="subject"
          type="text"
          required
          placeholder="What's this about?"
          value={form.subject}
          onChange={(e) => setForm({ ...form, subject: e.target.value })}
          className={field}
        />
      </div>
      <div className="space-y-2">
        <label htmlFor="message" className="text-sm font-medium">
          Message
        </label>
        <textarea
          id="message"
          required
          rows={5}
          placeholder="What's on your mind?"
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
          className={field}
        />
      </div>

      <Turnstile
        ref={turnstileRef}
        siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!}
        // Auto-refresh when Cloudflare expires the token or times out, so users are not stuck with a stale "Success" state.
        options={{
          refreshExpired: "auto",
          refreshTimeout: "auto",
        }}
        onSuccess={(token) => setTurnstileToken(token)}
        onExpire={() => setTurnstileToken(null)}
        onError={() => setTurnstileToken(null)}
      />

      {status === "success" && (
        <p className="text-sm text-green-600 dark:text-green-400">
          Message sent! I&apos;ll get back to you soon.
        </p>
      )}
      {status === "error" && (
        <p className="text-sm text-destructive">
          {errorDetail ?? "Something went wrong. Please try again."}
        </p>
      )}

      <Button
        type="submit"
        // Block send until Turnstile has issued a token (state mirrors widget; see liveToken in handleSubmit).
        disabled={status === "loading" || !turnstileToken}
        className="w-full sm:w-auto"
      >
        {status === "loading" ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Send className="mr-2 h-4 w-4" />
        )}
        {status === "loading" ? "Sending..." : "Send Message"}
      </Button>
    </form>
  )
}
