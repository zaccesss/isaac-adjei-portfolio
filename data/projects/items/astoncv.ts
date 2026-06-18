import type { Project } from "../index"

const _astoncv: Project = {
    id: "astoncv",
    title: "AstonCV - Full-Stack CV Database",
    description:
      "Full-stack CV database website built from scratch with PHP 8.2, MySQL and custom CSS - no frameworks, deployed live on Aston University's server",
    longDescription:
      "AstonCV is a full-stack CV database website built from scratch for DG1IAD Portfolio 3 at Aston University, with no frameworks anywhere in the stack. Anyone can browse and search all student CVs in a responsive card grid, filter live by programming language, sort by name or view count and download any CV as a professionally formatted PDF. Registered users get a personal dashboard with a CV completeness score, view statistics, profile picture upload and the ability to update their CV and password.\n\nBuilding without any framework was a deliberate choice and the most instructive part of the project. Every routing decision, every input sanitisation step and every database interaction had to be written by hand, which forced a much deeper understanding of what frameworks actually do. Writing CSRF tokens, brute-force lockout counters and bcrypt password flows from scratch made the security implications of each decision concrete in a way that using a library would not. The mPDF integration for server-side PDF generation required reading the library source to understand how it expects HTML input to be structured before the output looked right.\n\nThe backend is pure PHP 8.2 with PDO prepared statements throughout and MySQL for the database. The site implements 11+ security measures: XSS prevention with htmlspecialchars(), SQL injection prevention via PDO, bcrypt password hashing and verification, session-based authentication on every protected page, owner-only CV editing enforced server-side, server-side form validation before every database write, CSRF tokens on all POST forms, brute-force lockout after five failed login attempts, file upload validation with a type whitelist and 2 MB size cap and a honeypot field on the contact form to block spam bots silently.\n\nThe UI uses Aston University purple throughout with Space Grotesk and DM Sans fonts, real campus photography on every page, scroll reveal animations on CV cards using IntersectionObserver, an animated stats counter bar, a CSS marquee strip, a sticky navbar with scroll blur and a preloader. The site is deployed on Aston University's Apache server and is also accessible via a custom Cloudflare CNAME redirect at astoncv.zacess.com.",
    technologies: [
      "PHP 8.2",
      "MySQL",
      "CSS3",
      "JavaScript",
      "Apache",
      "Composer",
      "mPDF",
      "Cloudflare",
    ],
    category: "web",
    featured: true,
    images: [
      "/images/projects/astoncv/main.webp",
      "/images/projects/astoncv/login.webp",
      "/images/projects/astoncv/register.webp",
      "/images/projects/astoncv/contact.webp",
      "/images/projects/astoncv/footer.webp",
    ],
    github: "https://github.com/zaccesss/astoncv",
    demo: "http://240191278.cs2410-web01pvm.aston.ac.uk/",
    date: "2026",
    highlights: [
      "Built entirely from scratch - pure PHP 8.2, MySQL and CSS with no frameworks",
      "11+ security measures: bcrypt, PDO, CSRF tokens, brute-force lockout, file upload validation, honeypot",
      "Server-side PDF export via mPDF v8.2 installed with Composer",
      "Live filter, sort and search with no page reload using JavaScript",
      "Personal dashboard with CV completeness score, view stats and profile picture upload",
      "Deployed live on Aston University's Apache server with custom Cloudflare domain redirect",
    ],
  }

export default _astoncv
