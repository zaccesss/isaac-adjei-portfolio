// Central place for all route paths and navigation links.
// I define everything here so if a URL ever changes, I only have to update it once.

// All the URL paths used across the site
export const ROUTES = {
  home: "/",
  about: "/about",
  projects: "/projects",
  experience: "/experience",
  skills: "/skills",
  blog: "/blog",
  notes: "/notes",
  lab: "/lab",
  contact: "/contact",
  links: "/links",
} as const

// The label + href for each item shown in the nav bar
export const NAV_LINKS = [
  { label: "Home", href: ROUTES.home },
  { label: "About", href: ROUTES.about },
  { label: "Projects", href: ROUTES.projects },
  { label: "Experience", href: ROUTES.experience },
  { label: "Skills", href: ROUTES.skills },
  { label: "Blog", href: ROUTES.blog },
  { label: "Notes", href: ROUTES.notes },
  { label: "Contact", href: ROUTES.contact },
  { label: "Links", href: ROUTES.links },
] as const

// The canonical site URL - reads from an env variable in production, falls back to the live host
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.isaacadjei.me"
