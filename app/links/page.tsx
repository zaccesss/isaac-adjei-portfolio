// I render a Linktree-style links page grouping all my social and professional profiles by category.
// I use "use client" because the page has hover animations - there is no client-side data fetching.
// iconMap translates the icon string from data/links.ts to the correct React icon component.
// brandClasses applies platform-specific background and icon colours so each link looks distinct.
"use client"

import {
  FaGithub,
  FaLinkedin,
  FaXTwitter,
  FaInstagram,
  FaYoutube,
  FaTiktok,
  FaTwitch,
  FaDiscord,
  FaSpotify,
  FaPinterest,
  FaThreads,
  FaPlaystation,
} from "react-icons/fa6"
import {
  SiCodeforces,
  SiDevpost,
  SiKick,
  SiLeetcode,
  SiSubstack,
  SiLinktree,
  SiOrcid,
  SiPatreon,
  SiBuymeacoffee,
  SiGitlab,
  SiCodeberg,
  SiGithubsponsors,
  SiGooglescholar,
  SiHackerrank,
  SiCodechef,
  SiHackster,
  SiStackoverflow,
  SiDevdotto,
  SiBitbucket,
  SiHashnode,
  SiMedium,
  SiTryhackme,
  SiKaggle,
  SiResearchgate,
  SiWellfound,
} from "react-icons/si"
import { Globe, Mail, ExternalLink, Newspaper } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { profileLinks, type LinkItem } from "@/data/links"
import { cn } from "@/lib/utils"
import ShareButton from "@/components/shared/ShareButton"

const iconMap: Record<string, React.ElementType> = {
  globe: Globe,
  linkedin: FaLinkedin,
  github: FaGithub,
  gitlab: SiGitlab,
  codeberg: SiCodeberg,
  bitbucket: SiBitbucket,
  substack: SiSubstack,
  mail: Mail,
  twitter: FaXTwitter,
  threads: FaThreads,
  instagram: FaInstagram,
  tiktok: FaTiktok,
  pinterest: FaPinterest,
  youtube: FaYoutube,
  twitch: FaTwitch,
  discord: FaDiscord,
  spotify: FaSpotify,
  playstation: FaPlaystation,
  leetcode: SiLeetcode,
  codeforces: SiCodeforces,
  devpost: SiDevpost,
  hackerrank: SiHackerrank,
  codechef: SiCodechef,
  hackster: SiHackster,
  stackoverflow: SiStackoverflow,
  devdotto: SiDevdotto,
  tryhackme: SiTryhackme,
  kaggle: SiKaggle,
  researchgate: SiResearchgate,
  wellfound: SiWellfound,
  hashnode: SiHashnode,
  medium: SiMedium,
  kick: SiKick,
  linktree: SiLinktree,
  orcid: SiOrcid,
  newspaper: Newspaper,
  patreon: SiPatreon,
  buymeacoffee: SiBuymeacoffee,
  githubsponsors: SiGithubsponsors,
  googlescholar: SiGooglescholar,
}

