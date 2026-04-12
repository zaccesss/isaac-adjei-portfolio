"use client"

import { motion } from "framer-motion"
import { ArrowRight, Download } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
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
            <Image src="/zac_profile.jpg" alt="Isaac Adjei" width={96} height={96} className="object-cover w-full h-full" priority />
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
          Second-year student at Aston University. Passionate about embedded systems, IoT, and
          accessible technology. Seeking internship opportunities.
        </motion.p>

        <motion.div
          variants={fadeUp}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Button asChild size="lg">
            <Link href="/projects">
              View My Work
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <a href="/resume/Isaac_Adjei_CV.pdf" download>
              <Download className="mr-2 h-4 w-4" />
              Download CV
            </a>
          </Button>
        </motion.div>

        <motion.div variants={fadeUp} className="flex justify-center">
          <SocialLinks iconSize="h-5 w-5" />
        </motion.div>
      </motion.div>
    </section>
  )
}
