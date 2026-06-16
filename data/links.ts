// I list all my public profiles grouped by category for the /links page.

export interface LinkItem {
  title: string
  description: string
  url: string
  icon: string
  iconImage?: string
  category: "professional" | "social" | "content" | "support"
}

export const profileLinks: LinkItem[] = [
  // Professional
  {
    title: "Portfolio",
    description: "Projects, blog and engineering work",
    url: "https://www.isaacadjei.me",
    icon: "globe",
    iconImage: "/images/avatar.png",
    category: "professional",
  },
  {
    title: "My business website",
    description: "My business and digital home",
    url: "https://zacess.com",
    icon: "globe",
    iconImage: "/images/zacess_logo.png",
    category: "professional",
  },
  // Linktree - hidden for now since the /links page on isaacadjei.me replaces it
  // {
  //   title: "Linktree",
  //   description: "All my links in one place - @zaccess",
  //   url: "https://linktr.ee/zaccess",
  //   icon: "linktree",
  //   category: "professional",
  // },
  {
    title: "Email",
    description: "Get in touch - hello@isaacadjei.me",
    url: "mailto:hello@isaacadjei.me",
    icon: "mail",
    category: "professional",
  },
  {
    title: "Newsletter",
    description: "Weekly engineering, tech and ideas",
    url: "https://newsletter.isaacadjei.me/",
    icon: "newspaper",
    category: "professional",
  },
  {
    title: "ORCID",
    description: "Researcher ID and academic profile",
    url: "https://orcid.org/0009-0001-8298-5098",
    icon: "orcid",
    category: "professional",
  },
  {
    title: "Google Scholar",
    description: "Publications, papers and research citations",
    url: "https://scholar.google.com/citations?user=YZq0XuMAAAAJ",
    icon: "googlescholar",
    category: "professional",
  },
  {
    title: "LinkedIn",
    description: "Career network and professional updates",
    url: "https://www.linkedin.com/in/isaacadjei",
    icon: "linkedin",
    category: "professional",
  },
  {
    title: "GitHub",
    description: "Code, projects and open source",
    url: "https://www.github.com/zaccesss",
    icon: "github",
    category: "professional",
  },
  {
    title: "GitLab",
    description: "Mirror repositories and pipeline configs",
    url: "https://gitlab.com/zaccesss",
    icon: "gitlab",
    category: "professional",
  },
  {
    title: "Codeberg",
    description: "Open source forks and contributions",
    url: "https://codeberg.org/zaccesss",
    icon: "codeberg",
    category: "professional",
  },
  {
    title: "LeetCode",
    description: "Problem solving and algorithmic practice",
    url: "https://leetcode.com/u/zacadjei",
    icon: "leetcode",
    category: "professional",
  },
  {
    title: "NeetCode",
    description: "Structured roadmap and solved problems",
    url: "https://neetcode.io/profile/zaccess",
    icon: "neetcode",
    iconImage: "/images/brands/neetcode.ico",
    category: "professional",
  },
  {
    title: "Devpost",
    description: "Hackathon projects and competition entries",
    url: "https://devpost.com/zaccesss",
    icon: "devpost",
    category: "professional",
  },
  {
    title: "Codeforces",
    description: "Competitive programming and contest rating",
    url: "https://codeforces.com/profile/zaccesss",
    icon: "codeforces",
    category: "professional",
  },
  {
    title: "Substack",
    description: "Long-form writing on tech and ideas",
    url: "https://substack.com/@zaccess",
    icon: "substack",
    category: "professional",
  },
  // Social
  {
    title: "X (Twitter)",
    description: "Thoughts, takes and live updates",
    url: "https://x.com/zaccesss",
    icon: "twitter",
    category: "social",
  },
  {
    title: "Threads",
    description: "Casual posts and quick updates",
    url: "https://www.threads.net/@zac.cesss",
    icon: "threads",
    category: "social",
  },
  {
    title: "Instagram",
    description: "Photos and behind-the-scenes moments",
    url: "https://instagram.com/zac.cesss",
    icon: "instagram",
    category: "social",
  },
  {
    title: "TikTok",
    description: "Short videos and tech content",
    url: "https://www.tiktok.com/@zac.cesss",
    icon: "tiktok",
    category: "social",
  },
  {
    title: "Pinterest",
    description: "Boards, visual inspiration and ideas",
    url: "https://pinterest.com/zaccesss",
    icon: "pinterest",
    category: "social",
  },
  // Content
  {
    title: "YouTube",
    description: "Videos, tutorials and tech shorts",
    url: "https://www.youtube.com/channel/UCA5k2Hs7ISUFjyDTVDWB3Og",
    icon: "youtube",
    category: "content",
  },
  {
    title: "Discord",
    description: "Add me and send a message",
    url: "https://discord.com/users/1087417301583790212",
    icon: "discord",
    category: "social",
  },
  {
    title: "PlayStation",
    description: "PSN: zac_cess - add me to play",
    url: "https://www.playstation.com/en-gb/profiles/zac_cess/",
    icon: "playstation",
    category: "social",
  },
  {
    title: "Discord Community",
    description: "Join the free ZACCESS community",
    url: "https://discord.gg/habvhrGX4s",
    icon: "discord",
    category: "content",
  },
  {
    title: "Spotify",
    description: "See what I'm currently listening to",
    url: "https://open.spotify.com/user/31ft5mriyu5bwmavvevqs2qsrsmm",
    icon: "spotify",
    category: "content",
  },
  {
    title: "Twitch",
    description: "Live coding sessions and gaming",
    url: "https://www.twitch.tv/zaccesss",
    icon: "twitch",
    category: "content",
  },
  {
    title: "Kick",
    description: "Live gaming streams and highlights",
    url: "https://kick.com/zaccess",
    icon: "kick",
    category: "content",
  },
  // Support
  {
    title: "GitHub Sponsors",
    description: "Support my open source work",
    url: "https://github.com/sponsors/zaccesss",
    icon: "githubsponsors",
    category: "support",
  },
  {
    title: "Buy Me a Coffee",
    description: "One-time tip if my work helped you",
    url: "https://buymeacoffee.com/zaccesss",
    icon: "buymeacoffee",
    category: "support",
  },
  {
    title: "Patreon",
    description: "Exclusive content and early access",
    url: "https://www.patreon.com/cw/zaccesss",
    icon: "patreon",
    category: "support",
  },
]
