// Dynamic blog post page. Looks up the post by slug from data/blog.ts.
// If the post exists but is not published, it returns 404 so draft URLs are not indexed.
// The renderBlock function is a switch statement that turns each ContentBlock
// into the appropriate JSX element (paragraph, heading, list, code block, etc.).

import type { Metadata } from "next"
import { notFound } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, ArrowRight, Clock, Calendar, ExternalLink } from "lucide-react"
import { getPostBySlug, getPublishedPosts, getAdjacentPosts, getSeriesPosts, SERIES_LABELS, posts, type ContentBlock, type PostType } from "@/data/blog"
import { projects } from "@/data/projects"
import { Badge } from "@/components/ui/badge"
import ReadingProgress from "@/components/shared/ReadingProgress"
import ScrollDepthTracker from "@/components/blog/ScrollDepthTracker"
import CodeBlock from "@/components/shared/CodeBlock"
import TableOfContents, { type TocHeading } from "@/components/shared/TableOfContents"
import BlogReactions from "@/components/shared/BlogReactions"
import SeriesBanner from "@/components/shared/SeriesBanner"
import ShareButton from "@/components/shared/ShareButton"
import GiscusComments from "@/components/blog/GiscusComments"
import AuthorCard from "@/components/blog/AuthorCard"

function renderInline(text: string): React.ReactNode {
  const parts = text.split(/(\[[^\]]+\]\([^)]+\))/g)
  if (parts.length === 1) return text
  return parts.map((part, i) => {
    const match = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/)
    if (match) {
      const isExternal = match[2].startsWith("http")
      return (
        <a
          key={i}
          href={match[2]}
          {...(isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
          className="underline underline-offset-2 decoration-primary/50 hover:decoration-primary transition-colors"
        >
          {match[1]}
        </a>
      )
    }
    return part
  })
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
}

function buildHeadingIds(content: ContentBlock[]): Map<number, string> {
  const counts = new Map<string, number>()
  const ids = new Map<number, string>()
  content.forEach((block, i) => {
    if (block.type !== "h2" && block.type !== "h3") return
    const base = slugify(block.text)
    const count = counts.get(base) ?? 0
    ids.set(i, count === 0 ? base : `${base}-${count}`)
    counts.set(base, count + 1)
  })
  return ids
}

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
  blog: "Blog",
  journal: "Journal",
  research: "Research",
  notes: "Notes",
  report: "Report",
  article: "Article",
  resources: "Resources",
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })
}

