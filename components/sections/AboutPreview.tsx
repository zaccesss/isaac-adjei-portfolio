"use client"

// A short teaser section shown on the homepage that introduces who I am
// and links through to the full About page.

import { motion } from "framer-motion"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { fadeUp, staggerContainer } from "@/lib/animations"

export default function AboutPreview() {
  return (
    <section className="py-24 border-t">
      <div className="container max-w-4xl">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid md:grid-cols-2 gap-12 items-center"
        >
          <motion.div variants={fadeUp} className="space-y-4">
            <p className="text-sm font-mono text-primary uppercase tracking-widest">About</p>
            <h2 className="text-3xl font-bold tracking-tight">
              Engineering problems worth solving
            </h2>
          </motion.div>

          <motion.div variants={fadeUp} className="space-y-4">
            <p className="text-muted-foreground leading-relaxed">
              I am Zac, an Electronic Engineering and Computer Science student at Aston University.
              I grew up in Ghana, relocated to the UK in 2022 and earned a triple Distinction in
              engineering, being recognised as Best and Most Hardworking Student at Stanmore College,
              before beginning my BEng at Aston. I work at the intersection of hardware and software,
              spanning embedded systems, machine learning and production web development.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              My late father was a mechanical engineer. His words, &ldquo;Always strive to make
              things better&rdquo;, still guide everything I build. I focus on accessible technology
              and systems that serve real users, the kind of engineering that matters beyond the
              screen.
            </p>
            <Button asChild variant="ghost" className="pl-0">
              <Link href="/about">
                Read more
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
