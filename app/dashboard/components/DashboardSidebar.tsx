"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut } from "next-auth/react"
import { Target, BookOpen, Briefcase, GraduationCap, Dumbbell, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import Image from "next/image"

const nav = [
  { href: "/dashboard/goals", label: "Goals", icon: Target },
  { href: "/dashboard/modules", label: "Modules", icon: BookOpen },
  { href: "/dashboard/internships", label: "Internships", icon: Briefcase },
  { href: "/dashboard/course", label: "Course", icon: GraduationCap },
  { href: "/dashboard/gym", label: "Gym", icon: Dumbbell },
]

export default function DashboardSidebar({
  user,
}: {
  user: { name?: string | null; image?: string | null }
}) {
  const pathname = usePathname()

  return (
    <>
      {/* desktop sidebar */}
      <aside className="hidden md:flex flex-col w-56 border-r border-border bg-muted/30 p-4 gap-6 min-h-screen sticky top-0 h-screen">
        <div className="flex items-center gap-3 pt-2">
          {user.image && (
            <Image
              src={user.image}
              alt={user.name ?? "avatar"}
              width={32}
              height={32}
              className="rounded-full"
            />
          )}
          <span className="text-sm font-medium truncate">{user.name}</span>
        </div>

        <nav className="flex flex-col gap-1 flex-1">
          {nav.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${
                pathname.startsWith(href)
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}
        </nav>

        <Button
          variant="ghost"
          size="sm"
          className="justify-start gap-2 text-muted-foreground"
          onClick={() => signOut({ callbackUrl: "/dashboard/login" })}
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </Button>
      </aside>

      {/* mobile bottom tab bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 border-t border-border bg-background/95 backdrop-blur flex z-50">
        {nav.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={`flex-1 flex flex-col items-center gap-1 py-3 text-xs transition-colors ${
              pathname.startsWith(href)
                ? "text-primary"
                : "text-muted-foreground"
            }`}
          >
            <Icon className="h-5 w-5" />
            {label}
          </Link>
        ))}
      </nav>
    </>
  )
}
