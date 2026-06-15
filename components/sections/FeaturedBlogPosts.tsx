"use client"

// I show 4 featured blog posts on the homepage using the same card style as the blog listing page -
// cover image strip at the top, then badge, title, description and meta below.
// Posts are marked featured in blog.ts and sorted here by a fixed display order.

import { motion } from "framer-motion"
import Link from "next/link"
import Image from "next/image"
import { Calendar, Clock, ArrowRight } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { getFeaturedPosts } from "@/data/blog"
import { staggerContainer, fadeUp } from "@/lib/animations"
import type { BlogPost, PostType } from "@/data/blog"

const TYPE_STYLES: Record<PostType, string> = {
  blog: "bg-primary/10 text-primary border-primary/20",
  journal: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  research: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  notes: "bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border-zinc-500/20",
  report: "bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20",
  article: "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20",
  resources: "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20",
}

const TYPE_LABELS: Record<PostType, string> = {
  blog: "Blog", journal: "Journal", research: "Research", notes: "Notes",
  report: "Report", article: "Article", resources: "Resources",
}

// I control the display order here so the homepage grid always shows a curated sequence
// regardless of the chronological order posts were written.
const FEATURED_ORDER = [
  "resources-engineering-and-technology",
  "why-software-engineers-should-understand-hardware",
  "open-source-contributing",
  "ocular-prosthetics-bionic-vision",
]

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })
}

function FeaturedPostCard({ post }: { post: BlogPost }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group block rounded-lg border border-border/60 bg-muted/40 hover:bg-muted/60 hover:border-border transition-all overflow-hidden"
    >
      {post.cover_image && (
        <div className="relative w-full h-40 overflow-hidden">
          <Image
            src={post.cover_image}
            alt={post.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </div>
      )}
      <div className="px-5 py-4 space-y-3">
        <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${TYPE_STYLES[post.type]}`}>
          {TYPE_LABELS[post.type]}
        </span>
        <div className="space-y-1">
          <h3 className="text-sm font-semibold tracking-tight leading-snug group-hover:text-primary transition-colors line-clamp-2">
            {post.title}
          </h3>
          <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
            {post.description}
          </p>
        </div>
        <div className="flex items-center gap-4 text-xs text-muted-foreground font-mono">
          <span className="flex items-center gap-1.5">
            <Calendar className="h-3 w-3" />
            {formatDate(post.date)}
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="h-3 w-3" />
            {post.readingTime} min read
          </span>
        </div>
        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {post.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs font-normal">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </div>
    </Link>
  )
}

export default function FeaturedBlogPosts() {
  const all = getFeaturedPosts()
  const featured = FEATURED_ORDER
    .map((slug) => all.find((p) => p.slug === slug))
    .filter((p): p is BlogPost => p !== undefined)

  if (featured.length === 0) return null

  return (
    <section className="py-24 border-t">
      <div className="container space-y-10">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="space-y-10"
        >
          <motion.div variants={fadeUp} className="flex items-end justify-between">
            <div className="space-y-2">
              <p className="text-sm font-mono text-primary uppercase tracking-widest">Writing</p>
              <h2 className="text-3xl font-bold tracking-tight">Featured posts</h2>
            </div>
            <Button asChild variant="ghost" className="hidden sm:flex">
              <Link href="/blog">
                All posts
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </motion.div>

          <motion.div variants={fadeUp} className="grid gap-4 sm:grid-cols-2">
            {featured.map((post) => (
              <FeaturedPostCard key={post.slug} post={post} />
            ))}
          </motion.div>

          <motion.div variants={fadeUp} className="flex sm:hidden">
            <Button asChild variant="outline">
              <Link href="/blog">
                All posts
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