const brandClasses: Record<string, { bg: string; icon: string }> = {
  linkedin: { bg: "bg-[#0A66C2]/10", icon: "text-[#0A66C2]" },
  github: { bg: "bg-gray-800/10", icon: "text-gray-800 dark:text-gray-200" },
  gitlab: { bg: "bg-[#FC6D26]/10", icon: "text-[#FC6D26]" },
  codeberg: { bg: "bg-[#2185D0]/10", icon: "text-[#2185D0]" },
  substack: { bg: "bg-[#FF6719]/10", icon: "text-[#FF6719]" },
  twitter: { bg: "bg-gray-900/10", icon: "text-gray-900 dark:text-gray-100" },
  threads: { bg: "bg-gray-900/10", icon: "text-gray-900 dark:text-gray-100" },
  instagram: { bg: "bg-[#E1306C]/10", icon: "text-[#E1306C]" },
  tiktok: { bg: "bg-gray-900/10", icon: "text-gray-900 dark:text-gray-100" },
  pinterest: { bg: "bg-[#E60023]/10", icon: "text-[#E60023]" },
  youtube: { bg: "bg-[#FF0000]/10", icon: "text-[#FF0000]" },
  twitch: { bg: "bg-[#9146FF]/10", icon: "text-[#9146FF]" },
  discord: { bg: "bg-[#5865F2]/10", icon: "text-[#5865F2]" },
  spotify: { bg: "bg-[#1DB954]/10", icon: "text-[#1DB954]" },
  playstation: { bg: "bg-[#003791]/10", icon: "text-[#003791] dark:text-[#0072CE]" },
  leetcode: { bg: "bg-[#FFA116]/10", icon: "text-[#FFA116]" },
  codeforces: { bg: "bg-[#1F8ACB]/10", icon: "text-[#1F8ACB]" },
  devpost: { bg: "bg-[#003E54]/10", icon: "text-[#003E54] dark:text-[#3ab5e6]" },
  hackerrank: { bg: "bg-[#2EC866]/10", icon: "text-[#2EC866]" },
  codechef: { bg: "bg-[#5B4638]/10", icon: "text-[#5B4638] dark:text-[#C49A6C]" },
  hackster: { bg: "bg-[#2E9FE6]/10", icon: "text-[#2E9FE6]" },
  stackoverflow: { bg: "bg-[#F58025]/10", icon: "text-[#F58025]" },
  devdotto: { bg: "bg-gray-900/10", icon: "text-gray-900 dark:text-gray-100" },
  bitbucket: { bg: "bg-[#0052CC]/10", icon: "text-[#0052CC] dark:text-[#2684FF]" },
  tryhackme: { bg: "bg-[#212C42]/10", icon: "text-[#212C42] dark:text-[#88CC14]" },
  kaggle: { bg: "bg-[#20BEFF]/10", icon: "text-[#20BEFF]" },
  researchgate: { bg: "bg-[#00CCBB]/10", icon: "text-[#00CCBB]" },
  wellfound: { bg: "bg-[#F74B00]/10", icon: "text-[#F74B00]" },
  atcoder: { bg: "bg-gray-100 dark:bg-gray-800", icon: "text-gray-900 dark:text-gray-100" },
  devfolio: { bg: "bg-[#3770FF]/10", icon: "text-[#3770FF]" },
  hashnode: { bg: "bg-[#2962FF]/10", icon: "text-[#2962FF]" },
  medium: { bg: "bg-gray-900/10", icon: "text-gray-900 dark:text-gray-100" },
  kick: { bg: "bg-[#53FC18]/15", icon: "text-[#3AD70A]" },
  linktree: { bg: "bg-[#43E55E]/10", icon: "text-[#43E55E]" },
  orcid: { bg: "bg-[#A6CE39]/10", icon: "text-[#A6CE39]" },
  newspaper: { bg: "bg-primary/10", icon: "text-primary" },
  patreon: { bg: "bg-[#FF424D]/10", icon: "text-[#FF424D]" },
  buymeacoffee: { bg: "bg-[#FFDD00]/15", icon: "text-[#FFDD00]" },
  githubsponsors: { bg: "bg-[#ea4aaa]/10", icon: "text-[#ea4aaa]" },
  googlescholar: { bg: "bg-[#4285F4]/10", icon: "text-[#4285F4]" },
}

const categoryLabel: Record<LinkItem["category"], string> = {
  professional: "Professional",
  writing: "Writing",
  academic: "Academic",
  code: "Code",
  competitive: "Competitive Programming & Challenges",
  hackathons: "Hackathons",
  social: "Social",
  content: "Content",
  support: "Support",
  other: "Other",
}

const categories: LinkItem["category"][] = [
  "professional",
  "writing",
  "academic",
  "code",
  "competitive",
  "hackathons",
  "social",
  "content",
  "support",
  "other",
]

