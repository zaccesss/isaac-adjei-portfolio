// I store all portfolio project data here - the featured flag controls homepage display.

export interface Project {
  id: string
  title: string
  description: string
  longDescription: string
  technologies: string[]
  category: "embedded" | "web" | "software" | "hardware" | "cybersecurity" | "other"
  featured: boolean
  images: string[]
  // optional path to a demo video shown below the gallery on the project detail page
  video?: string
  github?: string
  demo?: string
  date: string
  highlights: string[]
  ongoing?: boolean
}

export const projects: Project[] = [
  {
    id: "audio-amplifier",
    title: "Two-Stage Audio Amplifier",
    description:
      "Analogue two-stage amplifier with TL071 active band-pass filter and OPA551 buffer, simulated in Proteus and manufactured as a custom PCB",
    longDescription:
      "Designed and built a two-stage audio amplifier. The brief required a circuit capable of driving an 8 Ω speaker to a specified output level from a single 9 V supply, with a frequency response covering the full audible range. I chose a two-stage topology: a TL071 op-amp configured as an inverting active band-pass filter in Stage 1, followed by an OPA551 unity-gain voltage follower in Stage 2 to supply the current the speaker demands without the first stage having to work against a low-impedance load.\n\nStage 1 achieves a gain of 10.67 dB across a passband of 6.63 Hz to 28.54 kHz, with the upper and lower -3 dB cutoff frequencies set by the RC networks around the op-amp. Vcc/2 virtual ground biasing centres the signal on 4.5 V so the single-supply circuit swings symmetrically. A 2200 µF output coupling capacitor blocks the DC bias from the speaker. Stage 2 uses the OPA551 because it can source up to 200 mA continuously, well above what the TL071 can supply and enough to deliver 281 mW into 8 Ω. Reverse polarity protection is handled by two 1N4007 diodes in series with the supply rails, an LED power indicator and a power switch complete the auxiliary circuitry.\n\nI worked through three build stages before committing to PCB. The circuit was simulated in Proteus with ideal and then real component models, then breadboarded on a dual-supply bench supply to verify gain and bandwidth independently of the biasing network, then rebuilt on a single 9 V supply to confirm the Vcc/2 biasing held stable under load. Only after both breadboard versions matched simulation did I move to PCB layout. The final board is 65 mm x 40 mm, laid out in Proteus with a continuous ground plane, 45-degree mitred track corners and a DRC-clean design. The assembled and powered PCB measured a 2.980 Vpp output against a 3 Vpp target, a 0.67% error.",
    technologies: ["Proteus", "Analogue Design", "PCB Design", "Op-Amp", "Electronics"],
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
      "/images/projects/audio-amplifier/schematic.png",
    ],
    github: "https://github.com/zaccesss/two-stage-audio-amplifier",
    date: "2026",
    highlights: [
      "Two-stage design: TL071 active band-pass filter (Stage 1) and OPA551 unity-gain buffer (Stage 2)",
      "Gain: 10.67 dB, passband: 6.63 Hz to 28.54 kHz, output: 2.980 Vpp into 8 Ω (281 mW)",
      "Single 9 V supply with Vcc/2 virtual ground biasing and AC coupling",
      "Reverse polarity protection, LED indicator and on/off switch",
      "65 mm x 40 mm PCB laid out in Proteus with ground plane, mitred corners and DRC-clean design",
      "Validated across Proteus simulation, dual-supply breadboard, single-supply breadboard and PCB",
    ],
  },
  {
    id: "led-cube",
    title: "4x4x4 NeoPixel LED Cube",
    description:
      "64 individually addressable WS2812B LEDs on an Arduino Uno with adaptive brightness, four animation modes and a custom wooden enclosure",
    longDescription:
      "Designed and built a fully functional 4x4x4 interactive LED display system combining hardware construction and embedded software. The cube uses 64 WS2812B NeoPixel LEDs soldered onto a custom copper wire frame built layer by layer using a precision jig to maintain consistent spacing and alignment. Each of the four layers was continuity-tested before stacking and the complete assembly was housed inside a custom wooden enclosure with access ports for USB programming and power input.\n\nThe build process was the most demanding part of the project. Soldering 64 LEDs onto a three-dimensional copper wire frame while keeping every LED facing outward and every connection solid required building a dedicated jig from a drilled wooden block before any soldering started. Each layer was tested for short circuits and open connections before being added to the stack. The wooden enclosure was measured and cut to fit the finished frame with deliberate clearance for heat dissipation, and the front panel was drilled for the power button, mode button and LDR window.\n\nThe firmware runs on an Arduino Uno (ATmega328P at 16 MHz) and implements a non-blocking state machine using millis() to manage four independent animation modes without blocking the input polling loop. Mode 0 runs a colour wipe cascading through red, green and blue. Mode 1 smoothly fades all LEDs through the RGB spectrum simultaneously. Mode 2 simulates a fire effect using a per-LED heat value algorithm that maps temperature to colour from deep red through orange to bright yellow-white. Mode 3 cycles a full rainbow gradient across the array using a hue-wheel algorithm.\n\nAn LDR sensor on pin A0 reads ambient light at 10-bit resolution (0-1023) and maps it inversely to LED brightness (20-255) so the cube dims automatically in bright environments to reduce eye strain. A debounced power button on D2 toggles the system on and off with buzzer confirmation and a mode button on D3 steps through the animation patterns. A 1000 µF electrolytic capacitor on the 5V rail stabilises voltage during rapid LED switching. The firmware streams live diagnostic data over serial at 9600 baud including LDR readings, calculated brightness values and active pattern name.",
    technologies: ["Arduino", "C++", "WS2812B", "Embedded Systems", "Electronics"],
    category: "embedded",
    featured: true,
    images: [
      "/images/projects/led-cube/neopixel-main.jpg",
      "/images/projects/led-cube/cube-lit-2.jpeg",
      "/images/projects/led-cube/final-setup.jpeg",
      "/images/projects/led-cube/build-layer.jpeg",
      "/images/projects/led-cube/frame-angle.jpeg",
      "/images/projects/led-cube/internals-1.jpeg",
      "/images/projects/led-cube/internals-2.jpeg",
      "/images/projects/led-cube/power-circuit.jpeg",
      "/images/projects/led-cube/build-lit.jpeg",
      "/images/projects/led-cube/main.jpeg",
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
      "/images/projects/astoncv/main.png",
      "/images/projects/astoncv/login.png",
      "/images/projects/astoncv/register.png",
      "/images/projects/astoncv/contact.png",
      "/images/projects/astoncv/footer.png",
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
  },
  {
    id: "zacess-pages",
    title: "Business Website",
    description:
      "Personal website at zacess.com with a terminal-style interface, built with Next.js 14 and TypeScript. Currently evolving into a full business presence - direction not fully set yet but the foundation is live.",
    longDescription:
      "zacess-pages is a terminal-style landing page for zacess.com, built as a proper Next.js 14 App Router application with TypeScript and Tailwind CSS. It behaves like a genuine CLI session rather than a styled webpage pretending to be one. A ZacessOS boot sequence plays on load with staggered delays, then the prompt activates with a blinking block cursor. The terminal supports command history via up/down arrow keys, tab autocomplete (single match completes immediately, multiple matches lists all options), line-by-line output with a 20ms per-line delay and a suggest mode that collects typed input and fires a pre-filled mailto link.\n\nThe core challenge was making the terminal feel real rather than decorative. Real terminals have history, autocomplete with multi-match disambiguation, deliberate output pacing and a clear distinction between navigation and local commands. Each of these had to be implemented from scratch in React state because a div with a monospaced font is not a terminal. The boot sequence uses staggered timeouts rather than CSS animation so each line appears after the previous one completes, which reads as sequential system output rather than a scripted effect.\n\nNavigation commands (whoiszac, about, projects, experience, skills, blog, contact, links) open the corresponding pages on isaacadjei.me in new tabs. Local commands include cv (downloads PDF), collaborate (opens mail client with pre-filled subject), status (shows build state) and clear (preserves the boot lines). Three hidden easter egg commands reward curious visitors. A ZenQuotes daily motivation quote is fetched via a Next.js server-side API route that proxies the public API to avoid CORS, refreshing every 30 minutes.\n\nMac-style window controls (close, minimise, maximise, new tab) are fully functional. The terminal uses a three-layer colour scheme: cyan prompt, green commands, amber output. A subtle yellow border glow gives depth, the scrollbar is styled to match the palette and terminal colours never change regardless of system light or dark mode. The site is deployed on Vercel with automatic deploys on push to main and Cloudflare DNS routing zacess.com and www.zacess.com.",
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
      "Genuine terminal behaviour: ZacessOS boot sequence, blinking block cursor and line-by-line output with 20ms delay",
      "Command history (up/down arrows), tab autocomplete with multi-match listing and XSS-safe input echo",
      "Navigation commands open isaacadjei.me pages in new tabs; cv command downloads PDF directly",
      "ZenQuotes motivational quote fetched server-side via Next.js API route to avoid CORS, refreshed every 30 minutes",
      "Mac-style window controls: close, minimise, maximise and new tab session - all fully functional",
      "Suggest mode collects multi-line input and opens a pre-filled mailto link for visitor messages",
      "Three-layer colour scheme: cyan prompt, green commands, amber output - consistent regardless of system theme",
      "Three hidden easter egg commands and a collaborate command with pre-filled email subject and body",
    ],
  },
  {
    id: "cnc-control",
    title: "CNC Milling Machine Control System",
    description:
      "Safety-critical Arduino control system for a CNC milling machine with door interlocks, emergency stop, state machine firmware and LCD feedback",
    longDescription:
      "Designed and programmed a safety-critical control system for a CNC milling machine built around an Arduino ATmega328P. The central design constraint was that the machine must be incapable of operating unsafely regardless of how it is used - not just that it handles the happy path correctly. Every transition in the 8-state finite state machine (INIT, DOOR_OPEN, READY, RUNNING, COOLDOWN, FAULT) is guarded by a full safety check: no state change is permitted unless every relevant condition is satisfied simultaneously. This means, for example, that a door interlock open during RUNNING immediately drives the state to FAULT, not back to READY, and FAULT can only exit after a deliberate manual reset sequence.\n\nThe emergency stop is a mushroom-head button wired to a hardware interrupt (INT0) so the ATmega328P reacts in under a millisecond regardless of where the main loop is executing. On activation it kills the motor, latches a fault flag in EEPROM so a power cycle cannot silently clear it, activates the buzzer and blocks all input acceptance until an operator physically holds the reset button for two seconds, confirming a human has acknowledged the fault. The 10-second cutting cycle and the mandatory 5-second post-cycle safety delay before the door can open are both driven by millis() non-blocking timing so the ISR and sensor polling continue running throughout and cannot miss an E-Stop or door event mid-cycle.\n\nSensor signal conditioning uses a TL071 op-amp configured as a Schmitt trigger to buffer the reed switch output. Industrial environments generate significant electrical noise from motor switching transients and the Schmitt trigger provides hysteresis that prevents false triggering on slow or noisy signal edges before they reach the ATmega digital input. A 16x2 HD44780 LCD driven over a 4-bit parallel interface shows a plain-English status message and a countdown during the safety delay. Multi-colour LED indicators (green for READY, yellow for RUNNING, red for FAULT) and a buzzer give at-a-glance state information without requiring the operator to read the display. A hardware watchdog timer restarts the system and enters FAULT if the main loop stalls for any reason, ensuring a firmware bug cannot leave the machine stuck in an active state.",
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
      "Developed a microcontroller-based goods lift control system for multi-floor navigation with a comprehensive safety architecture. The floor tracking uses a software counter incremented or decremented on each limit switch trigger, with a homing sequence on startup that drives the cabin to the bottom limit before accepting any floor requests, giving the system a confirmed reference position every time it powers on. An array-based request queue stores pending floor calls and dispatches them using a nearest-floor-in-current-direction priority algorithm - the same approach used in real lift controllers to minimise travel time. Duplicate calls to the same floor are merged and unanswered requests expire after a configurable timeout so the queue cannot grow stale.\n\nMotor control uses an H-bridge driver with PWM soft-start and regenerative braking routines. Ramping the motor up and down rather than switching it on and off abruptly reduces mechanical shock and gearbox wear significantly over repeated cycles. Door position is monitored by infrared or reed switch sensors at both the inner and outer door positions - the firmware will not issue a motor drive command unless both are confirmed closed, and any door opening mid-travel triggers an immediate motor cut and state change to DOOR_OPEN. An E-Stop button wired to a hardware interrupt shuts down the motor in under a millisecond and places the system in EMERGENCY state, blocking all floor selection inputs until an operator manually resets it after a full safety check. A load cell reading above a configurable weight threshold also blocks movement with an OVERLOAD status on the display.\n\nAll hold times (5 to 10 second door-open dwell, inter-floor pause, E-Stop lockout countdown) run on millis() non-blocking timing so the sensor polling loop and interrupt handlers remain active throughout - a door event or E-Stop press during any timed operation is never missed. The 16x2 LCD shows current floor, target floor, travel direction and a live status string with custom-defined arrow and warning characters. The audio subsystem uses distinct tones for different events: a short confirmation beep on button press, a repeating door-closing warning before the cabin moves, an arrival chime on reaching the target floor and a continuous tone during E-Stop lockout.",
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
      "Completed a portfolio of three computer-aided design projects in AutoCAD during 2024-2025, spanning precision component drawing, mechanical assembly design and consumer product design. All drawings comply with BS 8888 (Technical Product Documentation), ISO 128 (General Principles of Representation) and ASME Y14.5 (GD&T), with proper title blocks, revision clouds and layer management throughout.\n\nWorking to these standards for the first time made clear how much information a well-constructed engineering drawing must communicate without ambiguity. Every tolerance zone, every surface finish symbol and every datum reference frame is a specification that a machinist or manufacturer will act on directly. Getting those details right - understanding the difference between bilateral and unilateral tolerances, or why a datum reference frame must be chosen based on the functional requirements of the assembly rather than drawing convenience - was the core learning across all three projects.\n\nThe first project produced complete manufacturing documentation for a precision-machined mechanical component: three-view orthographic projections in first-angle projection with full dimensioning, bilateral and unilateral tolerances per ISO 286, geometric tolerancing (flatness, perpendicularity, concentricity) in feature control frames, surface finish symbols with Ra values and a 3D solid model created from base extrude/revolve operations with fillet, chamfer and circular pattern features, rendered with realistic material assignments and three-point lighting.\n\nThe second project covered the complete design cycle for a functional mechanical assembly, from functional and environmental specification through detailed drawings. It includes GD&T datum reference frames, form, orientation and location tolerances, material selection rationale (strength-to-weight, machinability, corrosion resistance), section views, an exploded assembly drawing with balloon callouts and a structured BOM with COTS and custom part identification. The third project was a full consumer product design for a hairdryer, covering injection moulding considerations (draft angles, uniform wall thickness, parting line positioning, snap-fit bosses), internal component layout with vibration isolation and thermal management, IEC 60335 safety compliance, exploded view documentation with hierarchical part numbering and step-by-step assembly instructions.",
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
      "git-unlocked is a free, MIT-licensed, community-built course designed to take anyone from never having heard of version control all the way to using Git, GitHub, GitLab and every major platform confidently in real teams. v1.2.0 ships 217 topic files organised across 12 sections and 8 platforms: Git core, GitHub, GitLab, Bitbucket, Azure DevOps, Gitea, Forgejo and Codeberg, each tagged with difficulty levels (beginner / intermediate / advanced) and OS labels (Windows, Mac, Linux) so every reader knows exactly where they stand.\n\nThe motivation for building this came from watching people in university struggle not with the concepts of version control but with the sheer fragmentation of documentation across platforms. Every platform has its own docs, every tutorial picks a different starting point and almost none of them cover what actually happens when things go wrong. git-unlocked was built to be the single resource I wished had existed: opinionated, progressive, honest about the hard parts and free without any paywall or account requirement.\n\nThe course is structured into three progressive learning paths. Platform sections cover everything from account setup, repositories and branching strategy through to CI/CD pipelines, branch protection rules, security features, CLI tooling and cross-platform comparisons. Advanced Git topics include rebase strategies, bisect, worktrees, signing commits with GPG/SSH, monorepo patterns, GitOps workflows and a complete command reference. The IDE and editor section covers VS Code, JetBrains, Neovim, Cursor and Zed. The terminal tools section covers lazygit, git-delta, fzf, bat and tig.\n\nThe repo ships with GitHub Actions CI for automated markdownlint checking and link validation on every push, a HALL_OF_FAME.md for contributors, a full CONTRIBUTING guide, CODE_OF_CONDUCT, CHANGELOG, SECURITY policy, ROADMAP and a first-contribution sandbox designed to let anyone make their first open source pull request in under 10 minutes. A curated resource collection of 120+ links rounds out the reference section. MIT licensed, public template. Everything free, forever.",
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
    images: [
      "/images/projects/git-unlocked/github-logo-3d.jpg",
      "/images/projects/git-unlocked/git_unlocked_banner.svg",
      "/images/projects/git-unlocked/octocat-laptop.jpg",
      "/images/projects/git-unlocked/octocat-groot.jpg",
      "/images/projects/git-unlocked/octocat-closeup.jpg",
    ],
    github: "https://github.com/zaccesss/git-unlocked",
    date: "2026",
    highlights: [
      "v1.2.0 ships 217 topic files across 12 sections: Git, GitHub, GitLab, Bitbucket, Azure DevOps, Gitea, Forgejo and Codeberg",
      "Three learning paths: beginner, intermediate and advanced, tagged per file and structured end to end",
      "Every command and workflow shown on Windows, Mac and Linux side by side - nothing assumed, nothing skipped",
      "Real-world section: GitOps with ArgoCD and Flux, monorepos with Nx and Turborepo, disaster recovery from force push accidents and accidental secrets",
      "Security reference: gitleaks, TruffleHog, push protection, commit signing, SLSA and supply chain attack prevention",
      "IDE section: VS Code, JetBrains, Neovim, Cursor and Zed; terminal section: lazygit, delta, fzf, bat and tig",
      "Curated resource index of 120+ books, videos, tools, courses and communities with recommended learning paths by level",
      "GitHub Actions CI for automated markdownlint and link checking on every push",
      "First-contribution sandbox: make your first open source pull request in under 10 minutes",
    ],
  },
  {
    id: "phaemos",
    title: "PHAEMOS - Smart Maintenance Platform",
    description:
      "End-to-end IoT and predictive maintenance platform - four hardware nodes, FastAPI backend, Isolation Forest anomaly detection, Next.js live dashboard with alert and ticket workflows, actively being built",
    longDescription:
      "Machines fail. Not suddenly - gradually, silently, invisibly. PHAEMOS exists to reveal what machines cannot say about themselves.\n\nPHAEMOS (pronounced FAY-mos - coined from Ancient Greek phaen, to reveal, and mos, system or order) is a full-stack IoT and predictive maintenance platform built from hardware up. It collects real-time sensor data from four hardware nodes, ingests it through a FastAPI backend, scores every reading with a machine learning anomaly detection model and surfaces everything on a live Next.js dashboard with alert management and an automated maintenance ticket workflow.\n\nThe updated hardware architecture uses four nodes: an ESP32 as the primary IoT gateway consolidating 11 sensors (BME280 for temperature, humidity and pressure; MPU6050 for vibration; INA219 for current and voltage monitoring; MLX90614 for contactless IR surface temperature; VL53L0X for distance; MQ-2 for gas and smoke; AS5600 for shaft RPM via magnetic encoding; DS18B20 for contact temperature; MAX4466 microphone; LDR for ambient light; FC-28 for water ingress detection) and driving a SSD1306 OLED, WS2812B RGB LED strip, passive buzzer and 4-channel relay module. The STM32 Black Pill F411CEU6 samples an MPU6050 at 100Hz via I2C, computes a short-window FFT in HAL C and transmits peak vibration frequency over UART. An Arduino Nano reads a secondary BME280, LDR and FC-28 and relays formatted serial strings. A Raspberry Pi Pico 2W running MicroPython reads a BME280 and LDR, displays locally on an OLED and POSTs ambient telemetry independently over Wi-Fi.\n\nThe backend is a FastAPI application in Python 3.11 backed by PostgreSQL 15 and Redis. On every incoming telemetry POST it validates the device API key, stores the reading across a 25-field telemetry schema, evaluates all alert rules, scores the reading through the ML model and returns a 200 response in under 200ms. Every significant action is written to an immutable audit log. JWT authentication with bcrypt hashing enforces Admin, Technician and Viewer roles at both API route and UI level.\n\nThe ML pipeline is a scikit-learn Isolation Forest - unsupervised, requiring no labelled fault data. It learns the normal operating envelope and scores each reading from 0 to 1. Scores above 0.7 trigger an alert and auto-generate a maintenance ticket. Scores above 0.85 attach a diagnostic recommendation. Features include raw readings, rolling means and standard deviations across all sensor channels, vibration magnitude and time-of-day encoding.\n\nThe Next.js frontend polls the API every 5 seconds with live Recharts charts per sensor metric, anomalous readings highlighted red and device cards showing current status. The full stack runs with Docker Compose and deploys to Vercel (frontend) and Render (backend and database).",
    technologies: [
      "Next.js",
      "TypeScript",
      "FastAPI",
      "Python",
      "MicroPython",
      "PostgreSQL",
      "Redis",
      "scikit-learn",
      "Docker",
      "ESP32",
      "STM32",
      "Arduino Nano",
      "Raspberry Pi Pico",
      "Recharts",
      "Tailwind CSS",
      "Vercel",
    ],
    category: "software",
    featured: true,
    images: [
      "/images/projects/phaemos/dashboard.svg",
      "/images/projects/phaemos/main.svg",
      "/images/projects/phaemos/pipeline.svg",
    ],
    github: "https://github.com/zaccesss/phaemos",
    demo: "https://phaemos.com",
    date: "2025 - Present",
    ongoing: true,
    highlights: [
      "Four hardware nodes: ESP32 primary (11 sensors), STM32 Black Pill (100Hz FFT vibration), Arduino Nano (secondary BME280/moisture) and Raspberry Pi Pico 2W (MicroPython ambient node)",
      "FastAPI backend processes every telemetry POST in under 200ms - validate, store across 25-field schema, evaluate alert rules, score ML model and respond",
      "Isolation Forest ML: unsupervised anomaly detection - score above 0.7 triggers alert and auto-generates ticket, above 0.85 attaches diagnostic recommendation",
      "STM32 samples MPU6050 at 100Hz in HAL C and computes FFT per second, giving the ML model a richer vibration signal than raw acceleration values",
      "Next.js live dashboard: Recharts charts polling every 5 seconds, anomalous readings highlighted red, device status cards, role-gated views",
      "Full Docker Compose stack - Vercel (frontend), Render (backend and database), JWT auth with RBAC across Admin, Technician and Viewer roles",
    ],
  },
  {
    id: "avr-zac",
    title: "avr-zac",
    description:
      "ATmega644P bare metal C projects with state machines, interrupts, PWM and ADC - actively being extended",
    longDescription:
      "A personal project to learn bare metal AVR C development, writing directly to hardware registers without any framework or abstraction layer. The ATmega644P runs at 20 MHz on a custom PCB designed by Richard Reeves (lab technician at Aston University) with an external crystal, LM317T voltage regulator and 10-way ISP headers breaking out all 32 I/O pins. Programming is handled by a Pololu USB AVR Programmer v2.1 via STK500v2, with the -B 10 ISP clock flag required to avoid timeout errors. Richard Reeves also provided components and guidance throughout.\n\nThe purpose of the project is to understand what microcontroller code is actually doing at the register level before using higher-level tools that abstract it away. Working without Arduino or any HAL means reading the datasheet for every peripheral before writing a single line of code. Understanding why EICRA sets the interrupt sense control, why EIMSK enables the specific interrupt and why sei() must come last builds intuition that transfers to any MCU architecture. Every project in the repo represents a new concept understood at that level, not just code that works.\n\nSeven projects progress from a basic LED blink through GPIO manipulation, button polling, interrupt-driven input, software PWM and ADC to a full nine-mode state machine. 00_fuse_test establishes the correct fuse configuration for the external crystal. 01_blink proves the toolchain with a double blink on PB0. 02_led_cycle sequences five LEDs using bit shifting on PORTB. 03_button_polling drives a buzzer by reading PIND. 04_interrupt_buzzer replaces polling with a hardware INT0 ISR, EICRA, EIMSK and sei(). 05_state_machine_basic builds a four-mode machine using enum, ISR and software debounce. The final project, 06_state_machine, implements nine modes cycling on each button press via a volatile mode variable updated inside an INT0 ISR: Chase, Blink All, Alternate, PWM Fade, Knight Rider, Binary Counter, Random (seeded from ADC noise on a floating pin), Reaction Game and Tetris Melody - the last two combining ADC noise seeding and buzzer tone sequencing with LED synchronisation.\n\nAll code can be built with PlatformIO in VS Code or Microchip Studio 7. The repo ships with WORKFLOW.md (full IDE setup, environment switching, build tasks and troubleshooting), docs/wiring.md (current breadboard connections and header pin tables), docs/hardware_notes.md (fuse settings, ISP clock speed, register map and ADC configuration), hardware/pcb_notes.md (component list, connector pinout, power supply circuit and soldering order), the original AVR Project PCB 2019 schematic PDF and the full ATmega644P datasheet. Eight session notes each have a reference document and hands-on lab exercises covering AVR C fundamentals, bit shifting and data types, inputs and interrupts, timers, hardware PWM, UART transmission, ADC and UART reception. MIT licensed and actively being extended.",
    technologies: ["C", "Embedded C", "ATmega644P", "PlatformIO", "Microchip Studio", "AVR", "State Machines", "Interrupts", "PWM", "ADC"],
    category: "embedded",
    featured: false,
    ongoing: true,
    images: [
      "/images/projects/avr-zac/chip.svg",
      "/images/projects/avr-zac/main.svg",
      "/images/projects/avr-zac/statemachine.svg",
    ],
    github: "https://github.com/zaccesss/avr-zac",
    date: "2026 - Present",
    highlights: [
      "7 projects from 00_fuse_test to 06_state_machine - bare metal register manipulation with no framework abstractions",
      "Nine-mode state machine: Chase, Blink All, Alternate, PWM Fade, Knight Rider, Binary Counter, Random, Reaction Game and Tetris Melody",
      "Custom PCB designed by Richard Reeves (Aston University) with LM317T regulator, external crystal and ISP header",
      "Pololu USB AVR Programmer v2.1 via STK500v2 - buildable with PlatformIO in VS Code or Microchip Studio 7",
      "Comprehensive documentation: WORKFLOW.md, wiring reference, hardware notes, PCB schematic and ATmega644P datasheet",
      "8 session notes with hands-on lab exercises covering AVR C, bit shifting, interrupts, timers, PWM, UART and ADC",
    ],
  },
  {
    id: "dotfiles",
    title: "dotfiles",
    description:
      "Cross-platform shell environment for macOS, Linux and Windows - 59 numbered topic files, identical muscle memory on every machine, automatic 3-platform git mirroring and an accessibility-first colour scheme",
    longDescription:
      "These dotfiles exist because of two separate problems that compounded each other.\n\nThe first is accessibility. I lost sight in my right eye at age two due to retinoblastoma and have worked with monocular vision my entire life. A monochrome terminal is a wall of text. With monocular vision you cannot rely as much on the spatial depth cues that binocular vision provides - the subtle sense of layers that helps the brain pre-parse where sections begin and end. Colour takes over that job. The profile defines a consistent colour system in `02-colours`: cyan borders and command names, magenta section headers, green for success, yellow for dates, red for errors. Every colour was chosen to remain distinguishable under common deuteranopia and protanopia simulations and tested on both dark and light terminal themes. The `cmds` function prints a full colour-coded command reference grouped by topic, saves the cursor position first so `clast` can snap everything back to exactly where you were without scrolling.\n\nThe second problem is context switching. I work across three machines: a MacBook Air running zsh, a Lenovo laptop running Linux with bash and a Windows gaming PC running PowerShell 7. Every time I switched machines I had to remember different commands for the same operations: `pbcopy` on macOS, `xclip` on Linux, `Set-Clipboard` on Windows. `ipconfig getifaddr en0` on macOS, `hostname -I` on Linux. The goal of the naming convention is that `copy`, `paste`, `localip`, `dns-flush`, `gs`, `gaa`, `gc`, `gp`, `dcu`, `dcd` and every other alias mean exactly the same thing and behave exactly the same way on all three platforms. The implementation differs per platform, the name never does.\n\nThe architecture is 59 numbered topic files per platform, one per area of concern. The `zshrc`, `bashrc` and PowerShell profile loaders are each five lines: a glob that sources every numbered file in order. Number ordering is deliberate - `02-colours` defines the ANSI variables that `06-functions` uses in the welcome banner and `cmds`. `23-kubernetes` defines `kc` as `kubectl` before `37-kotlin` loads, which is why the Kotlin compile shortcuts are `ktc` and `ktcr` rather than `kc`. The topic files cover PATH and environment, git, mirroring, navigation shortcuts, SSH, network diagnostics, security and crypto, databases, JSON, file sync, Homebrew, GitHub CLI, nvm, editors, shell tools, tmux, Docker, Kubernetes, cloud platforms, Terraform, Helm, Vagrant, Ansible, and 30+ language toolchains from Python, Node, Go and Rust through Kotlin, Scala, Haskell, Elixir, VHDL, Zig and Ada to Flutter, Android ADB, NVIDIA CUDA, game engines, CAD tools, FFmpeg, Blender and Adobe.\n\nnvm is lazy-loaded via stub functions that replace themselves on first call. Sourcing `nvm.sh` on every shell start costs roughly 200ms on the MacBook Air. The stubs intercept the first call to `node`, `npm`, `npx` or any nvm command, run `unset -f` to clear all stubs, source the real `nvm.sh`, then call through with the original arguments. Every subsequent call goes directly to nvm. The 200ms cost is paid once per session, not on every new tab.\n\nStarship is the prompt, initialised last at topic file `59-starship` so all aliases and environment variables from the previous 58 files are already loaded. One `shared/starship.toml` covers all three platforms - changing it once updates the prompt on every device. Modules are enabled only for the languages covered by the topic files.\n\nEvery `git push` fans out to GitHub, GitLab and Codeberg simultaneously via multiple `remote.origin.pushurl` entries - no CI required. A global `pre-push` hook auto-registers new repos on both platforms on the first push so mirroring is never something to remember. A fifth platform, Gitea, receives five repos via GitHub Actions using SSH push because the Gitea community server's ELB blocks HTTPS push from non-AWS IPs. A `git()` wrapper deduplicates the repeated output lines produced by a multi-URL push using `awk '!seen[$0]++'`. `sync-meta` reads GitHub repo metadata and writes it to GitLab and Codeberg via their APIs so descriptions, topics and homepage URLs stay in sync.\n\nCI runs ShellCheck on every shell file and markdownlint on every markdown file on every push via GitHub Actions. An engineering journal of nine entries documents every significant decision: why the profile was split from one 275-line file to 59 topic files, the colour and accessibility choices, every alias conflict and how it was resolved, the nvm lazy-loading mechanism, the mirror architecture and why push URLs beat GitHub Actions for mirroring, how Windows PowerShell files were verified without a PowerShell interpreter using static analysis, why `doc/` was renamed to `journal/` and how the Starship prompt was added and configured.",
    technologies: ["Zsh", "Bash", "PowerShell", "Starship", "Shell", "GitHub Actions", "ShellCheck", "Git"],
    category: "other",
    featured: false,
    images: [
      "/images/projects/dotfiles/banner.png",
      "/images/projects/dotfiles/cmds.png",
    ],
    github: "https://github.com/zaccesss/dotfiles",
    date: "2026",
    highlights: [
      "59 numbered topic files per platform covering 30+ language toolchains, DevOps, cloud, hardware, media and productivity tools - loader is five lines",
      "Identical alias names on macOS (zsh), Linux (bash) and Windows (PowerShell 7) - same muscle memory on every machine, platform differences hidden inside the function body",
      "Accessibility-first colour scheme designed for monocular vision: cyan, magenta, green and yellow chosen to be distinguishable under deuteranopia and protanopia simulations",
      "Every git push fans out to GitHub, GitLab and Codeberg via push URLs; a global pre-push hook auto-registers new repos on both platforms on first push",
      "nvm lazy-loaded via stub functions - saves ~200ms on every shell start, paid once per session at first use",
      "One shared/starship.toml prompt config for all three platforms, initialised last at topic file 59 after all aliases and environment variables are loaded",
      "ShellCheck and markdownlint CI on every push via GitHub Actions",
      "Engineering journal of 9 entries documenting every major decision: the modular refactor, colour choices, alias conflicts, nvm lazy loading, mirror architecture, Windows static analysis and Starship setup",
    ],
  },
]
