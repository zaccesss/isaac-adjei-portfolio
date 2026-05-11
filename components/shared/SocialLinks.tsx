// Renders a row of social media icon links.
// The iconMap translates the string stored in data/social.ts to a React component.
// Falls back to the generic Link2 icon for any platform not in the map.
// showLabel is optional - if true, the platform name appears next to the icon.

import Link from "next/link"
import { Github, Linkedin, Link2, Mail, Globe } from "lucide-react"
import { SiOrcid } from "react-icons/si"
import { socialLinks } from "@/data/social"
import { cn } from "@/lib/utils"

const iconMap: Record<string, React.ElementType> = {
  github: Github,
  linkedin: Linkedin,
  link: Link2,
  mail: Mail,
  globe: Globe,
  orcid: SiOrcid,
}

interface SocialLinksProps {
  className?: string
  iconSize?: string
  showLabel?: boolean
}

export default function SocialLinks({
  className,
  iconSize = "h-4 w-4",
  showLabel = false,
}: SocialLinksProps) {
  return (
    <div className={cn("flex items-center gap-4 flex-wrap", className)}>
      {socialLinks.map((social) => {
        const Icon = iconMap[social.icon] ?? Link2
        return (
          <Link
            key={social.name}
            href={social.url}
            target={social.url.startsWith("mailto") ? undefined : "_blank"}
            rel="noopener noreferrer"
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
