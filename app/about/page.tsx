import type { Metadata } from "next"
import { education } from "@/data/education"
import { societies } from "@/data/societies"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { GraduationCap, Users, Heart, Sparkles, Languages } from "lucide-react"

export const metadata: Metadata = {
  title: "About",
  description: "Learn more about Isaac Adjei — his story, education, and involvement.",
}

const interests = [
  "Embedded Systems",
  "IoT",
  "Hardware-Software Integration",
  "Cloud Computing",
  "Artificial Intelligence & ML",
  "Cyber Security",
  "Robotics & Automation",
  "Circuit Design & PCB",
  "Open Source",
  "Accessible Technology",
  "Computer Systems",
  "Game Development",
]

const hobbies = [
  "Piano",
  "Music",
  "Gym & Fitness",
  "Cycling",
  "Cooking",
  "Reading",
  "Journaling",
  "Online Courses",
  "Personal Projects",
]

const languages = [
  { name: "English", level: "Full professional proficiency" },
  { name: "Twi & Ga", level: "Full professional proficiency" },
  { name: "French", level: "Elementary proficiency" },
  { name: "Spanish", level: "Elementary proficiency" },
]

export default function AboutPage() {
  return (
    <div className="container max-w-4xl py-24 space-y-20">
      {/* Intro */}
      <section className="space-y-6">
        <h1 className="text-4xl font-bold tracking-tight">About Me</h1>
        <div className="space-y-4 text-lg text-muted-foreground leading-relaxed">
          <p>
            I&apos;m Isaac Adjei — an Electronic Engineering and Computer Science student at Aston
            University. I go by Zac online. My journey began in Ghana where curiosity and
            problem-solving shaped me early. In 2022 I moved to the UK during my final year at
            Adisadel College, an experience that strengthened my resilience, adaptability and
            sense of responsibility.
          </p>
          <p>
            I&apos;m passionate about building at the intersection of hardware and software —
            embedded systems that interact with the physical world, intelligent software that
            solves real problems, and technology that is accessible to everyone. My interests span
            electronics, software development, cyber security, cloud computing, AI/ML and
            hardware-software integration.
          </p>
          <p>
            I am sight-impaired due to retinoblastoma in childhood, which resulted in blindness in
            my right eye. Rather than a limitation, it sharpened my discipline, consistency and
            determination to succeed. I am actively involved in student societies, serve as Youth
            Secretary at my church, and am always looking for the next problem worth solving.
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
                    {edu.degree}{edu.field ? ` — ${edu.field}` : ""}
                  </p>
                  {edu.grade && (
                    <p className="text-sm text-primary font-medium">{edu.grade}</p>
                  )}
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
          {interests.map((interest) => (
            <Badge key={interest} variant="outline" className="text-sm">
              {interest}
            </Badge>
          ))}
        </div>
      </section>

      <Separator />

      {/* Hobbies */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <Sparkles className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold">Outside Engineering</h2>
        </div>
        <p className="text-muted-foreground">
          Outside academics I learn through online courses, personal projects and self-development.
          For me, growth is not occasional — it&apos;s an active lifestyle.
        </p>
        <div className="flex flex-wrap gap-2">
          {hobbies.map((hobby) => (
            <Badge key={hobby} variant="outline" className="text-sm">
              {hobby}
            </Badge>
          ))}
        </div>
      </section>

      <Separator />

      {/* Languages */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <Languages className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold">Languages <span className="text-base font-normal text-muted-foreground">(spoken & written)</span></h2>
        </div>
        <div className="space-y-3">
          {languages.map((lang) => (
            <div key={lang.name} className="flex items-center justify-between max-w-sm">
              <span className="font-medium">{lang.name}</span>
              <span className="text-sm text-muted-foreground">{lang.level}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
