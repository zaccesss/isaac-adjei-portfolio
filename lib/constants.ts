export const ROUTES = {
  home: "/",
  about: "/about",
  projects: "/projects",
  experience: "/experience",
  skills: "/skills",
  contact: "/contact",
  links: "/links",
} as const

export const NAV_LINKS = [
  { label: "About", href: ROUTES.about },
  { label: "Projects", href: ROUTES.projects },
  { label: "Experience", href: ROUTES.experience },
  { label: "Skills", href: ROUTES.skills },
  { label: "Contact", href: ROUTES.contact },
  { label: "Links", href: ROUTES.links },
] as const

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://isaacadjei.me"
