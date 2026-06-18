"use client"

// I show the 2 most recent newsletter issues on the homepage with their cover thumbnails
// so visitors can see what the newsletter looks like before subscribing.
// I fetch from /api/newsletter-issues and silently skip the section if none exist yet.

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { ArrowRight, ExternalLink, Rss } from "lucide-react"
import { Button } from "@/components/ui/button"
import { staggerContainer, fadeUp } from "@/lib/animations"
import type { NewsletterIssue } from "@/app/api/newsletter-issues/route"

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })
}

function IssueCard({ issue }: { issue: NewsletterIssue }) {
  return (
    <a
      href={issue.webUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="group block rounded-lg border border-border/60 bg-muted/40 hover:bg-muted/60 hover:border-border transition-all overflow-hidden"
    >
      {issue.thumbnailUrl && (
        <div className="relative w-full h-40 overflow-hidden bg-muted">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={issue.thumbnailUrl}
            alt=""
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        </div>
      )}
      <div className="px-5 py-4 space-y-2">
        <p className="text-sm font-semibold leading-snug group-hover:text-primary transition-colors line-clamp-2">
          {issue.title}
        </p>
        {issue.subtitle && (
          <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
            {issue.subtitle}
          </p>
        )}
        <div className="flex items-center justify-between pt-1">
          <span className="font-mono text-xs text-muted-foreground">{formatDate(issue.publishDate)}</span>
          <ExternalLink className="h-3 w-3 text-muted-foreground group-hover:text-primary transition-colors" />
        </div>
      </div>
    </a>
  )
}

function SkeletonCard() {
  return (
    <div className="rounded-lg border border-border/60 bg-muted/40 overflow-hidden animate-pulse">
      <div className="w-full h-40 bg-muted" />
      <div className="px-5 py-4 space-y-3">
        <div className="h-3.5 w-3/4 rounded bg-muted" />
        <div className="h-3 w-full rounded bg-muted" />
        <div className="h-3 w-2/3 rounded bg-muted" />
        <div className="h-3 w-1/3 rounded bg-muted" />
      </div>
    </div>
  )
}

export default function FeaturedNewsletterIssues() {
  const [issues, setIssues] = useState<NewsletterIssue[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    ;(async () => {
      try {
        const r = await fetch("/api/newsletter-issues")
        const data = await r.json()
        setIssues(Array.isArray(data) ? data.slice(0, 2) : [])
      } catch {
        setIssues([])
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  // In production: hide the section entirely if no issues so the homepage stays clean.
  // In development: show placeholder cards so the layout is visible without a real API key.
  const isDev = process.env.NODE_ENV === "development"
  if (!loading && issues.length === 0 && !isDev) return null

  return (
    <section className="py-16 border-t">
      <div className="container space-y-8">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="space-y-8"
        >
          <motion.div variants={fadeUp} className="flex items-end justify-between">
            <div className="space-y-2">
              <p className="text-sm font-mono text-primary uppercase tracking-widest flex items-center gap-1.5">
                <Rss className="h-3.5 w-3.5" />
                Newsletter
              </p>
              <h2 className="text-2xl font-bold tracking-tight">Recent issues</h2>
            </div>
            <Button asChild variant="ghost" className="hidden sm:flex">
              <Link href="/newsletter">
                All issues
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </motion.div>

          <motion.div variants={fadeUp} className="grid gap-4 sm:grid-cols-2">
            {loading
              ? [0, 1].map((i) => <SkeletonCard key={i} />)
              : issues.length > 0
                ? issues.map((issue) => <IssueCard key={issue.id} issue={issue} />)
                : [0, 1].map((i) => <SkeletonCard key={i} />)}
          </motion.div>

          <motion.div variants={fadeUp} className="flex sm:hidden">
            <Button asChild variant="outline">
              <Link href="/newsletter">
                All issues
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
