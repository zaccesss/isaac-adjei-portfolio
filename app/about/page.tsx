import type { Metadata } from "next"
import { education } from "@/data/education"
import { societies } from "@/data/societies"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { GraduationCap, Users, Heart } from "lucide-react"

export const metadata: Metadata = {
  title: "About",
  description: "Learn more about Isaac Adjei — his story, education, and involvement.",
}

export default function AboutPage() {
  return (
    <div className="container max-w-4xl py-24 space-y-20">
      {/* Intro */}
      <section className="space-y-6">
        <h1 className="text-4xl font-bold tracking-tight">About Me</h1>
        <div className="space-y-4 text-lg text-muted-foreground leading-relaxed">
          <p>
            I&apos;m Isaac Adjei — an Electronic Engineering and Computer Science student at Aston
            University. I go by Zac online.
          </p>
          <p>
            I&apos;m passionate about building things that work at the intersection of hardware and
            software: embedded systems that talk to the physical world, IoT devices that solve real
            problems, and accessible technology that removes barriers rather than creating them.
          </p>
          <p>
            Outside of engineering, I&apos;m actively involved in student societies, hold a Youth
            Secretary role at my church, and am always looking for the next problem worth solving.
          </p>
        </div>
      </section>

      <Separator />

      {/* Education */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <GraduationCap className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold">Education</h2>
        </div>
        <div className="space-y-8">
          {education.map((edu) => (
            <div key={edu.id} className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                <div>
                  <h3 className="text-xl font-semibold">{edu.institution}</h3>
                  <p className="text-muted-foreground">
                    {edu.degree} {edu.field}
                  </p>
                </div>
                <span className="text-sm text-muted-foreground whitespace-nowrap">
                  {edu.startDate} – {edu.endDate}
                </span>
              </div>
              {edu.description && (
                <p className="text-muted-foreground">{edu.description}</p>
              )}
              {edu.modules && edu.modules.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {edu.modules.map((mod) => (
                    <Badge key={mod} variant="secondary">
                      {mod}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      <Separator />

      {/* Societies */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <Users className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold">Societies & Memberships</h2>
        </div>
        <div className="space-y-6">
          {societies.map((soc) => (
            <div key={soc.name} className="space-y-1">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                <div>
                  <h3 className="font-semibold">{soc.name}</h3>
                  <p className="text-sm text-primary font-medium">{soc.role}</p>
                </div>
                <span className="text-sm text-muted-foreground whitespace-nowrap">
                  {soc.period}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">{soc.description}</p>
            </div>
          ))}
        </div>
      </section>

      <Separator />

      {/* Interests */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <Heart className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold">Interests</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          {[
            "Embedded Systems",
            "IoT",
            "Cloud Computing",
            "Artificial Intelligence",
            "Cybersecurity",
            "Accessible Technology",
            "Circuit Design",
            "Open Source",
          ].map((interest) => (
            <Badge key={interest} variant="outline" className="text-sm">
              {interest}
            </Badge>
          ))}
        </div>
      </section>
    </div>
  )
}
