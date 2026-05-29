// The small set of social links that appear in the site footer and hero section.
// The 'icon' string maps to a component in the iconMap inside SocialLinks.tsx.

export interface SocialLink {
  name: string
  url: string
  icon: string
  username?: string
}

export const socialLinks: SocialLink[] = [
  {
    name: "All Pages",
    url: "/all-pages",
    icon: "globe",
    username: "all-pages",
  },
  {
    name: "Contact",
    url: "/contact",
    icon: "mail",
    username: "contact",
  },
  {
    name: "Newsletter",
    url: "/newsletter",
    icon: "newsletter",
    username: "newsletter",
  },
  {
    name: "LinkedIn",
    url: "https://linkedin.com/in/isaacadjei",
    icon: "linkedin",
    username: "@isaacadjei",
  },
  {
    name: "GitHub",
    url: "https://github.com/zaccesss",
    icon: "github",
    username: "@zaccesss",
  },
  {
    name: "ORCID",
    url: "https://orcid.org/0009-0001-8298-5098",
    icon: "orcid",
    username: "0009-0001-8298-5098",
  },
]
