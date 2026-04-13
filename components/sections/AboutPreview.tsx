"use client"

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
              I&apos;m Zac - a Top 40 Finalist for Black Heritage Undergraduate of the Year 2026
              and Best and Most Hardworking Student at Stanmore College. I relocated from Ghana to
              the UK in 2022, earned a triple Distinction in engineering and now study Electronic
              Engineering and Computer Science at Aston University.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              My late father was a mechanical engineer. His words - &ldquo;Always strive to make
              things better&rdquo; - still drive everything I build. I work across the full stack:
              from bare-metal firmware and PCB design to AI/ML and full-stack web, with a particular
              focus on accessible technology and systems that matter in the real world.
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