export default function LinksPage() {
  return (
    <div className="min-h-screen flex flex-col items-center px-4 py-16">
      {/* Profile header */}
      <div className="text-center mb-12 space-y-3 animate-fade-up">
        <div className="w-20 h-20 rounded-full border-2 border-primary/30 overflow-hidden mx-auto">
          <Image
            src="/images/avatar.png"
            alt="Isaac Adjei"
            width={80}
            height={80}
            className="object-cover w-full h-full"
          />
        </div>
        <div className="space-y-1">
          <div className="flex items-center justify-center gap-2">
            <h1 className="text-2xl font-bold">Isaac Adjei</h1>
            <ShareButton title="Isaac Adjei - Links" />
          </div>
          <p className="text-sm text-primary font-mono">@zaccess</p>
        </div>
        <p className="text-sm text-muted-foreground max-w-xs mx-auto leading-relaxed">
          Electronic Engineering & Computer Science student at Aston University, building at the
          intersection of hardware and software. Open to internships, placements & professional tech
          roles. Follow, connect, subscribe, like, comment and share on all socials!
        </p>
        <div className="flex items-center justify-center gap-4 pt-1">
          {([
            { Icon: Mail,           href: "mailto:hello@isaacadjei.me" },
            { Icon: FaLinkedin,     href: "https://www.linkedin.com/in/isaacadjei" },
            { Icon: SiOrcid,        href: "https://orcid.org/0009-0001-8298-5098" },
            { Icon: FaGithub,       href: "https://www.github.com/zaccesss" },
            { Icon: SiSubstack,     href: "https://substack.com/@zaccess" },
            { Icon: FaDiscord,      href: "https://discord.com/users/1087417301583790212" },
            { Icon: FaXTwitter,     href: "https://x.com/zaccesss" },
            { Icon: SiBuymeacoffee, href: "https://buymeacoffee.com/zaccesss" },
          ] as const).map(({ Icon, href }) => (
            <Link
              key={href}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground hover:scale-125 active:scale-90 transition-all duration-150"
            >
              <Icon className="h-5 w-5" />
            </Link>
          ))}
        </div>
      </div>

      {/* Links */}
      <div className="w-full max-w-md space-y-8">
        {categories.map((category, catIndex) => {
          const links = profileLinks.filter((l) => l.category === category)
          const label = categoryLabel[category]
          return (
            <div
              key={category}
              className={cn("space-y-3 animate-fade-up", `stagger-${catIndex}`)}
            >
              <div className="flex items-center gap-3 px-1">
                <div className="flex-1 h-px bg-border" />
                <p className="font-mono text-primary tracking-widest whitespace-nowrap">
                  <span className="text-base font-black">{label[0]}</span>
                  <span className="text-sm font-bold">{label.slice(1)}</span>
                </p>
                <div className="flex-1 h-px bg-border" />
              </div>

              {links.map((link) => {
                const Icon = iconMap[link.icon] ?? Globe
                const brand = brandClasses[link.icon]
                const isEmail = link.url.startsWith("mailto")

                return (
                  <Link
                    key={link.title}
                    href={link.url}
                    target={isEmail ? undefined : "_blank"}
                    rel="noopener noreferrer"
                    className={cn(
                      "flex items-center gap-4 w-full rounded-xl border bg-card px-4 py-3.5",
                      "hover:shadow-lg hover:shadow-primary/10 hover:border-primary/30 hover:scale-[1.02] active:scale-[0.98]",
                      "transition-all duration-200 group"
                    )}
                  >
                    <div
                      className={cn(
                        "shrink-0 w-9 h-9 rounded-lg flex items-center justify-center overflow-hidden transition-transform duration-200 group-hover:scale-110",
                        link.iconImage ? "bg-white" : (brand?.bg ?? "bg-primary/10")
                      )}
                    >
                      {link.iconImage ? (
                        <Image
                          src={link.iconImage}
                          alt={link.title}
                          width={36}
                          height={36}
                          className="object-contain w-full h-full"
                        />
                      ) : (
                        <Icon className={cn("h-5 w-5", brand?.icon ?? "text-primary")} />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold leading-none mb-1">{link.title}</p>
                      <p className="text-xs text-muted-foreground truncate">{link.description}</p>
                    </div>
                    <ExternalLink className="h-3.5 w-3.5 text-muted-foreground shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                )
              })}
            </div>
          )
        })}
      </div>

    </div>
  )
}
