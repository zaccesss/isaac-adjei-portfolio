// I render a row of social media icon links.
// I translate the platform string from data/social.ts to a React component and fall back to Link2 for unknown platforms.
// showLabel is optional - when true the platform name appears next to the icon.

import Link from "next/link"
import { Link2, Mail, Newspaper } from "lucide-react"
import { FaGithub, FaLinkedin } from "react-icons/fa6"
import { SiOrcid, SiBuymeacoffee } from "react-icons/si"
import { socialLinks } from "@/data/social"
import { cn } from "@/lib/utils"

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  github: FaGithub,
  linkedin: FaLinkedin,
  link: Link2,
  mail: Mail,
  orcid: SiOrcid,
  newsletter: Newspaper,
  buymeacoffee: SiBuymeacoffee,
}

interface SocialLinksProps {
  className?: string
  iconSize?: string
  showLabel?: boolean
  footerOnly?: boolean
}

export default function SocialLinks({
  className,
  iconSize = "h-4 w-4",
  showLabel = false,
  footerOnly = false,
}: SocialLinksProps) {
  const links = footerOnly ? socialLinks.filter((s) => s.footer !== false) : socialLinks
  return (
    <div className={cn("flex items-center gap-4 flex-wrap", className)}>
      {links.map((social) => {
        const Icon = iconMap[social.icon] ?? Link2
        return (
          <Link
            key={social.name}
            href={social.url}
            target={social.url.startsWith("http") ? "_blank" : undefined}
            rel={social.url.startsWith("http") ? "noopener noreferrer" : undefined}
            className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors"
            aria-label={social.name}
          >
            <Icon className={iconSize} />
            {showLabel && <span className="text-sm">{social.name}</span>}
          </Link>
        )
      })}
    </div>
  )
}
