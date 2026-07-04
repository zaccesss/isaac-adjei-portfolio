// I generate /sitemap.xml at build time - only public routes, never /dashboard or any private path.
// If you add a new public route, add an entry here.

import { MetadataRoute } from "next"
import { getPublishedPosts } from "@/data/blog"
import { getPublishedTILEntries } from "@/data/til"
import { projects } from "@/data/projects"
import { publications } from "@/data/respub"
import { books, videos, podcasts, articles, resources, others, artists } from "@/data/consumed"
import { normTag, consumedSlug } from "@/lib/tags"
import { SITE_URL } from "@/lib/constants"

// I parse a project date string ("2026", "2025 - Present", etc.) to a real Date.
// Ongoing projects use today; finished ones use 1 Jan of the stated year.
function projectDate(dateStr: string): Date {
  if (dateStr.endsWith("Present")) return new Date()
  const year = dateStr.split(" - ")[0].trim()
  return new Date(`${year}-01-01`)
}

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: SITE_URL,                                    lastModified: new Date("2026-05-15"), changeFrequency: "monthly", priority: 1    },
    { url: `${SITE_URL}/about`,                         lastModified: new Date("2026-04-01"), changeFrequency: "monthly", priority: 0.9  },
    { url: `${SITE_URL}/projects`,                      lastModified: new Date("2026-05-13"), changeFrequency: "monthly", priority: 0.8  },
    { url: `${SITE_URL}/experience`,                    lastModified: new Date("2026-04-01"), changeFrequency: "monthly", priority: 0.8  },
    { url: `${SITE_URL}/skills`,                        lastModified: new Date("2026-04-01"), changeFrequency: "monthly", priority: 0.7  },
    { url: `${SITE_URL}/blog`,                          lastModified: new Date("2026-05-14"), changeFrequency: "weekly",  priority: 0.7  },
    { url: `${SITE_URL}/contact`,                       lastModified: new Date("2026-04-01"), changeFrequency: "yearly",  priority: 0.5  },
    { url: `${SITE_URL}/links`,                         lastModified: new Date("2026-04-01"), changeFrequency: "monthly", priority: 0.4  },
    { url: `${SITE_URL}/notes`,                         lastModified: new Date("2026-05-29"), changeFrequency: "monthly", priority: 0.6  },
    { url: `${SITE_URL}/notes/world-cup-ai-predictor`,  lastModified: new Date("2026-03-01"), changeFrequency: "monthly", priority: 0.5  },
    { url: `${SITE_URL}/notes/prosthetics-health-tech`, lastModified: new Date("2026-03-01"), changeFrequency: "monthly", priority: 0.5  },
    { url: `${SITE_URL}/notes/codeforces-auto-push`,    lastModified: new Date("2026-06-19"), changeFrequency: "monthly", priority: 0.5  },
    { url: `${SITE_URL}/lab`,                           lastModified: new Date("2026-05-15"), changeFrequency: "monthly", priority: 0.5  },
    { url: `${SITE_URL}/newsletter`,                    lastModified: new Date("2026-05-29"), changeFrequency: "yearly",  priority: 0.5  },
    { url: `${SITE_URL}/now`,                           lastModified: new Date("2026-05-29"), changeFrequency: "weekly",  priority: 0.7  },
    { url: `${SITE_URL}/consumed`,                      lastModified: new Date("2026-06-17"), changeFrequency: "weekly",  priority: 0.6  },
    { url: `${SITE_URL}/consumed/videos`,               lastModified: new Date("2026-06-17"), changeFrequency: "weekly",  priority: 0.5  },
    { url: `${SITE_URL}/consumed/podcasts`,             lastModified: new Date("2026-06-17"), changeFrequency: "weekly",  priority: 0.5  },
    { url: `${SITE_URL}/consumed/books`,                lastModified: new Date("2026-06-17"), changeFrequency: "weekly",  priority: 0.5  },
    { url: `${SITE_URL}/consumed/music`,                lastModified: new Date("2026-06-17"), changeFrequency: "monthly", priority: 0.4  },
    { url: `${SITE_URL}/consumed/resources`,            lastModified: new Date("2026-06-17"), changeFrequency: "weekly",  priority: 0.5  },
    { url: `${SITE_URL}/consumed/articles`,             lastModified: new Date("2026-06-17"), changeFrequency: "weekly",  priority: 0.5  },
    { url: `${SITE_URL}/consumed/others`,               lastModified: new Date("2026-06-17"), changeFrequency: "weekly",  priority: 0.5  },
    { url: `${SITE_URL}/uses`,                          lastModified: new Date("2026-05-29"), changeFrequency: "monthly", priority: 0.5  },
    { url: `${SITE_URL}/changelog`,                     lastModified: new Date("2026-05-29"), changeFrequency: "weekly",  priority: 0.5  },
    { url: `${SITE_URL}/colophon`,                      lastModified: new Date("2026-05-29"), changeFrequency: "yearly",  priority: 0.4  },
    { url: `${SITE_URL}/all-pages`,                     lastModified: new Date("2026-05-15"), changeFrequency: "monthly", priority: 0.4  },
    // /privacy is deliberately absent: the page is noindex, and listing it here sent Google
    // conflicting signals (GSC "excluded by noindex" validation failures).
    { url: `${SITE_URL}/security-policy`,               lastModified: new Date("2026-04-01"), changeFrequency: "yearly",  priority: 0.3  },
    { url: `${SITE_URL}/hall-of-fame`,                  lastModified: new Date("2026-04-01"), changeFrequency: "yearly",  priority: 0.3  },
    { url: `${SITE_URL}/respub`,           lastModified: new Date("2026-06-16"), changeFrequency: "monthly", priority: 0.7  },
    { url: `${SITE_URL}/til`,             lastModified: new Date("2026-06-16"), changeFrequency: "weekly",  priority: 0.6  },
    { url: `${SITE_URL}/tags`,            lastModified: new Date("2026-06-18"), changeFrequency: "weekly",  priority: 0.6  },
    { url: `${SITE_URL}/search`,          lastModified: new Date("2026-06-18"), changeFrequency: "monthly", priority: 0.5  },
  ]

  const projectRoutes: MetadataRoute.Sitemap = projects.map((project) => ({
    url: `${SITE_URL}/projects/${project.id}`,
    lastModified: projectDate(project.date),
    changeFrequency: "monthly",
    priority: project.featured ? 0.8 : 0.6,
  }))

  const blogRoutes: MetadataRoute.Sitemap = getPublishedPosts()
    .map((post) => ({
      url: `${SITE_URL}/blog/${post.slug}`,
      lastModified: new Date(post.date),
      changeFrequency: "monthly",
      priority: 0.6,
    }))

  // I only include TIL entries whose date has passed - future-dated entries are noindex anyway.
  const tilRoutes: MetadataRoute.Sitemap = getPublishedTILEntries()
    .map((entry) => ({
      url: `${SITE_URL}/til/${entry.id}`,
      lastModified: new Date(entry.date),
      changeFrequency: "never" as const,
      priority: 0.5,
    }))

  // I collect all unique normalised tag slugs across all content types for /tags/[tag] routes.
  const tagSlugs = new Set<string>()
  for (const post of getPublishedPosts()) post.tags.forEach((t) => tagSlugs.add(normTag(t)))
  for (const til of getPublishedTILEntries()) til.tags?.forEach((t) => tagSlugs.add(normTag(t)))
  for (const project of projects) project.technologies.forEach((t) => tagSlugs.add(normTag(t)))
  for (const pub of publications) pub.keywords?.forEach((t) => tagSlugs.add(normTag(t)))
  for (const v of videos) v.tags.forEach((t) => tagSlugs.add(normTag(t)))
  for (const a of articles) a.tags.forEach((t) => tagSlugs.add(normTag(t)))
  for (const o of others) o.tags.forEach((t) => tagSlugs.add(normTag(t)))
  for (const b of books) tagSlugs.add(normTag(b.genre))

  const tagRoutes: MetadataRoute.Sitemap = [...tagSlugs].map((slug) => ({
    url: `${SITE_URL}/tags/${slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.4,
  }))

  const consumedItemRoutes: MetadataRoute.Sitemap = [
    ...books.map((b) => ({ url: `${SITE_URL}/consumed/books/${consumedSlug(b.title)}`,       lastModified: new Date(), changeFrequency: "yearly" as const, priority: 0.4 })),
    ...videos.map((v) => ({ url: `${SITE_URL}/consumed/videos/${consumedSlug(v.title)}`,     lastModified: new Date(), changeFrequency: "yearly" as const, priority: 0.4 })),
    ...podcasts.map((p) => ({ url: `${SITE_URL}/consumed/podcasts/${consumedSlug(p.title)}`, lastModified: new Date(), changeFrequency: "yearly" as const, priority: 0.4 })),
    ...articles.map((a) => ({ url: `${SITE_URL}/consumed/articles/${consumedSlug(a.title)}`, lastModified: new Date(), changeFrequency: "yearly" as const, priority: 0.4 })),
    ...resources.map((r) => ({ url: `${SITE_URL}/consumed/resources/${consumedSlug(r.title)}`, lastModified: new Date(), changeFrequency: "yearly" as const, priority: 0.4 })),
    ...others.map((o) => ({ url: `${SITE_URL}/consumed/others/${consumedSlug(o.title)}`,     lastModified: new Date(), changeFrequency: "yearly" as const, priority: 0.4 })),
    ...artists.map((a) => ({ url: `${SITE_URL}/consumed/music/${consumedSlug(a.name)}`,      lastModified: new Date(), changeFrequency: "yearly" as const, priority: 0.4 })),
  ]

  return [...staticRoutes, ...projectRoutes, ...blogRoutes, ...tilRoutes, ...tagRoutes, ...consumedItemRoutes]
}
