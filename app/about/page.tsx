import type { Metadata } from "next"
import { education } from "@/data/education"
import { societies } from "@/data/societies"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { GraduationCap, Users, Heart, Sparkles, Languages, HandHeart, Trophy, Quote } from "lucide-react"

export const metadata: Metadata = {
  title: "About",
  description: "Learn more about Isaac Adjei - his story, education and involvement.",
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
  "Travel",
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
            I&apos;m Isaac Adjei - most people know me as Zac. I&apos;m an Electronic Engineering
            and Computer Science student at Aston University, Birmingham, working towards a First
            Class degree. I am an aspiring engineer and technologist with interests spanning
            electronics, embedded systems, software development, cyber security, cloud computing,
            AI/ML and hardware-software integration. My goal is to build a career where intelligent
            software and efficient hardware come together to solve real problems.
          </p>
          <p>
            My journey began in Ghana where curiosity and hands-on problem-solving shaped me from
            an early age. I spent most of my senior high school years at Adisadel College in Cape
            Coast - one of the most prestigious boys&apos; schools in Ghana, guided by the motto
            &ldquo;Vel Primus, Vel Cum Primis&rdquo; (Either the first or with the first). I lived
            in Thomas Jonah House and was active in Robotics, Scripture Union, PENSA, Debate
            Society and Sports &amp; Athletics. I served as APOSA Secretary (Apostolic Students
            &amp; Associates) and was an aspiring Dispensary Prefect. Adisadel instilled in me
            resilience, discipline and values that continue to guide everything I do.
          </p>
          <p>
            In April 2022 I relocated to the UK during my final year. I initially enrolled in a
            business course at Stanmore College in London, but after two months I knew engineering
            was where I belonged. I approached the college, took the necessary exams to demonstrate
            my commitment and aptitude, and was transferred onto the engineering programme. I went
            on to achieve a D*DD (Distinction*, Distinction, Distinction) in the Pearson BTEC
            Level 3 National Extended Diploma in Engineering. That decision - to take a risk, back
            myself and change course - shaped how I approach challenges to this day.
          </p>
          <p>
            My engineering journey had roots even earlier. Between 2019 and 2021 I worked as a
            Junior Apprentice HVAC Technician in Accra, Ghana, servicing and installing over 50
            air conditioning units, using diagnostic tools and learning the discipline of real
            on-site technical work. That hands-on foundation, combined with the legacy of my late
            father who was a mechanical engineer, drives my determination every day. He used to
            say &ldquo;Always strive to make things better&rdquo; and during school vacations I
            would accompany him to work and watch engineering come to life. His passion, his
            knowledge and the impact of his work are a constant source of motivation.
          </p>
          <p>
            I have been partially sighted since the age of two due to suspected retinoblastoma,
            which resulted in blindness in my right eye. This also meant I missed approximately
            five years of early education. Rather than letting either be a limitation, they
            sharpened my focus, consistency and determination to succeed. Overcoming those early
            challenges only deepened my commitment to accessible technology - building things that
            genuinely work for everyone. I am a Student Representative at Aston Students&apos;
            Union and a Student Member of the IET.
          </p>
          <p>
            Technically I work across the full stack: bare-metal C and C++ on microcontrollers,
            PCB design in KiCad, full-stack web applications with Next.js, PHP 8.2 and MySQL,
            and AI/ML pipelines with Python, TensorFlow and PyTorch. I am also expanding into
            cloud computing, cyber security and game development. My projects include a 4x4x4
            NeoPixel LED Cube with adaptive brightness, remote control and dynamic animations,
            an open-source Git course with 100+ structured files and a full-stack CV database
            with 11 production security measures deployed live at Aston University. I enjoy
            understanding how systems work internally and building things that move from concept
            to code to real output.
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
                    {edu.degree}{edu.field ? `, ${edu.field}` : ""}
                  </p>
                  {edu.grade && (
                    <p className="text-sm text-primary font-medium">{edu.grade}</p>
                  )}
                </div>
                <span className="text-sm text-muted-foreground whitespace-nowrap">
                  {edu.startDate} - {edu.endDate}
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

      {/* Volunteering */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <HandHeart className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold">Volunteering</h2>
        </div>
        <div className="space-y-6">
          <div className="space-y-1">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
              <div>
                <h3 className="font-semibold">Student Judge</h3>
                <p className="text-sm text-primary font-medium">targetjobs UK - National Emerging Talent Awards 2026</p>
              </div>
              <span className="text-sm text-muted-foreground whitespace-nowrap">Feb 2026</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Selected to evaluate employer submissions for the Best Placement or Internship
              Programme category. Assessed programme design, recruitment strategy, inclusivity
              and student experience, providing detailed qualitative feedback and numerical
              scoring. Commended for a timely, thorough and high-quality approach.
            </p>
          </div>
          <div className="space-y-1">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
              <div>
                <h3 className="font-semibold">Fundraising Volunteer</h3>
                <p className="text-sm text-primary font-medium">Cancer Research UK - 10 Days of 5K Challenge</p>
              </div>
              <span className="text-sm text-muted-foreground whitespace-nowrap">Feb 2026 - Mar 2026</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Completed 10 x 5km runs (50km+ total) to support life-saving cancer research.
              Managed a personal fundraising page contributing to a wider campaign that raised
              over £797,424. Strengthened accountability, resilience and goal-setting through
              consistent daily commitment.
            </p>
          </div>
        </div>
      </section>

      <Separator />

      {/* Awards & Honours */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <Trophy className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold">Awards & Honours</h2>
        </div>
        <div className="space-y-6">
          <div className="space-y-1">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
              <div>
                <h3 className="font-semibold">Top 40 Finalist - Black Heritage Undergraduate of the Year Award 2026</h3>
                <p className="text-sm text-primary font-medium">TargetJobs &amp; Sky · Mar 2026</p>
              </div>
              <span className="text-sm text-muted-foreground whitespace-nowrap">Mar 2026</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Selected as one of the Top 40 finalists nationwide for the Black Heritage
              Undergraduate of the Year Award 2026 - a programme recognising high-achieving
              students across the UK for leadership, impact and potential. Completed the
              application and video interview process with Sky and TargetJobs and was invited to
              attend the finalist Celebration Day at Sky&apos;s flagship Osterley campus.
              Associated with Aston University.
            </p>
          </div>
          <div className="space-y-1">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
              <div>
                <h3 className="font-semibold">Best and Most Hardworking Student</h3>
                <p className="text-sm text-primary font-medium">Stanmore College, London</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Recognised as the best and most hardworking student at Stanmore College during
              the Pearson BTEC Level 3 National Extended Diploma in Engineering, graduating
              with D*DD (Distinction*, Distinction, Distinction).
            </p>
          </div>
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
          Outside engineering I play piano, stay active at the gym, cycle, cook, journal and
          travel whenever I get the chance. I completed the Cancer Research UK 10 Days of 5K
          Challenge, running over 50km in March 2026. I am a big believer in continuous learning
          - I regularly work through online courses on platforms like Coursera, build personal
          projects and read widely across tech, business and history. For me, growth is not
          occasional - it&apos;s an active lifestyle.
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

      {/* Recommendations */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <Quote className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold">Recommendations</h2>
        </div>
        <div className="rounded-lg border border-border/60 bg-muted/30 px-6 py-5 space-y-3">
          <p className="text-muted-foreground leading-relaxed italic">
            &ldquo;Isaac recently completed a set of student judging for us at targetjobs for the
            prestigious National Graduate Recruitment Awards. He completed this task in a timely
            manner and to a high quality, and we are very thankful that Isaac volunteered his
            time. Isaac proved to be efficient and self-motivated, with a thorough approach to the
            assigned work. I would highly recommend Isaac for any future roles and
            opportunities.&rdquo;
          </p>
          <div>
            <p className="font-semibold text-sm">Imogen Carter</p>
            <p className="text-xs text-muted-foreground">Events and Marketing Administrator, Group GTI · March 2026</p>
          </div>
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
