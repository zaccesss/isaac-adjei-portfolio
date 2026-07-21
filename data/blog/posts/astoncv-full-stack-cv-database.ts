import type { BlogPost } from "../index"

const _astoncv_full_stack_cv_database: BlogPost = {
    slug: "astoncv-full-stack-cv-database",
    title: "Building AstonCV: A Full-Stack CV Database with PHP, MySQL and Zero Frameworks",
    date: "2026-05-13",
    type: "blog",
    projectSlug: "astoncv",
    cover_image: "/images/projects/astoncv/main.webp",
    description:
      "How I built a full-stack CV database website from scratch using pure PHP 8.2 and MySQL for a university module, with eleven security measures, PDF export via mPDF and a complete UI redesign across four versions.",
    tags: ["PHP", "MySQL", "Security", "Full-Stack", "Aston", "Web Dev"],
    published: true,
    content: [
      {
        type: "p",
        text: "For DG1IAD Portfolio 3 at Aston University, the brief was to build a full-stack web application. The constraint that made it interesting: no frameworks. No Laravel. No Symfony. No Bootstrap. Pure PHP 8.2, MySQL, CSS3 and JavaScript, built from scratch.",
      },
      {
        type: "p",
        text: "[AstonCV](/projects/astoncv) is a CV database where anyone can browse and search student CVs publicly, register an account, manage their own CV once logged in and download any CV as a professionally formatted PDF. The site is deployed live on Aston University's internal Apache server and accessible via a custom Cloudflare domain redirect at astoncv.zacess.com.",
      },
      {
        type: "image",
        src: "/images/projects/astoncv/main.webp",
        alt: "AstonCV homepage showing the CV browse and search interface",
        caption: "The AstonCV homepage - public CV browsing with search and filter, no account required",
      },
      {
        type: "h2",
        text: "Why no frameworks?",
      },
      {
        type: "p",
        text: "The constraint was deliberate. When you use a framework, you are using someone else's solutions to problems you have not yet encountered. You learn the framework's patterns rather than the underlying mechanics. Building without a framework forces you to understand what the framework would have done for you: database connections, prepared statements, session management, CSRF protection. Every one of those things has to be written explicitly and understood completely.",
      },
      {
        type: "p",
        text: "I had used Next.js on [Phaemos](/projects/phaemos) and this portfolio. Those projects gave me the framework experience. AstonCV was an opportunity to work at a lower level and understand what is actually happening when a form submits, a session is validated or a query hits the database.",
      },
      {
        type: "h2",
        text: "The build: v1.0.0",
      },
      {
        type: "p",
        text: "Version 1.0.0 launched on 7 March 2026. The core structure was eight PHP files: index.php (the browse page), cv.php (individual CV detail), register.php, login.php, update.php, dashboard.php, logout.php and contact_handler.php. Each protected page checks $_SESSION['user_id'] at the top and redirects to login.php if the session is not active.",
      },
      {
        type: "p",
        text: "The database connection lives in db.php: a single PDO connection with error mode set to exceptions, returned as a singleton. Every query in every file uses this connection with prepared statements, so no query anywhere in the codebase builds SQL by string concatenation.",
      },
      {
        type: "p",
        text: "On the same day, v1.1.0 added PDF export via mPDF v8.2, installed with Composer. export_cv.php builds the PDF server-side from the stored CV data and streams it to the browser as a download. No client-side PDF generation, no external service, no watermark.",
      },
      {
        type: "h2",
        text: "The security layer",
      },
      {
        type: "p",
        text: "Security was not an afterthought. I implemented eleven specific measures before the v2.0.0 release:",
      },
      {
        type: "ol",
        items: [
          "XSS prevention: every piece of user-supplied content rendered to the page goes through htmlspecialchars(). No exceptions",
          "SQL injection prevention: every query uses PDO prepared statements with parameter binding. No string concatenation in SQL anywhere",
          "Password hashing: bcrypt via password_hash() on registration, password_verify() on login",
          "Session authentication: every protected page checks the session variable at the top and redirects immediately if it is missing",
          "Authorisation: the edit button on a CV detail page only appears if the logged-in user owns that CV, enforced server-side not just in the UI",
          "Server-side validation: all form inputs are validated in PHP before any database write, regardless of what client-side validation may have run",
          "CSRF protection: a hidden token generated per session is included in every POST form and validated on submission",
          "Brute-force lockout: five failed login attempts triggers a 15-minute account lockout, tracked in the database",
          "File upload validation: profile picture uploads are checked for MIME type against a whitelist and capped at 2 MB before being moved to the uploads directory",
          "Honeypot: the contact form includes a hidden field that is invisible to users but bots fill in automatically. Any submission with the honeypot field populated is silently discarded",
          "POST-only enforcement: contact_handler.php rejects any request that is not a POST, preventing direct GET access to the form processor",
        ],
      },
      {
        type: "p",
        text: "The brute-force lockout was the most interesting to implement. Rather than using a cache or Redis (both of which would add infrastructure), I added login_attempts and lockout_until columns to the users table. On each failed login, the attempt count increments. If it reaches five, lockout_until is set to now plus 15 minutes. On each login attempt, the route first checks whether lockout_until is in the future before validating the password.",
      },
      {
        type: "h2",
        text: "The v2.0.0 redesign",
      },
      {
        type: "p",
        text: "Version 2.0.0 launched on 20 March 2026 with a complete UI redesign. The original version was functional but sparse. The redesign introduced:",
      },
      {
        type: "ul",
        items: [
          "Aston University purple (#5c2d82) as the primary brand colour throughout",
          "Space Grotesk for headings and DM Sans for body text, both loaded via Google Fonts",
          "Real Aston University campus photography on every page: hero image on index, login, register, update and dashboard",
          "Animated stats bar with counting numbers (total CVs, registered users, total downloads)",
          "CSS marquee strip below the hero",
          "Scroll reveal animations on CV cards using IntersectionObserver",
          "Preloader on first page load",
          "Sticky dark navbar with backdrop blur on scroll",
          "Profile picture upload with avatar display across all pages",
          "Dashboard with CV completeness score, view statistics and account management",
          "View counter on each CV profile page",
        ],
      },
      {
        type: "p",
        text: "The live filter and sort on the browse page required some care. Filtering by programming language and sorting by name or view count both needed to work without a page reload. The approach was straightforward: JavaScript reads the filter and sort values from the dropdowns and the search field, then iterates the CV cards in the DOM, hiding any that do not match. No fetch calls, no API, no re-render. The DOM manipulation was fast enough that there was no perceived delay even with a full list of CVs.",
      },
      {
        type: "h2",
        text: "Deployment",
      },
      {
        type: "p",
        text: "The site runs on Aston University's internal Apache server. Local development used XAMPP (Apache and MySQL) on Windows, with the project directory mapped to localhost/astoncv. config.php holds the database credentials and is gitignored. config.example.php with placeholder values is committed instead, so anyone cloning the repo knows exactly what to create.",
      },
      {
        type: "p",
        text: "The Cloudflare domain redirect was a simple CNAME and Page Rule configuration: astoncv.zacess.com CNAME to the Aston server, with a forwarding rule handling the URL rewrite. This meant the site was accessible at both the full Aston URL and the short link without changing anything on the server.",
      },
      {
        type: "h2",
        text: "Version history and lessons",
      },
      {
        type: "p",
        text: "The project shipped four versions between March and May 2026. v2.1.0 and v2.2.0 were cleanup releases: updating contact email addresses throughout the codebase, adding standard repository files (CHANGELOG, SECURITY, ROADMAP, MIT licence), setting up a GitHub Actions CI workflow for PHP syntax checking on every push and adding the Aston University SVG favicon to every page.",
      },
      {
        type: "p",
        text: "The main lessons came from working without a framework. Every problem that frameworks solve invisibly becomes explicit. Session management, CSRF, prepared statements, output escaping: you have to think about all of them, deliberately, every time you write a new page. That is slower but it is also far more instructive. I left this project understanding web security at a level that using a framework would not have given me.",
      },
      {
        type: "p",
        text: "The other lesson was about scope. The brief did not require a dashboard, animated stats or campus photography. Those came from wanting to build something I was proud of rather than something that just met the minimum criteria. The extra scope cost time but the result was a site that looked like a real product rather than a coursework submission.",
      },
      {
        type: "quote",
        text: "When the constraint is no frameworks, every feature you add teaches you something a framework would have hidden.",
        source: "Something I understood about halfway through the build",
      },
      {
        type: "h2",
        text: "References",
      },
      {
        type: "ol-links",
        items: [
          { text: "AstonCV project page", url: "/projects/astoncv" },
          { text: "PHP 8 documentation - official language reference", url: "https://www.php.net/manual/en/" },
          { text: "MySQL 8 documentation - official reference for the database used in AstonCV", url: "https://dev.mysql.com/doc/" },
          { text: "mPDF library - PHP library for generating PDF files from HTML", url: "https://mpdf.github.io" },
          { text: "OWASP PHP Configuration Cheat Sheet - security best practices for PHP web applications", url: "https://cheatsheetseries.owasp.org/cheatsheets/PHP_Configuration_Cheat_Sheet.html" },
          { text: "OWASP SQL Injection Prevention Cheat Sheet - the authoritative guide to the attack vector defended against in AstonCV with prepared statements", url: "https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html" },
        ],
      },
    ],
  }

export default _astoncv_full_stack_cv_database
