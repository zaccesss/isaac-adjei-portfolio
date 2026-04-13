"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { ArrowRight, Mail, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { fadeUp } from "@/lib/animations"

export default function ContactCTA() {
  return (
    <section className="py-24 border-t">
      <div className="container max-w-2xl text-center">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="space-y-6"
        >
          <Mail className="mx-auto h-10 w-10 text-primary" />
          <h2 className="text-3xl font-bold tracking-tight">Let&apos;s work together</h2>
          <p className="text-muted-foreground text-lg">
            I&apos;m actively looking for internship and placement opportunities. If you have a
            project or role that fits, I&apos;d love to hear from you.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild size="lg">
              <Link href="/contact">
                Get in touch
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/projects">
                View My Work
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" className="bg-gray-900 text-white hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100">
              <a href="/resume/Isaac_Adjei_CV.pdf" download>
                <Download className="mr-2 h-4 w-4" />
                Download CV
              </a>
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
