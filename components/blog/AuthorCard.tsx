// I show this card at the bottom of every published blog post so readers know who wrote it and can follow up.
import Image from "next/image"
import { Mail } from "lucide-react"
import { FaGithub, FaLinkedin } from "react-icons/fa6"
import { SiOrcid, SiBuymeacoffee, SiGooglescholar } from "react-icons/si"

const LINKS = [
  {
    href: "mailto:contact@isaacadjei.me",
    label: "Email",
    icon: Mail,
    color: "hover:text-primary",
  },
  {
    href: "https://www.linkedin.com/in/isaacadjei",
    label: "LinkedIn",
    icon: FaLinkedin,
    color: "hover:text-[#0A66C2]",
  },
  {
    href: "https://github.com/zaccesss",
    label: "GitHub",
    icon: FaGithub,
    color: "hover:text-foreground",
  },
  {
    href: "https://orcid.org/0009-0001-8298-5098",
    label: "ORCID",
    icon: SiOrcid,
    color: "hover:text-[#A6CE39]",
  },
  {
    href: "https://scholar.google.com/citations?user=YZq0XuMAAAAJ",
    label: "Google Scholar",
    icon: SiGooglescholar,
    color: "hover:text-[#4285F4]",
  },
  {
    href: "https://buymeacoffee.com/zaccesss",
    label: "Buy me a coffee",
    icon: SiBuymeacoffee,
    color: "hover:text-[#FFDD00]",
  },
]

export default function AuthorCard() {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-border bg-muted/20 px-5 py-4">
      <div className="shrink-0 w-12 h-12 rounded-full overflow-hidden border border-border">
        <Image
          src="/images/avatar.png"
          alt="Isaac Adjei"
          width={48}
          height={48}
          className="object-cover w-full h-full"
        />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm leading-snug">Isaac Adjei</p>
        <p className="text-xs text-muted-foreground mt-0.5 leading-snug">
          BEng Electronic Engineering &amp; Computer Science at Aston University · embedded systems, full-stack software and open source
        </p>
        <div className="flex items-center gap-3 mt-2">
          {LINKS.map(({ href, label, icon: Icon, color }) => (
            <a
              key={href}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={label}
              className={`text-muted-foreground transition-colors ${color}`}
            >
              <Icon className="h-4 w-4" />
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}
