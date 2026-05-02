// All project data for the portfolio. The Project interface describes the shape
// of every entry. The 'featured' flag controls whether a project appears on the
// homepage. 'video' is an optional path to a demo video shown on the detail page.

export interface Project {
  id: string
  title: string
  description: string
  longDescription: string
  technologies: string[]
  category: "embedded" | "web" | "software" | "hardware" | "other"
  featured: boolean
  images: string[]
  // optional path to a demo video shown below the gallery on the project detail page
  video?: string
  github?: string
  demo?: string
  date: string
  highlights: string[]
}

export const projects: Project[] = [
  {
    id: "audio-amplifier",
    title: "Two-Stage Audio Amplifier",
    description:
      "Analogue two-stage amplifier with TL071 active band-pass filter and OPA551 buffer, simulated in Proteus and manufactured as a custom PCB",
    longDescription:
      "Designed and built a two-stage audio amplifier as a first-year university project. Stage 1 uses a TL071 op-amp configured as an inverting active band-pass filter, achieving a gain of 10.67 dB across a passband of 6.63 Hz to 28.54 kHz. Stage 2 uses an OPA551 as a unity-gain voltage follower, providing the high output current (up to 200 mA) needed to drive an 8 Ω speaker at 281 mW from a single 9 V supply. The design includes Vcc/2 virtual ground biasing, reverse polarity protection (1N4007 diodes), an LED power indicator, an on/off switch and a 2200 µF output coupling capacitor. The full circuit was simulated in Proteus, then prototyped on breadboard (dual-supply and single-supply) before being laid out as a 65 mm x 40 mm PCB with a ground plane, mitred track corners and a DRC-clean design. Measured output of 2.980 Vpp against a 3 Vpp target - a 0.67% error.",
    technologies: ["Proteus", "Analogue Design", "PCB Design", "Op-Amp", "KiCad", "Electronics"],
    category: "hardware",
    featured: true,
    images: [
      "/images/projects/audio-amplifier/pcb-angled.jpg",
      "/images/projects/audio-amplifier/main.jpg",
      "/images/projects/audio-amplifier/pcb-top.jpg",
      "/images/projects/audio-amplifier/pcb-underside.jpg",
      "/images/projects/audio-amplifier/breadboard-dual.png",
      "/images/projects/audio-amplifier/breadboard-single.png",
      "/images/projects/audio-amplifier/freq-response.png",
      "/images/projects/audio-amplifier/scope-stage1.png",
      "/images/projects/audio-amplifier/scope-stage2.png",
      "/images/projects/audio-amplifier/pcb-layout-top.png",
      "/images/projects/audio-amplifier/3d-model.png",
    ],
    date: "2026",
    highlights: [
      "Two-stage design: TL071 active band-pass filter (Stage 1) and OPA551 unity-gain buffer (Stage 2)",
      "Gain: 10.67 dB, passband: 6.63 Hz to 28.54 kHz, output: 2.980 Vpp into 8 Ω (281 mW)",
      "Single 9 V supply with Vcc/2 virtual ground biasing and AC coupling",
      "Reverse polarity protection, LED indicator and on/off switch",
      "65 mm x 40 mm PCB with ground plane, mitred corners and DRC-clean design",
      "Validated across Proteus simulation, dual-supply breadboard, single-supply breadboard and PCB",
    ],
  },
  {
    id: "led-cube",
    title: "4x4x4 NeoPixel LED Cube",
    description:
      "64 individually addressable WS2812B LEDs on an Arduino Uno with adaptive brightness, four animation modes and a custom wooden enclosure",
    longDescription:
      "Designed and built a fully functional 4x4x4 interactive LED display system combining hardware construction and embedded software. The cube uses 64 WS2812B NeoPixel LEDs soldered onto a custom copper wire frame built layer by layer using a precision jig to maintain consistent spacing and alignment. Each of the four layers was continuity-tested before stacking and the complete assembly was housed inside a custom wooden enclosure with access ports for USB programming and power input.\n\nThe firmware runs on an Arduino Uno (ATmega328P at 16 MHz) and implements a non-blocking state machine using millis() to manage four independent animation modes without blocking the input polling loop. Mode 0 runs a colour wipe cascading through red, green and blue. Mode 1 smoothly fades all LEDs through the RGB spectrum simultaneously. Mode 2 simulates a fire effect using a per-LED heat value algorithm that maps temperature to colour from deep red through orange to bright yellow-white. Mode 3 cycles a full rainbow gradient across the array using a hue-wheel algorithm.\n\nAn LDR sensor on pin A0 reads ambient light at 10-bit resolution (0-1023) and maps it inversely to LED brightness (20-255) so the cube dims automatically in bright environments to reduce eye strain. A debounced power button on D2 toggles the system on and off with buzzer confirmation, and a mode button on D3 steps through the animation patterns. A 1000 µF electrolytic capacitor on the 5V rail stabilises voltage during rapid LED switching. The firmware streams live diagnostic data over serial at 9600 baud including LDR readings, calculated brightness values and active pattern name.",
    technologies: ["Arduino", "C++", "WS2812B", "Embedded Systems", "Electronics"],
    category: "embedded",
    featured: true,
    images: [
      "/images/projects/led-cube/main.jpeg",
      "/images/projects/led-cube/cube-lit-2.jpeg",
      "/images/projects/led-cube/final-setup.jpeg",
      "/images/projects/led-cube/build-layer.jpeg",
      "/images/projects/led-cube/frame-angle.jpeg",
      "/images/projects/led-cube/internals-1.jpeg",
      "/images/projects/led-cube/internals-2.jpeg",
      "/images/projects/led-cube/power-circuit.jpeg",
      "/images/projects/led-cube/build-lit.jpeg",
    ],
    github: "https://github.com/zaccesss/neopixel-led-cube-project",
    video: "/Media/neopixel-description.mp4",
    date: "2025",
    highlights: [
      "64 WS2812B LEDs hand-soldered onto a custom copper wire frame built layer by layer",
      "Non-blocking state machine using millis() keeps input polling running during all animations",
      "Four animation modes: colour wipe, smooth RGB fade, fire effect and rainbow cycle",
      "LDR adaptive brightness - maps 10-bit ambient light reading to 8-bit LED intensity in real time",
      "Debounced button inputs for power toggle and mode cycling with buzzer feedback",
      "1000 µF decoupling capacitor on the 5V rail protects LEDs from switching voltage spikes",
      "Live serial diagnostic output at 9600 baud: LDR value, brightness level and active pattern",
      "Custom wooden enclosure with cable management, ventilation and front-panel controls",
    ],
  },
  {
    id: "astoncv",
    title: "AstonCV - Full-Stack CV Database",
    description:
      "Full-stack CV database website built from scratch with PHP 8.2, MySQL and custom CSS - no frameworks, deployed live on Aston University's server",
    longDescription:
      "AstonCV is a full-stack CV database website built from scratch for DG1IAD Portfolio 3 at Aston University, with no frameworks anywhere in the stack. Anyone can browse and search all student CVs in a responsive card grid, filter live by programming language, sort by name or view count, and download any CV as a professionally formatted PDF. Registered users get a personal dashboard with a CV completeness score, view statistics, profile picture upload and the ability to update their CV and password.\n\nThe backend is pure PHP 8.2 with PDO prepared statements throughout and MySQL for the database. PDF export is handled server-side using the mPDF v8.2 library installed via Composer. The site implements 11 security measures: XSS prevention with htmlspecialchars(), SQL injection prevention via PDO, bcrypt password hashing and verification, session-based authentication on every protected page, owner-only CV editing enforced server-side, server-side form validation before every database write, CSRF tokens on all POST forms, brute-force lockout after five failed login attempts, file upload validation with a type whitelist and 2 MB size cap, and a honeypot field on the contact form to block spam bots silently.\n\nThe UI uses Aston University purple throughout with Space Grotesk and DM Sans fonts, real campus photography on every page, scroll reveal animations on CV cards using IntersectionObserver, an animated stats counter bar, a CSS marquee strip, a sticky navbar with scroll blur, and a preloader. The site is deployed on Aston University's Apache server and is also accessible via a custom Cloudflare CNAME redirect at astoncv.zacess.com.",
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
      "/images/projects/astoncv/main.png",
      "/images/projects/astoncv/login.png",
      "/images/projects/astoncv/register.png",
      "/images/projects/astoncv/contact.png",
      "/images/projects/astoncv/footer.png",
    ],
    github: "https://github.com/zaccesss/astoncv",
    demo: "https://astoncv.zacess.com",
    date: "2026",
    highlights: [
      "Built entirely from scratch - pure PHP 8.2, MySQL and CSS with no frameworks",
      "11 security measures: bcrypt, PDO, CSRF tokens, brute-force lockout, file upload validation, honeypot",
      "Server-side PDF export via mPDF v8.2 installed with Composer",
      "Live filter, sort and search with no page reload using JavaScript",
      "Personal dashboard with CV completeness score, view stats and profile picture upload",
      "Deployed live on Aston University's Apache server with custom Cloudflare domain redirect",
    ],
  },
  {
    id: "zacess-pages",
    title: "zacess.com - Interactive Terminal",
    description:
      "Terminal-style landing page for zacess.com - behaves like a real CLI session in the browser, built with Next.js 14 and TypeScript",
    longDescription:
      "zacess-pages is a terminal-style landing page for zacess.com, built as a proper Next.js 14 App Router application with TypeScript and Tailwind CSS. It behaves like a genuine CLI session rather than a styled webpage pretending to be one. A ZacessOS boot sequence plays on load with staggered delays, then the prompt activates with a blinking block cursor. The terminal supports command history via up/down arrow keys, tab autocomplete (single match completes immediately, multiple matches lists all options), line-by-line output with a 20ms per-line delay, and a suggest mode that collects typed input and fires a pre-filled mailto link.\n\nNavigation commands (whoiszac, about, projects, experience, skills, blog, contact, links) open the corresponding pages on isaacadjei.me in new tabs. Local commands include cv (downloads PDF), collaborate (opens mail client with pre-filled subject), status (shows build state) and clear (preserves the boot lines). Three hidden easter egg commands - zac, sudo and whoami - reward curious visitors. A ZenQuotes daily motivation quote is fetched via a Next.js server-side API route that proxies the public API to avoid CORS, refreshing every 30 minutes.\n\nMac-style window controls (close, minimise, maximise, new tab) are fully functional. The terminal uses a three-layer colour scheme: cyan prompt, green commands, amber output. A subtle yellow border glow gives depth, the scrollbar is styled to match the palette, and terminal colours never change regardless of light/dark mode. The site is deployed on Vercel with automatic deploys on push to main and Cloudflare DNS routing zacess.com and www.zacess.com.",
    technologies: ["Next.js 14", "TypeScript", "Tailwind CSS", "Vercel", "Cloudflare"],
    category: "web",
    featured: false,
    images: [
      "/images/projects/zacess-pages/main.png",
      "/images/projects/zacess-pages/terminal.png",
    ],
    github: "https://github.com/zaccesss/zacess-pages",
    demo: "https://zacess.com",
    date: "2024",
    highlights: [
      "Genuine terminal behaviour: boot sequence, blinking cursor, line-by-line output with 20ms delay",
      "Command history (up/down arrows), tab autocomplete and XSS-safe input echo",
      "Navigation commands link out to isaacadjei.me; cv command downloads PDF directly",
      "ZenQuotes API proxied server-side via Next.js API route to avoid CORS",
      "Mac-style window controls: close, minimise, maximise and new tab session",
      "Hidden easter egg commands reward curious visitors",
    ],
  },
  {
    id: "cnc-control",
    title: "CNC Milling Machine Control System",
    description:
      "Safety-critical Arduino control system for a CNC milling machine with door interlocks, emergency stop, state machine firmware and LCD feedback",
    longDescription:
      "Designed and programmed a safety-critical control system for a CNC milling machine built around an Arduino ATmega328P. The system implements an 8-state finite state machine (INIT, DOOR_OPEN, READY, RUNNING, COOLDOWN, FAULT) with strict transition validation - no state change is permitted unless all relevant safety conditions are satisfied. A magnetic reed switch continuously monitors the door and immediately halts the motor if it opens during the cutting cycle.\n\nAn emergency stop mushroom-head button triggers a hardware interrupt for sub-millisecond motor shutdown, engages a latching mechanism that requires manual reset, activates a buzzer alarm and locks out all inputs until cleared. A 10-second cutting cycle and a mandatory 5-second post-cycle safety delay (to allow the spindle to coast to a stop before the door can be opened) are both implemented using millis() non-blocking timing so interrupt handlers and sensor polling continue throughout. A TL071 op-amp configured as a Schmitt trigger buffers and conditions sensor signals for clean digital transitions into the Arduino, isolating it from the noisy industrial environment.\n\nA 16x2 HD44780 LCD driven over a 4-bit parallel interface displays real-time status messages for every state and a countdown during the safety delay. Multi-color LED indicators (green for ready, yellow for running, red for fault) and a buzzer provide additional feedback. A watchdog timer monitors for firmware crashes and forces a safe shutdown if the main loop stalls.",
    technologies: ["Arduino", "C++", "Embedded Systems", "TL071", "LCD", "Safety Systems"],
    category: "embedded",
    featured: false,
    images: [
      "/images/projects/cnc-control/main.png",
      "/images/projects/cnc-control/safety-test.png",
      "/images/projects/cnc-control/lcd.png",
    ],
    date: "2024",
    highlights: [
      "8-state finite state machine: INIT, DOOR_OPEN, READY, RUNNING, COOLDOWN, FAULT",
      "Hardware interrupt on E-Stop for sub-millisecond motor shutdown with latching reset",
      "Door interlock halts motor immediately on opening during any active state",
      "Mandatory 5-second post-cycle safety delay before door access is permitted",
      "TL071 Schmitt trigger buffers sensor signals to isolate Arduino from industrial noise",
      "Watchdog timer forces safe shutdown on firmware crash or main loop stall",
    ],
  },
  {
    id: "goods-lift",
    title: "Goods Lift Control System",
    description:
      "Arduino-based multi-floor goods lift controller with request queuing, door interlocks, emergency stop, PWM motor control and LCD status display",
    longDescription:
      "Developed a microcontroller-based goods lift control system for multi-floor navigation with a comprehensive safety architecture. The system tracks the current floor via a software counter confirmed by limit switches at the top and bottom floors and a homing sequence on startup to establish a known position reference. An array-based request queue stores pending floor calls and dispatches them using a nearest-floor-in-current-direction priority algorithm, with request merging (multiple calls to the same floor combined) and configurable expiry for unanswered requests.\n\nMotor control uses an H-bridge driver with PWM soft-start and braking routines for precise floor alignment and to reduce mechanical shock and gearbox wear. Door position is monitored by infrared or reed switch sensors - the lift cannot move unless both inner and outer doors are fully confirmed closed, and any door opening mid-travel triggers an immediate halt. An E-Stop button with hardware interrupt shuts down the motor instantly and enters EMERGENCY state, locking out all floor selection inputs until manually reset with a full safety check. Overload detection via a load cell prevents movement above a configurable weight threshold.\n\nAll timing (5-10 second door hold, inter-floor pause, E-Stop lockout countdown) is implemented with millis() non-blocking timing so the sensor polling and interrupt handlers remain active throughout. A 16x2 LCD shows current floor, destination, direction arrow and live status messages with custom characters for arrows and warning symbols. The audio system provides distinct tones: button confirmation beep, door-closing warning, arrival chime and a continuous E-Stop buzzer.",
    technologies: ["Arduino", "C++", "Embedded Systems", "LCD", "Motor Control", "Safety Systems"],
    category: "embedded",
    featured: false,
    images: [
      "/images/projects/goods-lift/main.png",
      "/images/projects/goods-lift/breadboard.png",
      "/images/projects/goods-lift/lcd.png",
    ],
    date: "2025",
    highlights: [
      "Nearest-floor-in-direction dispatch queue with request merging and configurable expiry",
      "PWM soft-start and braking for precise floor alignment and reduced mechanical wear",
      "Door interlocks: movement blocked unless both doors confirmed closed",
      "Hardware interrupt E-Stop with EMERGENCY state lockout and mandatory manual reset",
      "Overload detection prevents movement above configurable weight threshold",
      "All delays use millis() non-blocking timing - interrupt handlers stay live throughout",
    ],
  },
  {
    id: "cad-portfolio",
    title: "CAD Engineering Design Portfolio",
    description:
      "Three AutoCAD projects covering 2D technical drawing, 3D solid modeling and full product design to BS 8888 standard",
    longDescription:
      "Completed a portfolio of three computer-aided design projects in AutoCAD during 2024-2025, spanning precision component drawing, mechanical assembly design and consumer product design. All drawings comply with BS 8888 (Technical Product Documentation), ISO 128 (General Principles of Representation) and ASME Y14.5 (GD&T), with proper title blocks, revision clouds and layer management throughout.\n\nThe first project produced complete manufacturing documentation for a precision-machined mechanical component: three-view orthographic projections in first-angle projection with full dimensioning, bilateral and unilateral tolerances per ISO 286, geometric tolerancing (flatness, perpendicularity, concentricity) in feature control frames, surface finish symbols with Ra values, and a 3D solid model created from base extrude/revolve operations with fillet, chamfer and circular pattern features, rendered with realistic material assignments and three-point lighting.\n\nThe second project covered the complete design cycle for a functional mechanical assembly, from functional and environmental specification through detailed drawings. It includes GD&T datum reference frames, form, orientation and location tolerances, material selection rationale (strength-to-weight, machinability, corrosion resistance), section views, an exploded assembly drawing with balloon callouts and a structured BOM with COTS and custom part identification. The third project was a full consumer product design for a hairdryer, covering injection molding considerations (draft angles, uniform wall thickness, parting line positioning, snap-fit bosses), internal component layout with vibration isolation and thermal management, IEC 60335 safety compliance, exploded view documentation with hierarchical part numbering and step-by-step assembly instructions.",
    technologies: ["AutoCAD", "CAD", "GD&T", "BS 8888", "3D Modeling", "Technical Drawing"],
    category: "hardware",
    featured: false,
    images: [
      "/images/projects/cad-portfolio/main.png",
      "/images/projects/cad-portfolio/3d-model.png",
      "/images/projects/cad-portfolio/assembly.png",
    ],
    date: "2025",
    highlights: [
      "Three projects: precision component, mechanical assembly design cycle and hairdryer product design",
      "Full GD&T: datum reference frames, form, orientation and location tolerances, feature control frames",
      "Tolerancing per ISO 286 with surface finish symbols (Ra values) and machining callouts",
      "Assembly drawings with exploded views, balloon callouts, section views and structured BOM",
      "Consumer product design: injection molding DFM, IEC 60335 compliance, assembly sequence",
      "All drawings comply with BS 8888, ISO 128 and ASME Y14.5 with proper title blocks and revision control",
    ],
  },
  {
    id: "git-unlocked",
    title: "git-unlocked",
    description:
      "Free, MIT-licensed open source course taking anyone from absolute zero to industry-level Git proficiency across every major platform and tool",
    longDescription:
      "git-unlocked is a free, MIT-licensed, community-built course designed to take anyone from never having heard of version control all the way to using Git, GitHub, GitLab and every major platform confidently in real teams. v1.2.0 ships 217 topic files organised across 12 sections and 8 platforms: Git core, GitHub, GitLab, Bitbucket, Azure DevOps, Gitea, Forgejo and Codeberg, each tagged with difficulty levels (beginner / intermediate / advanced) and OS labels (Windows, Mac, Linux) so every reader knows exactly where they stand.\n\nThe course is structured into three progressive learning paths. Platform sections cover everything from account setup, repositories and branching strategy through to CI/CD pipelines, branch protection rules, security features, CLI tooling and cross-platform comparisons. Advanced Git topics include rebase strategies, bisect, worktrees, signing commits with GPG/SSH, monorepo patterns, GitOps workflows and a complete command reference. The IDE and editor section covers VS Code, JetBrains, Neovim, Cursor and Zed. The terminal tools section covers lazygit, git-delta, fzf, bat and tig.\n\nThe repo ships with GitHub Actions CI for automated markdownlint checking and link validation on every push, a HALL_OF_FAME.md for contributors, a full CONTRIBUTING guide, CODE_OF_CONDUCT, CHANGELOG, SECURITY policy, ROADMAP and an 11-first-contribution sandbox designed to let anyone make their first open source pull request in under 10 minutes. A curated resource collection of 120+ links rounds out the reference section. MIT licensed, public template. Everything free, forever.",
    technologies: [
      "Git",
      "GitHub",
      "GitLab",
      "Bitbucket",
      "Azure DevOps",
      "Markdown",
      "GitHub Actions",
      "Open Source",
    ],
    category: "other",
    featured: true,
    images: [],
    github: "https://github.com/zaccesss/git-unlocked",
    date: "2026",
    highlights: [
      "v1.2.0 ships 217 topic files across 12 sections: Git, GitHub, GitLab, Bitbucket, Azure DevOps, Gitea, Forgejo and Codeberg",
      "Three learning paths: beginner, intermediate and advanced, tagged per file and structured end to end",
      "Every command and workflow shown on Windows, Mac and Linux side by side",
      "IDE section: VS Code, JetBrains, Neovim, Cursor and Zed; terminal section: lazygit, delta, fzf, bat and tig",
      "GitHub Actions CI for automated markdownlint and link checking on every push",
      "First-contribution sandbox: make your first open source pull request in under 10 minutes",
    ],
  },
  {
    id: "phaemos",
    title: "PHAEMOS - Smart Maintenance Platform",
    description:
      "End-to-end IoT and predictive maintenance platform - FastAPI backend, Isolation Forest anomaly detection, Next.js live dashboard with automated alert and ticket workflows, actively being built",
    longDescription:
      "Machines fail. Not suddenly: gradually, silently, invisibly. PHAEMOS exists to reveal what machines cannot say about themselves.\n\nPHAEMOS (pronounced FAY-mos - coined from Ancient Greek phaen, to reveal, and mos, system or order) is a full-stack IoT and predictive maintenance platform built from hardware up. It collects real sensor data from ESP32, Arduino Uno and STM32 nodes, ingests it through a FastAPI backend, scores every reading with a machine learning anomaly detection model and surfaces everything on a live Next.js dashboard with alert management and an automated maintenance ticket workflow.\n\nThe hardware layer uses DHT22 for temperature and humidity, MPU6050 for vibration and acceleration and LDR for ambient light. The ESP32 acts as the primary Wi-Fi gateway, POSTing consolidated JSON telemetry every 5 seconds. The Arduino Uno reads sensors and relays formatted serial strings to the ESP32 for merging. The STM32 samples the MPU6050 at 100Hz and computes a short-window FFT to output a peak vibration frequency per second, giving the ML model a far richer vibration signal than simple acceleration values alone.\n\nThe backend is a FastAPI application in Python 3.11 backed by PostgreSQL 15, Redis for caching and queue management and JWT authentication with bcrypt password hashing. On every incoming telemetry POST it validates the device API key, stores the reading, evaluates all alert rules, scores the reading through the ML model, updates device status and last-seen timestamp and returns a 200 response in under 200ms. Every significant action is written to an immutable audit log.\n\nThe ML pipeline is a scikit-learn Isolation Forest - unsupervised, so it needs no labelled fault data to train. It learns the normal operating envelope from real telemetry and scores each new reading from 0 to 1. Scores above 0.7 trigger an alert and auto-generate a maintenance ticket. Scores above 0.85 attach a recommendation string to that ticket, suggesting a likely cause based on which combination of sensors is elevated. Features include raw readings, rolling means and standard deviations over the last 10 readings, total vibration magnitude and time-of-day encoding.\n\nThe Next.js 14 frontend polls the API every 5 seconds and renders live Recharts line charts for each metric. Anomalous readings are highlighted red on the chart in real time. Device cards show current status (online, warning, fault, offline) with colour coding. All views are role-gated at both the API and UI level across Admin, Technician and Viewer roles. The full stack runs with Docker Compose and deploys to Vercel (frontend) and Render (backend and database).",
    technologies: [
      "Next.js 14",
      "TypeScript",
      "FastAPI",
      "Python",
      "PostgreSQL",
      "Redis",
      "scikit-learn",
      "Docker",
      "ESP32",
      "Arduino",
      "STM32",
      "Recharts",
      "Tailwind CSS",
      "Vercel",
    ],
    category: "software",
    featured: false,
    images: [],
    github: "https://github.com/zaccesss/phaemos",
    demo: "https://phaemos.com",
    date: "2026",
    highlights: [
      "FastAPI backend processes every telemetry POST in under 200ms - validate, store, evaluate alert rules, score ML model and respond",
      "Isolation Forest ML: unsupervised anomaly detection - score above 0.7 triggers alert, above 0.85 attaches a diagnostic recommendation",
      "STM32 samples MPU6050 at 100Hz and computes FFT per second, outputting peak vibration frequency to the ML model",
      "Next.js live dashboard: Recharts line charts polling every 5 seconds, anomalous readings highlighted red in real time",
      "JWT auth with role-based access control (Admin, Technician and Viewer) enforced at API and UI level with full audit log",
      "Full Docker Compose stack - Vercel (frontend), Render (backend and database), operational in under an hour",
    ],
  },
]
