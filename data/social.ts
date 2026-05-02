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
    url: "https://linktr.ee/zaccess",
    icon: "link",
    username: "linktr.ee/zaccess",
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
    name: "Email",
    url: "mailto:contact@zacess.com",
    icon: "mail",
    username: "contact@zacess.com",
  },
]
