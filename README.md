# zacess-portfolio

Personal portfolio website for Isaac Adjei — Electronic Engineering and Computer Science student at Aston University.

## Live

[zacess.com](https://zacess.com)

## Pages

- **Home** — Hero, featured projects, skills overview, contact CTA
- **About** — Personal story, education timeline, work experience
- **Projects** — 6 engineering projects with problem/solution breakdowns
- **Contact** — Contact form and social links

## Tech Stack

- **Build tool**: Vite with PostHTML templating
- **Styles**: SCSS with CSS custom properties for dark/light mode
- **JavaScript**: Vanilla ES modules, no framework
- **Fonts**: Space Grotesk (headings), Inter (body), JetBrains Mono (labels)

## Features

- Dark and light mode toggle with no flash on load
- Scroll reveal animations using IntersectionObserver
- Scroll progress indicator
- Fully responsive from 320px upward
- SEO meta tags on all pages
- Clean component-based structure

## Setup

```bash
npm install
npm run dev
```

Build for production:

```bash
npm run build
```

## Project Structure

```
src/
  assets/img/          # Images including profile photo and project images
  components/
    layout/
      header/          # Site header with nav and theme toggle
      footer/          # Site footer
    pages/
      index/           # Home page
      about/           # About page
      projects/        # Projects page
      contact/         # Contact page
  styles/              # Global styles and design tokens
  index.html           # Home page entry
  about.html           # About page entry
  projects.html        # Projects page entry
  contact.html         # Contact page entry
```

## Contact

contact@zacess.com
