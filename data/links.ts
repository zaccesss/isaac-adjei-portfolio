// Data for the /links page - all my profiles grouped by category.
// iconImage is an optional image path used instead of a vector icon for platforms
// that don't have a matching lucide/react-icons entry.

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
    description: "View my engineering & CS projects",
    url: "https://www.isaacadjei.me",
    icon: "globe",
    iconImage: "/images/avatar.png",
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
    title: "Linktree",
    description: "All my links in one place - @zaccess",
    url: "https://linktr.ee/zaccess",
    icon: "linktree",
    category: "professional",
  },
  {
    title: "Email",
    description: "Get in touch - contact@isaacadjei.me",
    url: "mailto:contact@isaacadjei.me",
    icon: "mail",
    category: "professional",
  },
  {
    title: "Newsletter",
    description: "Subscribe to my newsletter - engineering, tech, hardware, software and more",
    url: "https://isaacadjei.me/newsletter",
    icon: "newspaper",
    category: "professional",
  },
  {
    title: "ORCID",
    description: "My ORCID researcher profile",
    url: "https://orcid.org/0009-0001-8298-5098",
    icon: "orcid",
    category: "professional",
  },
  {
    title: "LinkedIn",
    description: "Connect with me on LinkedIn - career & professional updates",
    url: "https://www.linkedin.com/in/isaacadjei",
    icon: "linkedin",
    category: "professional",
  },
  {
    title: "GitHub",
    description: "Follow on GitHub - code, engineering & open source projects",
    url: "https://www.github.com/zaccesss",
    icon: "github",
    category: "professional",
  },
  {
    title: "LeetCode",
    description: "Track my LeetCode progress and problem-solving",
    url: "https://leetcode.com/u/zacadjei",
    icon: "leetcode",
    category: "professional",
  },
  {
    title: "NeetCode",
    description: "See my NeetCode roadmap and solved problems",
    url: "https://neetcode.io/profile/zaccess",
    icon: "neetcode",
    iconImage: "/images/brands/neetcode.ico",
    category: "professional",
  },
  {
    title: "Codeforces",
    description: "Follow my Codeforces contests and rating",
    url: "https://codeforces.com/profile/zaccesss",
    icon: "codeforces",
    category: "professional",
  },
  {
    title: "Substack",
    description: "Subscribe - writing on tech, engineering & ideas",
    url: "https://substack.com/@zaccess",
    icon: "substack",
    category: "professional",
  },
  // Social
  {
    title: "X (Twitter)",
    description: "Follow on X - updates, thoughts & takes",
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
    description: "Follow on Instagram - behind the scenes",
    url: "https://instagram.com/zac.cesss",
    icon: "instagram",
    category: "social",
  },
  {
    title: "TikTok",
    description: "Follow on TikTok - help me unlock LIVE access",
    url: "https://www.tiktok.com/@zac.cesss",
    icon: "tiktok",
    category: "social",
  },
  {
    title: "Pinterest",
    description: "Follow on Pinterest - my digital vision & tech boards",
    url: "https://pinterest.com/zaccesss",
    icon: "pinterest",
    category: "social",
  },
  // Content
  {
    title: "YouTube",
    description: "Subscribe on YouTube - videos & shorts",
    url: "https://www.youtube.com/channel/UCA5k2Hs7ISUFjyDTVDWB3Og",
    icon: "youtube",
    category: "content",
  },
  {
    title: "Discord",
    description: "Add me on Discord",
    url: "https://discord.com/users/1087417301583790212",
    icon: "discord",
    category: "social",
  },
  {
    title: "PlayStation",
    description: "Add me on PlayStation",
    url: "https://www.playstation.com/en-gb/profiles/zac_cess/",
    icon: "playstation",
    category: "social",
  },
  {
    title: "Discord Community",
    description: "Join the ZACCESS community - it's free",
    url: "https://discord.gg/habvhrGX4s",
    icon: "discord",
    category: "content",
  },
  {
    title: "Spotify",
    description: "Follow on Spotify - see what I'm listening to",
    url: "https://open.spotify.com/user/31ft5mriyu5bwmavvevqs2qsrsmm",
    icon: "spotify",
    category: "content",
  },
  {
    title: "Twitch",
    description: "Follow on Twitch - watch me live",
    url: "https://www.twitch.tv/zaccesss",
    icon: "twitch",
    category: "content",
  },
  {
    title: "Kick",
    description: "Follow on Kick - watch me live",
    url: "https://kick.com/zaccess",
    icon: "kick",
    category: "content",
  },
]
