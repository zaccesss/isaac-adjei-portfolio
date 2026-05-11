"use client"

// Links page - a Linktree-style list of all my profiles grouped by category.
// iconMap maps the icon string from data/links.ts to a React Icons or Lucide component.
// brandClasses applies platform-specific background and icon colours so each link
// looks visually distinct.

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
import { SiCodeforces, SiKick, SiLeetcode, SiSubstack, SiLinktree, SiOrcid } from "react-icons/si"
import { Globe, Mail, ExternalLink } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { profileLinks, type LinkItem } from "@/data/links"
import { cn } from "@/lib/utils"

const iconMap: Record<string, React.ElementType> = {
  globe: Globe,
  linkedin: FaLinkedin,
  github: FaGithub,
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
  kick: SiKick,
  linktree: SiLinktree,
  orcid: SiOrcid,
}

const brandClasses: Record<string, { bg: string; icon: string }> = {
  linkedin: { bg: "bg-[#0A66C2]/10", icon: "text-[#0A66C2]" },
  github: { bg: "bg-gray-800/10", icon: "text-gray-800 dark:text-gray-200" },
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
  kick: { bg: "bg-[#53FC18]/15", icon: "text-[#3AD70A]" },
  linktree: { bg: "bg-[#43E55E]/10", icon: "text-[#43E55E]" },
  orcid: { bg: "bg-[#A6CE39]/10", icon: "text-[#A6CE39]" },
}

const categoryLabel: Record<LinkItem["category"], string> = {
  professional: "Professional",
  social: "Social",
  content: "Content",
}

const categories: LinkItem["category"][] = ["professional", "social", "content"]

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
          <h1 className="text-2xl font-bold">Isaac Adjei</h1>
          <p className="text-sm text-primary font-mono">@zaccess</p>
        </div>
        <p className="text-sm text-muted-foreground max-w-xs mx-auto leading-relaxed">
          Electronic Engineering & Computer Science student at Aston University, building at the
          intersection of hardware and software. Open to internships, placements & professional tech
          roles. Follow, connect, subscribe, like, comment and share on all socials!
        </p>
      </div>

      {/* Links */}
      <div className="w-full max-w-md space-y-8 animate-fade-up">
        {categories.map((category) => {
          const links = profileLinks.filter((l) => l.category === category)
          return (
            <div key={category} className="space-y-3">
              <p className="text-xs font-mono text-muted-foreground uppercase tracking-widest px-1">
                {categoryLabel[category]}
              </p>

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
                      "hover:shadow-md hover:scale-[1.02] active:scale-[0.98]",
                      "transition-all duration-200 group"
                    )}
                  >
                    <div
                      className={cn(
                        "shrink-0 w-9 h-9 rounded-lg flex items-center justify-center overflow-hidden",
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

      <div className="mt-16">
        <Link
          href="/"
          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          isaacadjei.me
        </Link>
      </div>
    </div>
  )
}
