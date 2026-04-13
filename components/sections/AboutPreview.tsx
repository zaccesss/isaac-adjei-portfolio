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
              I&apos;m Zac, an Electronic Engineering and Computer Science student at Aston
              University. I care about systems that bridge the gap between the physical world and
              software.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              From building a 4x4x4 LED cube with adaptive brightness control, to standing for
              leadership in my computing society - I look for ways to build and contribute.
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
