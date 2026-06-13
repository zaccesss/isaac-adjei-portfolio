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
  // Secondary pages - not in the main nav but discoverable via command menu and footer
  now: "/now",
  uses: "/uses",
  colophon: "/colophon",
  changelog: "/changelog",
  consumed: "/consumed",
  newsletter: "/newsletter",
  hallOfFame: "/hall-of-fame",
  allPages: "/all-pages",
} as const

// The label + href for each item shown in the nav bar.
// Lab, Notes and Now are removed from the primary nav — discoverable via /all-pages and the command menu.
export const NAV_LINKS = [
  { label: "About", href: ROUTES.about },
  { label: "Experience", href: ROUTES.experience },
  { label: "Projects", href: ROUTES.projects },
  { label: "Skills", href: ROUTES.skills },
  { label: "Blog", href: ROUTES.blog },
  { label: "Newsletter", href: ROUTES.newsletter },
  { label: "Contact", href: ROUTES.contact },
  { label: "Links", href: ROUTES.links },
  { label: "More", href: ROUTES.allPages },
] as const

// The canonical site URL - reads from an env variable in production, falls back to the live host
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.isaacadjei.me"
