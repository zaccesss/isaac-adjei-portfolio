// These are reusable Framer Motion animation variants I use across the whole site.
// Instead of writing the same animation config over and over, I define them once here
// and import whichever ones I need in each component.

import type { Variants } from "framer-motion"

// Fades the element in and slides it up from slightly below its resting position
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" },
  },
}

// Simple opacity-only fade - no movement, just appears
export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.4, ease: "easeOut" },
  },
}

// Container variant that staggers its children - each child animates in 0.1s after the last
export const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
    },
  },
}

// Slides the element in from the left side
export const slideInLeft: Variants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.5, ease: "easeOut" },
  },
}

// Scales the element up from zero while fading it in
export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.4, ease: "easeOut" },
  },
}

// I use a faster, tighter fade for dashboard pages so navigation feels snappy rather than slow
export const dashboardPage: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.25, ease: "easeOut" },
  },
}

// Card entrance used on overview grids - each card staggers via the staggerContainer parent
export const dashboardCard: Variants = {
  hidden: { opacity: 0, y: 8, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.2, ease: "easeOut" },
  },
}

// Fast stagger for dense grids - tighter interval than staggerContainer to keep grids feeling cohesive
export const dashboardGrid: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.06,
    },
  },
}
