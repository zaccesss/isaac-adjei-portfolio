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
    description: "View my engineering & CS projects — isaacadjei.me",
    url: "https://isaacadjei.me",
    icon: "globe",
    category: "professional",
  },
  {
    title: "zacess.com",
    description: "Visit my personal website & digital home",
    url: "https://zacess.com",
    icon: "globe",
    iconImage: "/images/zacess_logo.png",
    category: "professional",
  },
  {
    title: "LinkedIn",
    description: "Connect with me on LinkedIn — career & professional updates",
    url: "https://www.linkedin.com/in/isaacadjei",
    icon: "linkedin",
    category: "professional",
  },
  {
    title: "GitHub",
    description: "Follow on GitHub — code, engineering & open source projects",
    url: "https://www.github.com/zaccesss",
    icon: "github",
    category: "professional",
  },
  {
    title: "Substack",
    description: "Subscribe — writing on tech, engineering & ideas",
    url: "https://substack.com/@zaccess",
    icon: "substack",
    category: "professional",
  },
  {
    title: "Email",
    description: "Get in touch — contact@zacess.com",
    url: "mailto:contact@zacess.com",
    icon: "mail",
    category: "professional",
  },
  // Social
  {
    title: "X (Twitter)",
    description: "Follow on X — updates, thoughts & takes",
    url: "https://x.com/zaccessss",
    icon: "twitter",
    category: "social",
  },
  {
    title: "Threads",
    description: "Follow on Threads — @zac.cesss",
    url: "https://www.threads.net/@zac.cesss",
    icon: "threads",
    category: "social",
  },
  {
    title: "Instagram",
    description: "Follow on Instagram — behind the scenes",
    url: "https://instagram.com/zac.cesss",
    icon: "instagram",
    category: "social",
  },
  {
    title: "TikTok",
    description: "Follow on TikTok — help me unlock LIVE access",
    url: "https://www.tiktok.com/@zac.cesss",
    icon: "tiktok",
    category: "social",
  },
  {
    title: "Pinterest",
    description: "Follow on Pinterest — my digital vision & tech boards",
    url: "https://pinterest.com/zaccessss",
    icon: "pinterest",
    category: "social",
  },
  // Content
  {
    title: "YouTube",
    description: "Subscribe on YouTube — videos & shorts",
    url: "https://www.youtube.com/channel/UCA5k2Hs7ISUFjyDTVDWB3Og",
    icon: "youtube",
    category: "content",
  },
  {
    title: "Twitch",
    description: "Follow on Twitch — watch me live",
    url: "https://www.twitch.tv/zaccessss",
    icon: "twitch",
    category: "content",
  },
  {
    title: "Discord",
    description: "Join the ZACCESS community — it's free",
    url: "https://discord.gg/habvhrGX4s",
    icon: "discord",
    category: "content",
  },
  {
    title: "Spotify",
    description: "Follow on Spotify — see what I'm listening to",
    url: "https://open.spotify.com/user/31ft5mriyu5bwmavvevqs2qsrsmm",
    icon: "spotify",
    category: "content",
  },
]
