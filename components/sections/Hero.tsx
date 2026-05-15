"use client"

// The main hero section at the top of the homepage.
// The 'Quick navigate' button dispatches a synthetic keyboard event to trigger
// the CommandMenu without having to duplicate the shortcut logic here.

import { motion } from "framer-motion"
import { ArrowRight } from "lucide-react"
import Image from "next/image"
import SocialLinks from "@/components/shared/SocialLinks"
import { fadeUp, staggerContainer } from "@/lib/animations"
import { useModKey } from "@/hooks/useModKey"

export default function Hero() {
  const { modLabel } = useModKey()

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
            <Image
              src="/images/zac_profile.jpg"
              alt="Isaac Adjei"
              width={96}
              height={96}
              className="object-cover w-full h-full"
              priority
            />
          </div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight">Isaac Adjei</h1>
          <p className="text-sm font-mono text-primary uppercase tracking-widest">
            Electronic Engineering &amp; Computer Science
          </p>
          <p className="text-xl md:text-2xl text-muted-foreground">
            Building at the intersection of hardware and software.
          </p>
        </motion.div>

        <motion.div
          variants={fadeUp}
          className="max-w-2xl mx-auto space-y-4"
        >
          <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
            EE &amp; CS student at Aston University, Birmingham, building across the full stack of
            engineering and technology. Open to internships, placements and professional
            opportunities.
          </p>
          <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
            Not sure where to start?{" "}
            <a href="/projects" className="text-primary underline underline-offset-4 decoration-primary/50 hover:decoration-primary transition-colors">Projects</a>
            {" "}for the work,{" "}
            <a href="/about" className="text-primary underline underline-offset-4 decoration-primary/50 hover:decoration-primary transition-colors">About</a>
            {" "}for the full story, or the{" "}
            <a href="/lab" className="text-primary underline underline-offset-4 decoration-primary/50 hover:decoration-primary transition-colors">Lab terminal</a>
            {" "}if you want to explore on your own terms, or just scroll for more.
          </p>
          <div className="w-24 h-px bg-border mx-auto" />
        </motion.div>

        <motion.div variants={fadeUp} className="flex justify-center">
          <SocialLinks iconSize="h-5 w-5" />
        </motion.div>

        <motion.div variants={fadeUp} className="flex justify-center">
          <button
            type="button"
            onClick={() =>
              document.dispatchEvent(
                new KeyboardEvent("keydown", { key: "i", ctrlKey: true, bubbles: true })
              )
            }
            className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-muted/50 px-4 py-1.5 text-xs text-muted-foreground hover:border-primary/50 hover:text-foreground transition-colors cursor-pointer group"
          >
            <span>Quick navigate</span>
            <span className="flex items-center gap-1">
              <kbd className="rounded border border-border bg-background px-1.5 py-0.5 font-mono text-[10px] font-medium shadow-sm">
                {modLabel}
              </kbd>
              <span>+</span>
              <kbd className="rounded border border-border bg-background px-1.5 py-0.5 font-mono text-[10px] font-medium shadow-sm">
                I
              </kbd>
            </span>
            <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
          </button>
        </motion.div>
      </motion.div>
    </section>
  )
}
