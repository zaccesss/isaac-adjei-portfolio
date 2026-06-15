// I define the footer and hero social links - the icon string maps to SocialLinks.tsx.

export interface SocialLink {
  name: string
  url: string
  icon: string
  username?: string
  footer?: boolean
}

export const socialLinks: SocialLink[] = [
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
  {
    name: "Buy Me a Coffee",
    url: "https://buymeacoffee.com/zaccesss",
    icon: "buymeacoffee",
    username: "zaccesss",
    footer: false,
  },
]
