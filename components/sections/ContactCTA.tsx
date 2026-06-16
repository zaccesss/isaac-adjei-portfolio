"use client"

// Call-to-action section at the bottom of the homepage.
// It gives visitors quick buttons to contact me, view my work or download my CV.

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
            I am actively looking for internship and placement opportunities in engineering and
            technology. Whether you have a role, a project, a collaboration idea or just want to
            connect, I am always open to a conversation.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              asChild
              size="lg"
              className="bg-gray-900 text-white hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100"
            >
              <a href="/api/cv-pdf">
                <Download className="mr-2 h-4 w-4" />
                Download CV
              </a>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/projects">
                View My Work
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg">
              <Link href="/contact">
                Get in touch
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
