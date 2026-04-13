"use client"

import { motion } from "framer-motion"
import { ArrowRight } from "lucide-react"
import Image from "next/image"
import SocialLinks from "@/components/shared/SocialLinks"
import { fadeUp, staggerContainer } from "@/lib/animations"

export default function Hero() {
  return (
    <section className="relative min-h-[calc(100vh-4rem)] flex items-center justify-center px-6 py-24">
      <motion.div
        className="max-w-4xl mx-auto text-center space-y-8"
        variants={staggerContainer}
        initial="visible"
        animate="visible"
      >
        <motion.div variants={fadeUp} className="space-y-4">
          <div className="w-24 h-24 rounded-full border-2 border-primary/30 overflow-hidden mx-auto">
            <Image src="/images/zac_profile.jpg" alt="Isaac Adjei" width={96} height={96} className="object-cover w-full h-full" priority />
          </div>
          <p className="text-sm font-mono text-primary uppercase tracking-widest">
            Electronic Engineering &amp; Computer Science
          </p>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
            Isaac Adjei
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground">
            Building at the intersection of hardware and software.
          </p>
        </motion.div>

        <motion.p
          variants={fadeUp}
          className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed"
        >
          Electronic Engineering &amp; Computer Science student at Aston University.
          Passionate about embedded systems, PCB design, IoT, AI&nbsp;&amp;&nbsp;ML, web development,
          and accessible technology. Open to internships, placements and professional opportunities
          in engineering and tech.
        </motion.p>

        <motion.div variants={fadeUp} className="flex justify-center">
          <SocialLinks iconSize="h-5 w-5" />
        </motion.div>

        <motion.div variants={fadeUp} className="flex justify-center">
          <button
            type="button"
            onClick={() => document.dispatchEvent(new KeyboardEvent("keydown", { key: "i", ctrlKey: true, bubbles: true }))}
            className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-muted/50 px-4 py-1.5 text-xs text-muted-foreground hover:border-primary/50 hover:text-foreground transition-colors cursor-pointer group"
          >
            <span>Quick navigate</span>
            <span className="flex items-center gap-1">
              <kbd className="rounded border border-border bg-background px-1.5 py-0.5 font-mono text-[10px] font-medium shadow-sm">Ctrl</kbd>
              <span>+</span>
              <kbd className="rounded border border-border bg-background px-1.5 py-0.5 font-mono text-[10px] font-medium shadow-sm">I</kbd>
            </span>
            <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
          </button>
        </motion.div>
      </motion.div>
    </section>
  )
}
