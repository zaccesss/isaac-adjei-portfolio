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
    name: "Website",
    url: "https://zacess.com",
    icon: "globe",
    username: "zacess.com",
  },
  {
    name: "Links",
    url: "https://www.isaacadjei.me/links",
    icon: "link",
    username: "www.isaacadjei.me/links",
  },
  {
    name: "Email",
    url: "mailto:contact@isaacadjei.me",
    icon: "mail",
    username: "contact@isaacadjei.me",
  },
  {
    name: "Newsletter",
    url: "https://isaacadjei.me/newsletter",
    icon: "newsletter",
    username: "isaacadjei.me/newsletter",
  },
  {
    name: "ORCID",
    url: "https://orcid.org/0009-0001-8298-5098",
    icon: "orcid",
    username: "0009-0001-8298-5098",
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
]
