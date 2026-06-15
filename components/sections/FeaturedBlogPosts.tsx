"use client"

// I show the 4 featured blog posts on the homepage as PostCards so the writing section
// matches the style visitors are used to seeing on the blog page.
// Posts are marked featured in blog.ts - chosen to be distinct from the projects section.

import { motion } from "framer-motion"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getFeaturedPosts } from "@/data/blog"
import PostCard from "@/components/blog/PostCard"
import { staggerContainer, fadeUp } from "@/lib/animations"

export default function FeaturedBlogPosts() {
  const featured = getFeaturedPosts().slice(0, 4)
  if (featured.length === 0) return null

  return (
    <section className="py-24 border-t">
      <div className="container space-y-10">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="space-y-10"
        >
          <motion.div variants={fadeUp} className="flex items-end justify-between">
            <div className="space-y-2">
              <p className="text-sm font-mono text-primary uppercase tracking-widest">Writing</p>
              <h2 className="text-3xl font-bold tracking-tight">Featured posts</h2>
            </div>
            <Button asChild variant="ghost" className="hidden sm:flex">
              <Link href="/blog">
                All posts
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </motion.div>

          <motion.div variants={fadeUp} className="grid gap-4 sm:grid-cols-2">
            {featured.map((post) => (
              <PostCard key={post.slug} post={post} />
            ))}
          </motion.div>

          <motion.div variants={fadeUp} className="flex sm:hidden">
            <Button asChild variant="outline">
              <Link href="/blog">
                All posts
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
