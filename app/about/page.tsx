// Full About page - covers my background, education, societies, interests, hobbies and languages.
// The interests, hobbies and languages are defined inline here because they're only used on this page.

import type { Metadata } from "next"
import { education } from "@/data/education"
import { societies } from "@/data/societies"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import ApproachAnimation from "@/components/shared/ApproachAnimation"
import {
  GraduationCap,
  Users,
  Heart,
  Sparkles,
  Languages,
  HandHeart,
  Trophy,
  Quote,
  HeartHandshake,
} from "lucide-react"

export const metadata: Metadata = {
  title: "About",
  description: "Learn more about Isaac Adjei - his story, education and involvement.",
  alternates: {
    canonical: "https://www.isaacadjei.me/about",
  },
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
  { name: "Twi & Ga", level: "Native proficiency" },
  { name: "French & Spanish", level: "Elementary proficiency" },
]

export default function AboutPage() {
  return (
    <div className="container max-w-4xl py-24 space-y-12">
      {/* Intro */}
      <section className="space-y-6">
        <h1 className="text-4xl font-bold tracking-tight">About Me</h1>
        <div className="space-y-4 text-lg text-muted-foreground leading-relaxed">
          <p>
            I am Isaac Adjei. Most people know me as Zac. I am an Electronic Engineering and
            Computer Science student at Aston University, Birmingham, working towards a First Class
            BEng. My goal is to build at the intersection of intelligent software and efficient
            hardware, creating systems that solve real problems for real people.
          </p>
          <p>
            I grew up in Ghana, attending Adisadel College in Cape Coast, a school guided by the
            motto &ldquo;Vel Primus, Vel Cum Primis&rdquo; (Either the first, or with the first).
            It instilled in me resilience, discipline and a standard of excellence that still shape
            everything I do. I was an active member of the Robotics Club, Scripture Union, PENSA
            and the Debate Society. I lost sight in my right eye at age two due to retinoblastoma
            and have lived with monocular vision my entire life. Rather than limiting me, it
            sharpened my focus and shaped a deep commitment to accessible technology, building
            systems that genuinely serve all users.
          </p>
          <p>
            My late father was a mechanical and refrigeration engineer. During school vacations I
            accompanied him on site and watched engineering come to life in his hands. He always
            said: &ldquo;Always strive to make things better.&rdquo; Between 2019 and 2021 I
            worked as a Junior Apprentice HVAC Technician in Accra, servicing and installing over
            50 air conditioning units in the field. In 2022 I relocated to the UK, and after two
            months on a business course at Stanmore College I knew engineering was where I belonged.
            I approached the college, sat the necessary entry exams and transferred onto the
            engineering programme, graduating with D*DD in the Pearson BTEC Level 3 National
            Extended Diploma in Engineering and being recognised as Best and Most Hardworking
            Student in my cohort.
          </p>
          <p>
            At Aston I serve as Student Representative at the Students&apos; Union and am a
            Student Member of the IET and a member of ESOC and the Aston African-Caribbean
            Society. In 2026 I was shortlisted as a Top 40 Finalist for the Black
            Heritage Undergraduate of the Year Award, run by TargetJobs and Sky to recognise
            high-achieving undergraduates across the UK. Beyond university I have gained experience
            in different sectors: internships at the Ghana High Commission London as a Consular
            Intern and an Admin and Estates Intern, virtual engineering programmes with British
            Airways and Yunex Traffic, and between 2022 and 2025, while studying full-time, working
            as a Waiter and Food Runner at Casa do Frango Piccadilly.
          </p>
          <p>
            Technically I work across the full stack: bare-metal C and C++ on microcontrollers, PCB
            design in KiCad and Proteus, full-stack web with Next.js and TypeScript, and
            Python-based machine learning with TensorFlow and PyTorch. I am also expanding into
            Java, cloud computing, cyber security and game development. My projects include a
            two-stage audio amplifier PCB built from scratch, a 4x4x4 NeoPixel LED Cube with four
            animation modes, Phaemos (a predictive maintenance platform with a FastAPI backend and
            Isolation Forest anomaly detection), an open-source Git course with over 200 structured
            topic files and Zaccess, an accessibility tool that converts lecture slides and textbook
            pages into high-contrast readable notes using OCR and text-to-speech.
          </p>
        </div>
        <ApproachAnimation />
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
                    {edu.degree}
                    {edu.field ? `, ${edu.field}` : ""}
                  </p>
                  {edu.grade && <p className="text-sm text-primary font-medium">{edu.grade}</p>}
                </div>
                <span className="text-sm text-muted-foreground whitespace-nowrap">
                  {edu.startDate} - {edu.endDate}
                </span>
              </div>
              {edu.description && <p className="text-muted-foreground">{edu.description}</p>}
              {edu.id === "aston" && (
                <p className="text-sm text-muted-foreground">
                  Highlights include Internet Applications and Databases, Foundations of AI and Data
                  Science, Python Programming, Electronics 1 and 2, Engineering Mathematics and
                  Professional Skills.
                </p>
              )}
              {edu.id === "stanmore" && (
                <p className="text-sm text-muted-foreground">
                  Key modules included Engineering Product Design and Manufacture, Microcontroller
                  Systems, CAD, Electronic Devices and Circuits and Electronic Measurement and
                  Testing.
                </p>
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
                <p className="text-sm text-primary font-medium">
                  targetjobs UK - National Emerging Talent Awards 2026
                </p>
              </div>
              <span className="text-sm text-muted-foreground whitespace-nowrap">Feb 2026</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Selected to evaluate employer submissions for the Best Placement or Internship
              Programme category. Assessed programme design, recruitment strategy, inclusivity and
              student experience, providing detailed qualitative feedback and numerical scoring.
              Commended for a timely, thorough and high-quality approach.
            </p>
          </div>
          <div className="space-y-1">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
              <div>
                <h3 className="font-semibold">Fundraising Volunteer</h3>
                <p className="text-sm text-primary font-medium">
                  Cancer Research UK - 10 Days of 5K Challenge
                </p>
              </div>
              <span className="text-sm text-muted-foreground whitespace-nowrap">
                Feb 2026 - Mar 2026
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              Participated in the Cancer Research UK 10 Days of 5K Challenge to support life-saving
              cancer research. Completed 10 x 5 km runs (more than 50 km total) across March,
              demonstrating consistency and discipline. Set up and managed an online fundraising
              page, contributing to a wider campaign that raised over £797,424.64, with an
              additional £159,224.14 through Gift Aid. Raised funds through outreach and personal
              network engagement while promoting awareness of cancer research initiatives.
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
                <h3 className="font-semibold">
                  Top 40 Finalist - Black Heritage Undergraduate of the Year Award 2026
                </h3>
                <p className="text-sm text-primary font-medium">TargetJobs &amp; Sky · Mar 2026</p>
              </div>
              <span className="text-sm text-muted-foreground whitespace-nowrap">Mar 2026</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Selected as one of the Top 40 finalists nationwide for the Black Heritage Undergraduate
              of the Year Award 2026, a programme run by TargetJobs and Sky recognising
              high-achieving students across the UK for leadership, impact and potential. Progressed
              through the application and video interview stages and was invited to attend the
              finalist Celebration Day at Sky&apos;s Osterley campus.
            </p>
          </div>
          <div className="space-y-1">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
              <div>
                <h3 className="font-semibold">Best and Most Hardworking Student</h3>
                <p className="text-sm text-primary font-medium">Stanmore College, London</p>
              </div>
              <span className="text-sm text-muted-foreground whitespace-nowrap">Jun 2024</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Recognised as the best and most hardworking student at Stanmore College during the
              Pearson BTEC Level 3 National Extended Diploma in Engineering, graduating with D*DD
              (Distinction*, Distinction, Distinction).
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
          Outside engineering I play piano, stay active at the gym, cycle, cook, journal and travel
          whenever I get the chance. I am a big believer in continuous learning - I regularly work
          through online courses on platforms like Coursera, build personal projects and read widely
          across tech, business and history. For me, growth is not occasional - it&apos;s an active
          lifestyle.
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
            manner and to a high quality, and we are very thankful that Isaac volunteered his time.
            Isaac proved to be efficient and self-motivated, with a thorough approach to the
            assigned work. I would highly recommend Isaac for any future roles and
            opportunities.&rdquo;
          </p>
          <div>
            <p className="font-semibold text-sm">Imogen Carter</p>
            <p className="text-xs text-muted-foreground">
              Events and Marketing Administrator, Group GTI · March 2026
            </p>
            <a
              href="https://www.linkedin.com/in/isaacadjei"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-primary underline underline-offset-4 hover:text-primary/80 transition-colors"
            >
              View on LinkedIn
            </a>
          </div>
        </div>
      </section>

      <Separator />

      {/* Languages */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <Languages className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold">
            Languages{" "}
            <span className="text-base font-normal text-muted-foreground">(spoken & written)</span>
          </h2>
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

      <Separator />

      {/* Causes */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <HeartHandshake className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold">Causes</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          {[
            "Education",
            "Health",
            "Science and Technology",
            "Accessible Technology",
            "Environment",
            "Diversity and Inclusion",
            "Economic Empowerment",
            "Open Source",
            "Faith",
          ].map((cause) => (
            <Badge key={cause} variant="outline" className="text-sm">
              {cause}
            </Badge>
          ))}
        </div>
      </section>
    </div>
  )
}
