// Generates /sitemap.xml automatically at build time.
// Next.js App Router reads this file and serves the output at /sitemap.xml.
// Googlebot and other crawlers use the sitemap to discover all pages efficiently.
// If you add a new route, add a matching entry here.

import { MetadataRoute } from "next"
import { posts } from "@/data/blog"
import { projects } from "@/data/projects"
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
    { url: `${SITE_URL}/cv`,                            lastModified: new Date("2026-04-01"), changeFrequency: "monthly", priority: 0.6  },
    { url: `${SITE_URL}/contact`,                       lastModified: new Date("2026-04-01"), changeFrequency: "yearly",  priority: 0.5  },
    { url: `${SITE_URL}/links`,                         lastModified: new Date("2026-04-01"), changeFrequency: "monthly", priority: 0.4  },
    { url: `${SITE_URL}/notes`,                         lastModified: new Date("2026-05-01"), changeFrequency: "monthly", priority: 0.6  },
    { url: `${SITE_URL}/notes/world-cup-ai-predictor`,  lastModified: new Date("2026-03-01"), changeFrequency: "monthly", priority: 0.5  },
    { url: `${SITE_URL}/notes/prosthetics-health-tech`, lastModified: new Date("2026-03-01"), changeFrequency: "monthly", priority: 0.5  },
    { url: `${SITE_URL}/lab`,                           lastModified: new Date("2026-05-15"), changeFrequency: "monthly", priority: 0.5  },
    { url: `${SITE_URL}/newsletter`,                    lastModified: new Date("2026-05-01"), changeFrequency: "yearly",  priority: 0.5  },
    { url: `${SITE_URL}/security-policy`,               lastModified: new Date("2026-04-01"), changeFrequency: "yearly",  priority: 0.3  },
    { url: `${SITE_URL}/hall-of-fame`,                  lastModified: new Date("2026-04-01"), changeFrequency: "yearly",  priority: 0.3  },
  ]

  const projectRoutes: MetadataRoute.Sitemap = projects.map((project) => ({
    url: `${SITE_URL}/projects/${project.id}`,
    lastModified: projectDate(project.date),
    changeFrequency: "monthly",
    priority: project.featured ? 0.8 : 0.6,
  }))

  const blogRoutes: MetadataRoute.Sitemap = posts
    .filter((post) => post.published)
    .map((post) => ({
      url: `${SITE_URL}/blog/${post.slug}`,
      lastModified: new Date(post.date),
      changeFrequency: "monthly",
      priority: 0.6,
    }))

  return [...staticRoutes, ...projectRoutes, ...blogRoutes]
}
