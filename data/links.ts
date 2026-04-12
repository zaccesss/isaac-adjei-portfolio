export interface LinkItem {
  title: string
  description: string
  url: string
  icon: string
  iconImage?: string
  category: "professional" | "social" | "content"
}

export const profileLinks: LinkItem[] = [
  // Professional
  {
    title: "Portfolio",
    description: "isaacadjei.me - Engineering & CS projects",
    url: "https://isaacadjei.me",
    icon: "globe",
    category: "professional",
  },
  {
    title: "zacess.com",
    description: "My personal website & digital home",
    url: "https://zacess.com",
    icon: "globe",
    iconImage: "/images/zacess_logo.png",
    category: "professional",
  },
  {
    title: "LinkedIn",
    description: "Career, projects & professional updates",
    url: "https://www.linkedin.com/in/isaacadjei",
    icon: "linkedin",
    category: "professional",
  },
  {
    title: "GitHub",
    description: "My engineering & tech portfolio - code",
    url: "https://www.github.com/zaccesss",
    icon: "github",
    category: "professional",
  },
  {
    title: "Substack",
    description: "Writing on tech, engineering & ideas",
    url: "https://substack.com/@zaccess",
    icon: "substack",
    category: "professional",
  },
  {
    title: "Email",
    description: "contact@zacess.com",
    url: "mailto:contact@zacess.com",
    icon: "mail",
    category: "professional",
  },
  // Social
  {
    title: "X (Twitter)",
    description: "Updates, thoughts & takes",
    url: "https://x.com/zaccesss",
    icon: "twitter",
    category: "social",
  },
  {
    title: "Threads",
    description: "Follow on Threads",
    url: "https://www.threads.net/@zac.cesss",
    icon: "threads",
    category: "social",
  },
  {
    title: "Instagram",
    description: "Behind the scenes",
    url: "https://instagram.com/zac.cesss",
    icon: "instagram",
    category: "social",
  },
  {
    title: "TikTok",
    description: "Follow - help me unlock LIVE access",
    url: "https://www.tiktok.com/@zac.cesss",
    icon: "tiktok",
    category: "social",
  },
  {
    title: "Pinterest",
    description: "My digital vision & tech board",
    url: "https://pinterest.com/zaccessss",
    icon: "pinterest",
    category: "social",
  },
  // Content
  {
    title: "YouTube",
    description: "Videos & shorts",
    url: "https://www.youtube.com/channel/UCA5k2Hs7ISUFjyDTVDWB3Og",
    icon: "youtube",
    category: "content",
  },
  {
    title: "Twitch",
    description: "Watch me live",
    url: "https://www.twitch.tv/zaccesss",
    icon: "twitch",
    category: "content",
  },
  {
    title: "Discord",
    description: "Join the ZACCESS community - free",
    url: "https://discord.gg/habvhrGX4s",
    icon: "discord",
    category: "content",
  },
  {
    title: "Spotify",
    description: "My Spotify vibes",
    url: "https://open.spotify.com/user/31ft5mriyu5bwmavvevqs2qsrsmm",
    icon: "spotify",
    category: "content",
  },
]
