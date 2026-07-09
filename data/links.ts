// I list all my public profiles grouped by category for the /links page.

import { DISCORD_USER_ID } from "@/lib/site-config"

export interface LinkItem {
  title: string
  description: string
  url: string
  icon: string
  iconImage?: string
  category:
    | "professional"
    | "writing"
    | "academic"
    | "code"
    | "competitive"
    | "hackathons"
    | "social"
    | "content"
    | "support"
    | "other"
}

export const profileLinks: LinkItem[] = [
  // Professional
  {
    title: "Portfolio",
    description: "Projects, blog, CV and everything me",
    url: "https://www.isaacadjei.me",
    icon: "globe",
    iconImage: "/images/avatar.webp",
    category: "professional",
  },
  {
    title: "Business Site",
    description: "My business and digital home",
    url: "https://zacess.com",
    icon: "globe",
    iconImage: "/images/zacess_logo.webp",
    category: "professional",
  },
  {
    title: "Email",
    description: "Get in touch - hello@isaacadjei.me",
    url: "mailto:hello@isaacadjei.me",
    icon: "mail",
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
    title: "Wellfound",
    description: "Startup jobs and internship applications",
    url: "https://wellfound.com/u/zaccesss",
    icon: "wellfound",
    category: "professional",
  },
  // Writing
  {
    title: "Newsletter",
    description: "Weekly engineering, tech and ideas",
    url: "https://newsletter.isaacadjei.me/",
    icon: "newspaper",
    iconImage: "/images/brands/beehiiv.webp",
    category: "writing",
  },
  {
    title: "Substack",
    description: "Long-form writing on tech and ideas",
    url: "https://substack.com/@zaccess",
    icon: "substack",
    category: "writing",
  },
  {
    title: "dev.to",
    description: "Developer community posts and articles",
    url: "https://dev.to/zaccesss",
    icon: "devdotto",
    category: "writing",
  },
  // Academic
  {
    title: "ORCID",
    description: "Researcher ID and academic profile",
    url: "https://orcid.org/0009-0001-8298-5098",
    icon: "orcid",
    category: "academic",
  },
  {
    title: "Google Scholar",
    description: "Publications, papers and research citations",
    url: "https://scholar.google.com/citations?user=YZq0XuMAAAAJ",
    icon: "googlescholar",
    category: "academic",
  },
  {
    title: "ResearchGate",
    description: "Academic network, papers and research profile",
    url: "https://www.researchgate.net/profile/Isaac-Adjei-15",
    icon: "researchgate",
    category: "academic",
  },
  // Code
  {
    title: "GitHub",
    description: "Code, projects and open source",
    url: "https://www.github.com/zaccesss",
    icon: "github",
    category: "code",
  },
  {
    title: "Stack Overflow",
    description: "Developer Q&A and community answers",
    url: "https://stackoverflow.com/users/32850859/zaccesss",
    icon: "stackoverflow",
    category: "code",
  },
  {
    title: "GitLab",
    description: "Mirror repositories and pipeline configs",
    url: "https://gitlab.com/zaccesss",
    icon: "gitlab",
    category: "code",
  },
  {
    title: "Gitea",
    description: "Mirror repositories on Gitea",
    url: "https://gitea.com/zaccesss",
    icon: "gitea",
    category: "code",
  },
  {
    title: "Codeberg",
    description: "Open source forks and contributions",
    url: "https://codeberg.org/zaccesss",
    icon: "codeberg",
    category: "code",
  },
  {
    title: "Bitbucket",
    description: "Repositories and team projects",
    url: "https://bitbucket.org/zaccessss/",
    icon: "bitbucket",
    category: "code",
  },
  {
    title: "Hackster",
    description: "Hardware projects and maker community",
    url: "https://www.hackster.io/zaccesss",
    icon: "hackster",
    category: "code",
  },
  // Competitive Programming
  {
    title: "LeetCode",
    description: "Problem solving and algorithmic practice",
    url: "https://leetcode.com/u/zacadjei",
    icon: "leetcode",
    category: "competitive",
  },
  {
    title: "NeetCode",
    description: "Structured roadmap and solved problems",
    url: "https://neetcode.io/profile/zaccess",
    icon: "neetcode",
    iconImage: "/images/brands/neetcode.webp",
    category: "competitive",
  },
  {
    title: "AtCoder",
    description: "Competitive programming and algorithm contests",
    url: "https://atcoder.jp/users/zaccesss",
    icon: "atcoder",
    iconImage: "/images/brands/atcoder.webp",
    category: "competitive",
  },
  {
    title: "Codeforces",
    description: "Competitive programming and contest rating",
    url: "https://codeforces.com/profile/zaccesss",
    icon: "codeforces",
    category: "competitive",
  },
  {
    title: "CodeChef",
    description: "Competitive programming and contests",
    url: "https://www.codechef.com/users/zaccesss",
    icon: "codechef",
    category: "competitive",
  },
  {
    title: "HackerRank",
    description: "Coding assessments and skill certificates",
    url: "https://www.hackerrank.com/profile/zaccesss",
    icon: "hackerrank",
    category: "competitive",
  },
  {
    title: "TryHackMe",
    description: "Cybersecurity challenges and learning paths",
    url: "https://tryhackme.com/p/zaccesss",
    icon: "tryhackme",
    category: "competitive",
  },
  {
    title: "Kaggle",
    description: "Data science competitions and notebooks",
    url: "https://www.kaggle.com/zaccessss",
    icon: "kaggle",
    category: "competitive",
  },
  // Hackathons
  {
    title: "Devpost",
    description: "Hackathon projects and competition entries",
    url: "https://devpost.com/zaccesss",
    icon: "devpost",
    category: "hackathons",
  },
  {
    title: "Devfolio",
    description: "Hackathon portfolio and project showcase",
    url: "https://devfolio.co/@zaccesss",
    icon: "devfolio",
    iconImage: "/images/brands/devfolio.webp",
    category: "hackathons",
  },
  // Social
  {
    title: "Bluesky",
    description: "Posts and updates on Bluesky",
    url: "https://bsky.app/profile/isaacadjei.me",
    icon: "bluesky",
    category: "social",
  },
  {
    title: "X (Twitter)",
    description: "Thoughts, takes and live updates",
    url: "https://x.com/zaccessss",
    icon: "twitter",
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
    title: "Threads",
    description: "Casual posts and quick updates",
    url: "https://www.threads.net/@zac.cesss",
    icon: "threads",
    category: "social",
  },
  {
    title: "Discord",
    description: "Add me and send a message",
    url: `https://discord.com/users/${DISCORD_USER_ID}`,
    icon: "discord",
    category: "social",
  },
  {
    title: "Pinterest",
    description: "Boards, visual inspiration and ideas",
    url: "https://pinterest.com/zaccesss",
    icon: "pinterest",
    category: "social",
  },
  {
    title: "PlayStation",
    description: "PSN: zac_cess - add me to play",
    url: "https://www.playstation.com/en-gb/profiles/zac_cess/",
    icon: "playstation",
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
  // Other
  {
    title: "Medium",
    description: "Articles and writing on Medium",
    url: "https://medium.com/@zaccesss",
    icon: "medium",
    category: "other",
  },
  {
    title: "Hashnode",
    description: "Developer blog on Hashnode",
    url: "https://hashnode.com/@zaccesss",
    icon: "hashnode",
    category: "other",
  },
]