function renderBlock(block: ContentBlock, i: number, headingIds?: Map<number, string>, prevBlock?: ContentBlock): React.ReactNode {
  const afterAcknowledgements = prevBlock?.type === "h2" && prevBlock?.text === "Acknowledgements"
  switch (block.type) {
    case "p":
      return (
        <p key={i} className={`text-base leading-relaxed ${afterAcknowledgements ? "text-primary/90" : "text-foreground/90"}`}>
          {renderInline(block.text)}
        </p>
      )
    case "h2":
      return (
        <h2
          key={i}
          id={headingIds?.get(i)}
          className={`text-xl font-semibold tracking-tight mt-8 mb-2 scroll-mt-24 ${
            block.text === "Acknowledgements" ? "text-primary" : ""
          }`}
        >
          {block.text}
        </h2>
      )
    case "h3":
      return (
        <h3 key={i} id={headingIds?.get(i)} className="text-base font-semibold tracking-tight mt-6 mb-1 scroll-mt-24">
          {block.text}
        </h3>
      )
    case "ul":
      return (
        <ul key={i} className="space-y-1.5 list-none pl-0">
          {block.items.map((item, j) => (
            <li key={j} className="flex gap-2 text-base text-foreground/90">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
              <span>{renderInline(item)}</span>
            </li>
          ))}
        </ul>
      )
    case "ol":
      return (
        <ol key={i} className="space-y-1.5 list-none pl-0 counter-reset-[item]">
          {block.items.map((item, j) => (
            <li key={j} className="flex gap-3 text-base text-foreground/90">
              <span className="shrink-0 font-mono text-sm text-primary">
                {String(j + 1).padStart(2, "0")}.
              </span>
              <span>{renderInline(item)}</span>
            </li>
          ))}
        </ol>
      )
    case "code":
      return <CodeBlock key={i} lang={block.lang} text={block.text} />
    case "quote":
      return (
        <blockquote key={i} className="border-l-2 border-primary pl-5 py-1 space-y-1">
          <p className="text-base italic text-foreground/80">{block.text}</p>
          {block.source && (
            <p className="text-xs font-mono text-muted-foreground">- {block.source}</p>
          )}
        </blockquote>
      )
    case "ol-links":
      return (
        <ol key={i} className="space-y-2 list-none pl-0">
          {block.items.map((item, j) => (
            <li key={j} className="flex gap-3 text-sm text-foreground/90">
              <span className="shrink-0 font-mono text-sm text-primary">
                {String(j + 1).padStart(2, "0")}.
              </span>
              <span>
                {item.url ? (
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-primary transition-colors underline underline-offset-4"
                  >
                    {item.text}
                  </a>
                ) : (
                  item.text
                )}
              </span>
            </li>
          ))}
        </ol>
      )
    case "image":
      return (
        <figure key={i} className="space-y-2 my-2">
          <Image
            src={block.src}
            alt={block.alt}
            width={900}
            height={500}
            className="rounded-lg border border-border/60 w-full h-auto"
          />
          {block.caption && (
            <figcaption className="text-xs text-center text-muted-foreground italic">
              {block.caption}
            </figcaption>
          )}
        </figure>
      )
    case "video":
      return (
        <figure key={i} className="space-y-2 my-4">
          <div className="relative aspect-video rounded-lg overflow-hidden border border-border/60">
            <iframe
              src={`https://www.youtube.com/embed/${block.youtubeId}`}
              title={block.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="absolute inset-0 w-full h-full"
            />
          </div>
          {block.description && (
            <figcaption className="text-xs text-center text-muted-foreground italic">
              {block.description}
            </figcaption>
          )}
        </figure>
      )
    case "spotify":
      return (
        <figure key={i} className="space-y-2 my-4">
          <iframe
            src={`https://open.spotify.com/embed/episode/${block.episodeId}`}
            title={block.title}
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy"
            className="w-full h-[152px] rounded-lg border border-border/60"
          />
          {block.description && (
            <figcaption className="text-xs text-center text-muted-foreground italic">
              {block.description}
            </figcaption>
          )}
        </figure>
      )
    case "divider":
      return <hr key={i} className="border-border/40" />
    default:
      return null
  }
}

export async function generateStaticParams() {
  return posts.filter((p) => p.published).map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const post = getPostBySlug(slug)
  if (!post) return {}
  if (!post.published) {
    return {
      robots: {
        index: false,
        follow: false,
      },
    }
  }
  return {
    title: post.title,
    description: post.description,
    alternates: {
      canonical: `https://www.isaacadjei.me/blog/${slug}`,
    },
    openGraph: {
      images: [
        post.cover_image
          ? `${process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.isaacadjei.me"}${post.cover_image}`
          : `/api/og?title=${encodeURIComponent(post.title)}&description=${encodeURIComponent(post.description)}`,
      ],
    },
  }
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = getPostBySlug(slug)
  if (!post) notFound()
  if (!post.published && process.env.NODE_ENV !== "development") notFound()
  const linkedProject = post.projectSlug ? projects.find((p) => p.id === post.projectSlug) : null

  // I find related posts by counting shared tags, excluding the current post
  const relatedPosts = getPublishedPosts()
    .filter((p) => p.slug !== slug)
    .map((p) => ({
      ...p,
      sharedTags: p.tags.filter((t) => post.tags.includes(t)).length,
    }))
    .filter((p) => p.sharedTags > 0)
    .sort((a, b) => b.sharedTags - a.sharedTags)
    .slice(0, 3)

  const { prev, next } = getAdjacentPosts(slug)
  // I only fetch series data when the post actually belongs to one
  const seriesPosts = post.series ? getSeriesPosts(post.series) : []
  const seriesLabel = post.series ? (SERIES_LABELS[post.series] ?? post.series) : null
  const headingIds = buildHeadingIds(post.content)
  const tocHeadings: TocHeading[] = post.content
    .map((block, i) => {
      if (block.type !== "h2" && block.type !== "h3") return null
      return { id: headingIds.get(i)!, text: block.text, level: block.type === "h2" ? 2 : 3 } as TocHeading
    })
    .filter(Boolean) as TocHeading[]

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    dateModified: post.date,
    author: {
      "@type": "Person",
      name: "Isaac Adjei",
      url: "https://www.isaacadjei.me",
    },
    publisher: {
      "@type": "Person",
      name: "Isaac Adjei",
    },
    url: `https://www.isaacadjei.me/blog/${slug}`,
    keywords: post.tags.join(", "),
    timeRequired: `PT${post.readingTime}M`,
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <ReadingProgress />
      {post.published && <ScrollDepthTracker slug={slug} />}
    <div className="container max-w-2xl py-24 xl:max-w-5xl">
      {/* Back link */}
      <Link
        href="/blog"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-10"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        All writing
      </Link>

      {/* Post header */}
      <div className="space-y-4 mb-10">
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${TYPE_STYLES[post.type]}`}
          >
            {TYPE_LABELS[post.type]}
          </span>
          {!post.published && (
            <span className="inline-flex items-center rounded-full border border-dashed border-border px-2.5 py-0.5 font-mono text-xs text-muted-foreground">
              draft
            </span>
          )}
        </div>

        <h1 className="text-3xl font-bold tracking-tight leading-snug">{post.title}</h1>

        <p className="text-base text-muted-foreground leading-relaxed">{post.description}</p>

        <div className="flex items-center gap-4 text-xs text-muted-foreground font-mono">
          <span className="flex items-center gap-1.5">
            <Calendar className="h-3 w-3" />
            {formatDate(post.date)}
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="h-3 w-3" />
            {post.readingTime} min read
          </span>
          <div className="ml-auto">
            <ShareButton title={post.title} />
          </div>
        </div>

        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {post.tags.map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs font-normal">
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {post.cover_image && (
          <div className="relative w-full aspect-[21/9] overflow-hidden rounded-xl mt-4">
            <Image
              src={post.cover_image}
              alt={post.title}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 768px) 100vw, 800px"
            />
          </div>
        )}

        {linkedProject && (
          <div className="flex items-center gap-4 flex-wrap">
            <Link
              href={`/projects/${post.projectSlug}`}
              className="inline-flex items-center gap-1.5 text-sm text-primary hover:text-primary/80 transition-colors font-medium"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              View project page
            </Link>
            {linkedProject.github && (
              <a
                href={linkedProject.github}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors font-medium"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                GitHub
              </a>
            )}
          </div>
        )}
        <hr className="border-border/40" />
      </div>

      {/* Content + TOC */}
      <div className="xl:grid xl:grid-cols-[1fr_220px] xl:gap-12 xl:items-start">
        <div>
          {seriesLabel && seriesPosts.length > 1 && (
            <SeriesBanner
              seriesLabel={seriesLabel}
              posts={seriesPosts}
              currentSlug={slug}
            />
          )}
          {(post.published || process.env.NODE_ENV === "development") && post.content.length > 0 ? (
            <div className="space-y-5">
              {post.content.map((block, i) => renderBlock(block, i, headingIds, post.content[i - 1]))}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-border/60 p-12 text-center space-y-2">
              <p className="text-sm font-medium">This post is still being written.</p>
              <p className="text-xs text-muted-foreground">Check back soon.</p>
            </div>
          )}

          {/* Related posts */}
          {relatedPosts.length > 0 && (
            <div className="mt-16 pt-8 border-t border-border/40 space-y-4">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-widest font-mono">
                You might also like
              </h2>
              <div className="space-y-3">
                {relatedPosts.map((related) => (
                  <Link
                    key={related.slug}
                    href={`/blog/${related.slug}`}
                    className="group flex items-start justify-between gap-4 rounded-lg border border-border/60 bg-muted/20 px-4 py-3 hover:border-primary/40 hover:bg-muted/30 transition-all"
                  >
                    <div className="space-y-0.5 min-w-0">
                      <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors leading-snug line-clamp-1">
                        {related.title}
                      </p>
                      <p className="text-xs text-muted-foreground line-clamp-1 leading-relaxed">
                        {related.description}
                      </p>
                    </div>
                    <ArrowLeft className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary rotate-180 shrink-0 mt-0.5 transition-colors" />
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Prev/next navigation */}
          <div className="mt-8 pt-6 border-t border-border/40">
            <div className="grid grid-cols-2 gap-3">
              {prev ? (
                <Link
                  href={`/blog/${prev.slug}`}
                  className="group flex flex-col gap-1 rounded-lg border border-border/60 bg-muted/20 px-4 py-3 hover:border-primary/40 hover:bg-muted/30 transition-all"
                >
                  <span className="flex items-center gap-1 text-xs text-muted-foreground font-mono">
                    <ArrowLeft className="h-3 w-3" />
                    Previous
                  </span>
                  <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                    {prev.title}
                  </span>
                </Link>
              ) : (
                <div />
              )}
              {next ? (
                <Link
                  href={`/blog/${next.slug}`}
                  className="group flex flex-col gap-1 rounded-lg border border-border/60 bg-muted/20 px-4 py-3 hover:border-primary/40 hover:bg-muted/30 transition-all text-right ml-auto w-full"
                >
                  <span className="flex items-center justify-end gap-1 text-xs text-muted-foreground font-mono">
                    Next
                    <ArrowRight className="h-3 w-3" />
                  </span>
                  <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                    {next.title}
                  </span>
                </Link>
              ) : (
                <div />
              )}
            </div>
            <Link
              href="/blog"
              className="mt-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              All writing
            </Link>
          </div>

          {/* Author, reactions and comments - very bottom, after prev/next */}
          {post.published && process.env.NEXT_PUBLIC_GISCUS_ENABLED?.toLowerCase() === "true" && (
            <div className="mt-8 pt-6 border-t border-border/40 space-y-8">
              <AuthorCard />
              <div className="space-y-4">
                <div>
                  <h3 className="text-base font-semibold">Reactions</h3>
                  <p className="text-sm text-muted-foreground mt-0.5">No login needed. Tap an emoji to let me know what landed.</p>
                </div>
                <BlogReactions slug={slug} />
              </div>
              <div className="space-y-4">
                <div>
                  <h3 className="text-base font-semibold">Comments</h3>
                  <p className="text-sm text-muted-foreground mt-0.5">Have a thought, correction or question? Sign in with GitHub - I read every comment and reply where I can.</p>
                </div>
                <GiscusComments />
              </div>
            </div>
          )}
        </div>

        <TableOfContents headings={tocHeadings} />
      </div>
    </div>
    </>
  )
}
