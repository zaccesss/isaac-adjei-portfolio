"use client"

import { motion } from "framer-motion"
import { fadeUp } from "@/lib/animations"

interface AnimatedTextProps {
  text: string
  className?: string
  delay?: number
  tag?: "h1" | "h2" | "h3" | "p" | "span"
}

export default function AnimatedText({
  text,
  className,
  delay = 0,
  tag: Tag = "p",
}: AnimatedTextProps) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.5, ease: "easeOut", delay },
        },
      }}
    >
      <Tag className={className}>{text}</Tag>
    </motion.div>
  )
}
