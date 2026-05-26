# Social Profile Overhaul - Copy-Paste Draft
> Temp file - delete after all profiles are updated.
> Session: 2026-05-26. See NEXT-SESSION.md for progress tracker.

---

## LINKEDIN

### Headline (DONE)
```
Electronic Engineering & Computer Science Student at Aston University | Top 40 Black Heritage Undergraduate 2026 | Building at the intersection of hardware and software | Embedded Systems · AI/ML/Data · Full-Stack
```

---

### About (DONE - pasted in)
```
I am Isaac Adjei. Most people know me as Zac. I am an Electronic
Engineering and Computer Science student at Aston University,
Birmingham, working towards a First Class BEng. My goal is to build
at the intersection of intelligent software and efficient hardware,
creating systems that solve real problems for real people.

I grew up in Ghana, attending Adisadel College in Cape Coast, a
school guided by the motto "Vel Primus, Vel Cum Primis" (Either the
first, or with the first). It instilled in me resilience, discipline
and a standard of excellence that still shape everything I do. I was
an active member of the Robotics Club, Scripture Union, PENSA and
the Debate Society. I lost sight in my right eye at age two due to
retinoblastoma and have lived with monocular vision my entire life.
Rather than limiting me, it sharpened my focus and shaped a deep
commitment to accessible technology - building systems that genuinely
serve all users.

My late father was a mechanical and refrigeration engineer. During
school vacations I accompanied him on site and watched engineering
come to life in his hands. He always said: "Always strive to make
things better." Between 2019 and 2021 I worked as a Junior
Apprentice HVAC Technician in Accra, servicing and installing over
50 air conditioning units in the field. In 2022 I relocated to the
UK and studied at Stanmore College, graduating with D*DD in the
Pearson BTEC Level 3 National Extended Diploma in Engineering and
being recognised as Best and Most Hardworking Student in my cohort.

At Aston I serve as Student Representative at the Students' Union
and am a Student Member of the IET and a member of ESOC and the
Aston African-Caribbean Society. In 2026 I was shortlisted as a Top
40 Finalist for the Black Heritage Undergraduate of the Year Award,
run by TargetJobs and Sky. Beyond university I have gained experience
across sectors: internships at the Ghana High Commission London,
virtual engineering programmes with British Airways and Yunex
Traffic and between 2022 and 2025, while studying full-time, working
as a Waiter and Food Runner at Casa do Frango Piccadilly.

Technically I work across the full stack: bare-metal C and C++ on
microcontrollers, PCB design in Proteus 11, full-stack web with
Next.js and TypeScript and Python-based machine learning with
TensorFlow and PyTorch. I am also expanding into Java, cloud
computing, cyber security and game development.

Projects: PHAEMOS (predictive maintenance platform - FastAPI backend,
Isolation Forest anomaly detection, live Next.js dashboard), a
two-stage audio amplifier PCB built from scratch, a 4x4x4 NeoPixel
LED Cube with four animation modes, git-unlocked (a free open-source
Git course with over 200 structured topic files) and Zaccess (an
accessibility tool converting lecture slides into high-contrast
readable notes using OCR and text-to-speech).

Actively seeking internships and placements. Happy to connect.
```

Top 5 skills to pin to About:
1. Embedded Systems
2. Python
3. Next.js
4. Machine Learning
5. PCB Design

---

### Experience (TO DO - see NEXT-SESSION.md for exact changes needed)

**Student Representative** - remove last 2 bullets (see NEXT-SESSION.md)
**British Airways** - delete certificate text block, keep bullets only
**Yunex Traffic** - delete certificate text block, convert description to bullets
**Casa do Frango** - rename title to "Waiter / Food Runner / Bar Back"

Entries to ADD:

**Junior Apprentice HVAC Technician**
Company: Massive Refrigeration Services
Type: Part-time
Dates: Jul 2019 - Jul 2021
Location: Accra, Ghana | On-site
Description:
```
Part-time on-site apprenticeship assisting with air conditioning
servicing, installation and maintenance.

- Assisted in air conditioner servicing, installations and
  maintenance for over 50 units
- Used hand tools, drills and diagnostic meters under supervision
- Applied safety procedures and client etiquette during on-site
  technical visits
- Gained early hands-on technical experience in refrigeration and
  electrical systems
```
Skills: HVAC Systems, Electrical Safety, Fault Diagnosis, Hand Tools, Technical Maintenance

---

**Student Judge**
Company: targetjobs UK
Type: Volunteer
Dates: Feb 2026 (1 month)
Location: Remote
Description:
```
Selected as a Student Judge for the National Emerging Talent Awards
2026, evaluating employer submissions for Best Placement or
Internship Programme.

- Assessed national employer entries on programme design,
  recruitment strategy, inclusivity and student experience
- Provided detailed qualitative feedback and numerical scoring to
  support award decisions
- Recognised for timely, high-quality and thorough approach by
  targetjobs staff
```
Skills: Critical Thinking, Assessment, Report Writing, Communication

---

**Fundraising Volunteer**
Company: Cancer Research UK
Type: Volunteer
Dates: Feb 2026 - Mar 2026
Location: United Kingdom
Description:
```
Participated in the Cancer Research UK 10 Days of 5K Challenge to
support life-saving cancer research.

- Completed 10 x 5 km runs (more than 50 km total) across March
- Set up and managed an online fundraising page, contributing to a
  wider campaign that raised over £797,424.64, with an additional
  £159,224.14 through Gift Aid
- Raised funds through outreach and personal network engagement
- Promoted awareness of cancer research initiatives
```
Skills: Fundraising, Community Engagement, Resilience

---

### Education (DONE - all three entries updated)

---

### Projects

---

#### TWO-STAGE AUDIO AMPLIFIER (DONE - description and media added)

Title: Two-Stage Audio Amplifier
Dates: 2025 - 2026
Associated with: Aston University

Description (paste into LinkedIn):
```
Designed and built a two-stage audio amplifier. The brief required
a circuit capable of driving an 8 ohm speaker to a specified output
level from a single 9 V supply, with a frequency response covering
the full audible range. I chose a two-stage topology: a TL071 op-amp
configured as an inverting active band-pass filter in Stage 1,
followed by an OPA551 unity-gain voltage follower in Stage 2 to
supply the current the speaker demands without the first stage having
to work against a low-impedance load.

Stage 1 achieves a gain of 10.67 dB across a passband of 6.63 Hz
to 28.54 kHz, with the upper and lower -3 dB cutoff frequencies set
by the RC networks around the op-amp. Vcc/2 virtual ground biasing
centres the signal on 4.5 V so the single-supply circuit swings
symmetrically. A 2200 uF output coupling capacitor blocks the DC
bias from the speaker. Stage 2 uses the OPA551 because it can source
up to 200 mA continuously, enough to deliver 281 mW into 8 ohms.
Reverse polarity protection is handled by two 1N4007 diodes, an LED
power indicator and a power switch complete the auxiliary circuitry.

I worked through three build stages before committing to PCB.
Simulated in Proteus with ideal then real component models,
breadboarded on a dual-supply bench supply to verify gain and
bandwidth, then rebuilt on a single 9 V supply to confirm biasing
held stable under load. Only when both matched simulation did I move
to PCB layout. The final board is 65 x 40 mm, laid out in Proteus
11 with a continuous ground plane, 45-degree mitred track corners
and a DRC-clean design. Assembled output: 2.980 Vpp against a 3 Vpp
target - 0.67% error.

Tech: Proteus 11, TL071, OPA551, Analogue Design, PCB Layout.
```

Media 1 - Website:
- Link: `isaacadjei.me/projects/audio-amplifier`
- Title: `Two-Stage Audio Amplifier - Project Page`
- Description: `Full project breakdown including schematic, PCB layout, breadboard stages, oscilloscope measurements and frequency response. Built with TL071 and OPA551 in Proteus 11.`

Media 2 - GitHub:
- Link: `github.com/zaccesss/two-stage-audio-amplifier`
- Title: `Two-Stage Audio Amplifier - Source & Documentation`
- Description: `Full project repository including schematic files, PCB layout and build documentation.`

Images to upload (in order):
1. `pcb-angled.jpg` - Title: `PCB - Angled View` | Description: `Assembled and powered PCB showing the two-stage amplifier layout.`
2. `schematic.png` - Title: `Circuit Schematic` | Description: `Full schematic showing TL071 Stage 1 band-pass filter and OPA551 Stage 2 buffer with biasing and protection circuitry.`
3. `scope-stage1.png` - Title: `Oscilloscope - Stage 1 Output` | Description: `Oscilloscope trace showing Stage 1 TL071 band-pass filter output.`
4. `scope-stage2.png` - Title: `Oscilloscope - Stage 2 Output` | Description: `Oscilloscope trace showing Stage 2 OPA551 buffer output into 8 ohm load.`
5. `freq-response.png` - Title: `Frequency Response` | Description: `Measured frequency response showing 6.63 Hz to 28.54 kHz passband at -3 dB.`

---

#### 4X4X4 NEOPIXEL LED CUBE (TO DO - update existing entry)

Title: 4x4x4 NeoPixel LED Cube
Dates: 2025
Associated with: Aston University

Description:
```
Designed and built a fully functional 4x4x4 interactive LED display
combining hardware construction and embedded firmware. 64 WS2812B
NeoPixel LEDs hand-soldered onto a custom copper wire frame, built
layer by layer using a precision jig to maintain consistent spacing.

Each layer was continuity-tested before stacking. The wooden
enclosure was cut to fit with deliberate clearance for heat
dissipation, with front panel ports for the power button, mode
button and LDR window.

Firmware runs on an Arduino Uno (ATmega328P at 16 MHz) with a
non-blocking state machine using millis() to manage four animation
modes without blocking the input polling loop:
- Mode 0: colour wipe cascading through red, green and blue
- Mode 1: smooth RGB spectrum fade across all 64 LEDs simultaneously
- Mode 2: fire effect using a per-LED heat value algorithm mapping
  temperature to colour from deep red through orange to white
- Mode 3: rainbow gradient using a hue-wheel algorithm

An LDR on pin A0 reads ambient light at 10-bit resolution and maps
it inversely to LED brightness (20-255) so the cube dims
automatically in bright environments. Debounced buttons handle power
toggle and mode cycling with buzzer confirmation. A 1000 uF
capacitor on the 5V rail stabilises voltage during rapid switching.

Firmware streams live diagnostics over serial at 9600 baud: LDR
readings, calculated brightness and active pattern name.

Tech: Arduino Uno, C++, WS2812B, Adafruit_NeoPixel, LDR, ATmega328P.
```

Media 1 - Website:
- Link: `isaacadjei.me/projects/led-cube`
- Title: `4x4x4 NeoPixel LED Cube - Project Page`
- Description: `Full project breakdown including build process, firmware architecture, animation modes and hardware design.`

Media 2 - GitHub:
- Link: `github.com/zaccesss/neopixel-led-cube-project`
- Title: `4x4x4 NeoPixel LED Cube - Source Code`
- Description: `Full Arduino C++ firmware with non-blocking state machine, LDR brightness mapping, debounced buttons and four animation modes.`

Images to upload (in order):
1. `neopixel-main.jpg` - Title: `LED Cube - Hero Shot` | Description: `Fully assembled 4x4x4 NeoPixel LED cube lit up showing all 64 WS2812B LEDs.`
2. `cube-lit-2.jpeg` - Title: `LED Cube - Second Angle` | Description: `Alternative angle of the cube showing RGB lighting in action.`
3. `final-setup.jpeg` - Title: `Final Setup with Enclosure` | Description: `Complete build with custom wooden enclosure and front panel controls.`
4. `internals-1.jpeg` - Title: `Internal Wiring` | Description: `Internal view showing copper wire frame, data lines and power routing.`
5. `build-layer.jpeg` - Title: `Layer Construction` | Description: `Single layer of 16 WS2812B LEDs during the build process before stacking.`

---

#### PHAEMOS - SMART MAINTENANCE PLATFORM (TO DO)

Title: PHAEMOS - Smart Maintenance Platform
Dates: 2025 - Present
Associated with: Aston University

Description:
```
End-to-end IoT and predictive maintenance platform built from
hardware up. PHAEMOS (from Ancient Greek phaen - to reveal) collects
real sensor data from ESP32, Arduino and STM32 nodes, scores every
reading with a machine learning anomaly detection model and surfaces
everything on a live dashboard with alert management and automated
maintenance ticket workflow.

Hardware: DHT22 (temperature and humidity), MPU6050 (vibration and
acceleration), LDR (ambient light). ESP32 acts as Wi-Fi gateway
POSTing JSON telemetry every 5 seconds. STM32 samples MPU6050 at
100Hz and computes a short-window FFT to output peak vibration
frequency per second, giving the ML model a richer signal than raw
acceleration alone.

Backend: FastAPI (Python 3.11), PostgreSQL 15, Redis for caching and
queue management, JWT authentication with bcrypt. Every telemetry
POST validates the device key, stores the reading, evaluates alert
rules, scores through the ML model and responds in under 200ms.
Every action is written to an immutable audit log.

ML: scikit-learn Isolation Forest - unsupervised, no labelled fault
data needed. Scores above 0.7 trigger an alert and auto-generate a
maintenance ticket. Scores above 0.85 attach a diagnostic
recommendation string based on which sensor combination is elevated.

Frontend: Next.js 14, Recharts line charts polling every 5 seconds,
anomalous readings highlighted red in real time. Role-based access
(Admin, Technician, Viewer) enforced at API and UI level.

Stack: FastAPI, PostgreSQL, Redis, scikit-learn, Next.js 14,
TypeScript, Docker, ESP32, Arduino, STM32, Vercel, Render.
```

Media 1 - Website:
- Link: `isaacadjei.me/projects/phaemos`
- Title: `PHAEMOS - Project Page`
- Description: `Full breakdown of the PHAEMOS smart maintenance platform including system architecture, ML pipeline, hardware layer and live dashboard.`

Media 2 - GitHub:
- Link: `github.com/zaccesss/phaemos`
- Title: `PHAEMOS - Source Code`
- Description: `Full monorepo: FastAPI backend, Next.js frontend, scikit-learn ML pipeline, Docker Compose stack and ESP32/STM32 firmware.`

Media 3 - Live Demo:
- Link: `phaemos.com`
- Title: `PHAEMOS - Live Platform`
- Description: `Live deployment of the PHAEMOS smart maintenance platform.`

Images to upload (in order):
1. `dashboard.svg` - Title: `PHAEMOS Live Dashboard` | Description: `Live Next.js dashboard showing real-time sensor data, anomaly detection and device status cards.`
2. `pipeline.svg` - Title: `System Architecture` | Description: `Full system pipeline from ESP32/STM32 hardware nodes through FastAPI backend to Next.js dashboard.`
3. `main.svg` - Title: `PHAEMOS Overview` | Description: `Platform overview showing the end-to-end IoT and predictive maintenance workflow.`

---

#### GIT-UNLOCKED (TO DO)

Title: git-unlocked
Dates: 2026 - Present
Associated with: (none - personal)

Description:
```
Free, MIT-licensed, community-built Git course designed to take
anyone from never having heard of version control all the way to
using Git, GitHub, GitLab and every major platform confidently in
real teams.

v1.2.0 ships 217 topic files organised across 12 sections and 8
platforms: Git core, GitHub, GitLab, Bitbucket, Azure DevOps,
Gitea, Forgejo and Codeberg. Every file is tagged with difficulty
levels (beginner, intermediate, advanced) and OS labels (Windows,
Mac, Linux).

Three learning paths cover everything from account setup, repos and
branching through CI/CD pipelines, branch protection, security
features and CLI tooling. Advanced topics include rebase strategies,
bisect, worktrees, commit signing with GPG/SSH, monorepo patterns
and GitOps workflows.

IDE section: VS Code, JetBrains, Neovim, Cursor and Zed. Terminal
tools section: lazygit, git-delta, fzf, bat and tig. Curated
resource index of 120+ links rounds out the reference section.

Ships with GitHub Actions CI for automated markdownlint and link
validation on every push, a first-contribution sandbox (make your
first open source pull request in under 10 minutes),
CONTRIBUTING guide, CODE_OF_CONDUCT, SECURITY policy and CHANGELOG.

MIT licensed. Everything free, forever.
```

Media 1 - GitHub:
- Link: `github.com/zaccesss/git-unlocked`
- Title: `git-unlocked - Course Repository`
- Description: `217 topic files across 12 sections and 8 platforms. Free, MIT-licensed, community-built Git course for all levels and operating systems.`

Media 2 - Website:
- Link: `isaacadjei.me/projects/git-unlocked`
- Title: `git-unlocked - Project Page`
- Description: `Full project breakdown including course structure, platform coverage and learning paths.`

Images to upload:
1. `git_unlocked_banner.svg` - Title: `git-unlocked Banner` | Description: `Official banner for the git-unlocked free open-source Git course.`

---

#### AVR-ZAC (TO DO)

Title: avr-zac
Dates: 2026 - Present
Associated with: Aston University

Description:
```
Personal project to learn bare metal AVR C development, writing
directly to hardware registers with no framework or abstraction
layer. The ATmega644P runs at 20 MHz on a custom PCB designed by
Richard Reeves (lab technician at Aston University) with an external
crystal, LM317T voltage regulator and 10-way ISP headers breaking
out all 32 I/O pins. Programmed via Pololu USB AVR Programmer v2.1
(STK500v2).

7 projects progress from LED blink to a full 9-mode state machine:

00_fuse_test - correct fuse configuration for external crystal
01_blink - double blink on PB0 proving the toolchain
02_led_cycle - five LEDs sequenced with bit shifting on PORTB
03_button_polling - buzzer driven by reading PIND
04_interrupt_buzzer - hardware INT0 ISR replacing polling
05_state_machine_basic - four-mode machine with enum and debounce
06_state_machine - nine modes via volatile variable in INT0 ISR:
Chase, Blink All, Alternate, PWM Fade, Knight Rider, Binary Counter,
Random (ADC noise seeded), Reaction Game and Tetris Melody.

Ships with WORKFLOW.md, wiring reference, hardware notes, PCB
schematic, ATmega644P datasheet and 8 session lab notes covering
AVR C, bit shifting, interrupts, timers, PWM, UART and ADC.

Buildable with PlatformIO in VS Code or Microchip Studio 7.
```

Media 1 - GitHub:
- Link: `github.com/zaccesss/avr-zac`
- Title: `avr-zac - Source Code & Documentation`
- Description: `7 bare metal AVR C projects on ATmega644P. From LED blink to a 9-mode state machine. Full documentation including wiring reference, hardware notes and lab exercises.`

Media 2 - Website:
- Link: `isaacadjei.me/projects/avr-zac`
- Title: `avr-zac - Project Page`
- Description: `Full project breakdown covering hardware setup, project progression and firmware architecture.`

Images to upload (in order):
1. `chip.svg` - Title: `ATmega644P Custom PCB` | Description: `Custom ATmega644P PCB designed by Richard Reeves at Aston University with LM317T regulator and ISP headers.`
2. `statemachine.svg` - Title: `9-Mode State Machine` | Description: `State machine diagram for 06_state_machine: Chase, Blink All, Alternate, PWM Fade, Knight Rider, Binary Counter, Random, Reaction Game and Tetris Melody.`
3. `main.svg` - Title: `avr-zac Overview` | Description: `Overview of the avr-zac bare metal AVR C project suite.`

---

#### ASTONCV - FULL-STACK CV DATABASE (TO DO)

Title: AstonCV - Full-Stack CV Database
Dates: 2026
Associated with: Aston University

Description:
```
Full-stack CV database website built from scratch with no frameworks
anywhere in the stack - pure PHP 8.2, MySQL and CSS. Built for
DG1IAD Portfolio 3 at Aston University.

Anyone can browse and search all student CVs in a responsive card
grid, filter live by programming language, sort by name or view
count and download any CV as a professionally formatted PDF.
Registered users get a personal dashboard with a CV completeness
score, view statistics, profile picture upload and the ability to
update their CV and password.

11+ security measures implemented from scratch:
- XSS prevention with htmlspecialchars()
- SQL injection prevention via PDO prepared statements throughout
- bcrypt password hashing and verification
- Session-based authentication on every protected page
- Owner-only CV editing enforced server-side
- Server-side form validation before every database write
- CSRF tokens on all POST forms
- Brute-force lockout after five failed login attempts
- File upload validation with type whitelist and 2 MB size cap
- Honeypot field on contact form to block spam bots silently

Server-side PDF export via mPDF v8.2 installed with Composer.
Live filter, sort and search with no page reload using JavaScript.
Deployed live on Aston University's Apache server with a custom
Cloudflare CNAME redirect at astoncv.zacess.com.
```

Media 1 - Website:
- Link: `isaacadjei.me/projects/astoncv`
- Title: `AstonCV - Project Page`
- Description: `Full project breakdown covering security architecture, feature set and deployment.`

Media 2 - GitHub:
- Link: `github.com/zaccesss/astoncv`
- Title: `AstonCV - Source Code`
- Description: `Full source: pure PHP 8.2, MySQL, CSS. No frameworks. 11+ security measures including bcrypt, CSRF, brute-force lockout and PDO throughout.`

Media 3 - Live Demo:
- Link: `astoncv.zacess.com`
- Title: `AstonCV - Live Site`
- Description: `Live deployment of AstonCV on Aston University's Apache server with custom Cloudflare domain.`

Images to upload (in order):
1. `main.png` - Title: `AstonCV - Homepage` | Description: `Homepage showing the CV browse grid with live search, filter and sort functionality.`
2. `login.png` - Title: `AstonCV - Login Page` | Description: `Login page with brute-force lockout protection and CSRF token.`
3. `register.png` - Title: `AstonCV - Register Page` | Description: `Registration page with server-side validation and bcrypt password hashing.`

---

#### CNC MILLING MACHINE CONTROL SYSTEM (TO DO)

Title: CNC Milling Machine Control System
Dates: 2024
Associated with: Aston University

Description:
```
Safety-critical control system for a CNC milling machine built
around an Arduino ATmega328P. Central design constraint: the machine
must be incapable of operating unsafely regardless of how it is used.

8-state finite state machine: INIT, DOOR_OPEN, READY, RUNNING,
COOLDOWN and FAULT. Every transition is guarded by a full safety
check - no change permitted unless every relevant condition is
satisfied simultaneously. A door interlock open during RUNNING
immediately drives the state to FAULT, not back to READY. FAULT
can only exit after a deliberate manual reset sequence.

E-Stop is a mushroom-head button wired to hardware interrupt (INT0)
so the ATmega328P reacts in under a millisecond regardless of where
the main loop is executing. On activation: motor killed, fault flag
latched in EEPROM (power cycle cannot clear it), buzzer activated,
all input blocked until operator holds reset for two seconds.

The 10-second cutting cycle and 5-second post-cycle safety delay
both use millis() non-blocking timing so ISR and sensor polling
continue throughout and cannot miss an E-Stop or door event
mid-cycle.

A TL071 op-amp configured as a Schmitt trigger buffers reed switch
output, providing hysteresis against electrical noise from motor
switching transients. Hardware watchdog timer restarts the system
into FAULT if the main loop stalls for any reason.

Tech: Arduino, C++, ATmega328P, TL071, 16x2 LCD, Safety-Critical Design.
```

Media 1 - Website:
- Link: `isaacadjei.me/projects/cnc-control`
- Title: `CNC Control System - Project Page`
- Description: `Full breakdown of the safety-critical CNC milling machine control system including state machine architecture, E-Stop design and sensor conditioning.`

Images to upload (in order):
1. `main.png` - Title: `CNC Control System` | Description: `Assembled CNC milling machine control system with Arduino, LCD display and front panel controls.`
2. `safety-test.png` - Title: `Safety Testing` | Description: `E-Stop and door interlock safety testing on the CNC control system.`
3. `lcd.png` - Title: `LCD Status Display` | Description: `16x2 LCD showing live machine state and safety countdown.`

---

#### GOODS LIFT CONTROL SYSTEM (TO DO)

Title: Goods Lift Control System
Dates: 2025
Associated with: Aston University

Description:
```
Microcontroller-based goods lift controller for multi-floor
navigation with a comprehensive safety architecture.

Floor tracking uses a software counter incremented or decremented
on each limit switch trigger, with a homing sequence on startup
that drives the cabin to the bottom limit before accepting any
requests - giving the system a confirmed reference position every
power cycle.

An array-based request queue stores pending floor calls and
dispatches them using a nearest-floor-in-current-direction priority
algorithm, the same approach used in real lift controllers. Duplicate
calls are merged and unanswered requests expire after a configurable
timeout.

Motor control uses an H-bridge driver with PWM soft-start and
regenerative braking to reduce mechanical shock and gearbox wear.
Door position monitored by IR or reed switch sensors - firmware will
not issue a motor drive command unless both doors are confirmed
closed. Any door opening mid-travel triggers an immediate motor cut.

E-Stop wired to a hardware interrupt shuts down the motor in under
a millisecond and places the system in EMERGENCY state, blocking all
inputs until an operator manually resets. Load cell reading above a
configurable threshold blocks movement with OVERLOAD on the display.

All hold times use millis() non-blocking timing so sensor polling
and interrupt handlers remain active throughout. 16x2 LCD shows
current floor, target floor, direction and a live status string.

Tech: Arduino, C++, H-bridge, PWM, reed switches, 16x2 LCD.
```

Media 1 - Website:
- Link: `isaacadjei.me/projects/goods-lift`
- Title: `Goods Lift Control System - Project Page`
- Description: `Full breakdown of the goods lift control system including dispatch queue algorithm, safety architecture and motor control.`

Images to upload (in order):
1. `main.png` - Title: `Goods Lift Control System` | Description: `Assembled goods lift controller with Arduino, motor driver and LCD display.`
2. `breadboard.png` - Title: `Breadboard Prototype` | Description: `Breadboard prototype of the goods lift control system during development.`
3. `lcd.png` - Title: `LCD Status Display` | Description: `16x2 LCD showing current floor, target floor, direction and live status.`

---

#### CAD ENGINEERING DESIGN PORTFOLIO (TO DO)

Title: CAD Engineering Design Portfolio
Dates: 2024 - 2025
Associated with: Aston University

Description:
```
Portfolio of three computer-aided design projects in AutoCAD
spanning precision component drawing, mechanical assembly design
and consumer product design. All drawings comply with BS 8888
(Technical Product Documentation), ISO 128 and ASME Y14.5 (GD&T).

Project 1 - Precision Component: complete manufacturing
documentation including three-view orthographic projections in
first-angle projection, full dimensioning, bilateral and unilateral
tolerances per ISO 286, geometric tolerancing (flatness,
perpendicularity, concentricity) in feature control frames, surface
finish symbols with Ra values and a 3D solid model with realistic
material assignments and three-point lighting.

Project 2 - Mechanical Assembly: full design cycle from functional
and environmental specification through detailed drawings. Includes
GD&T datum reference frames, form orientation and location
tolerances, material selection rationale, section views, exploded
assembly drawing with balloon callouts and a structured BOM with
COTS and custom part identification.

Project 3 - Consumer Product (Hairdryer): full product design
covering injection moulding considerations (draft angles, uniform
wall thickness, parting line positioning, snap-fit bosses), internal
component layout with vibration isolation and thermal management,
IEC 60335 safety compliance, exploded view documentation with
hierarchical part numbering and step-by-step assembly instructions.
```

Media 1 - Website:
- Link: `isaacadjei.me/projects/cad-portfolio`
- Title: `CAD Engineering Design Portfolio - Project Page`
- Description: `Three AutoCAD projects covering precision component drawing, mechanical assembly design and consumer product design to BS 8888 standard.`

Images to upload (in order):
1. `main.png` - Title: `CAD Portfolio Overview` | Description: `Overview of three CAD engineering design projects completed in AutoCAD.`
2. `3d-model.png` - Title: `3D Solid Model` | Description: `3D solid model with realistic material assignments and three-point lighting.`
3. `assembly.png` - Title: `Assembly Drawing` | Description: `Exploded assembly drawing with balloon callouts and structured BOM.`

---

#### BUSINESS WEBSITE - ZACESS.COM (TO DO)

Title: zacess.com - Terminal Portfolio
Dates: 2024
Associated with: (none - personal)

Description:
```
Terminal-style landing page for zacess.com, built as a Next.js 14
App Router application with TypeScript and Tailwind CSS. Behaves
like a genuine CLI session rather than a styled webpage.

A ZacessOS boot sequence plays on load with staggered delays, then
the prompt activates with a blinking block cursor. The terminal
supports command history via up/down arrow keys, tab autocomplete
(single match completes immediately, multiple matches lists all
options), line-by-line output with a 20ms per-line delay and a
suggest mode that fires a pre-filled mailto link.

Navigation commands (whoiszac, about, projects, experience, skills,
blog, contact, links) open the corresponding pages on isaacadjei.me
in new tabs. Local commands include cv (downloads PDF), collaborate
(opens mail client with pre-filled subject), status (shows build
state) and clear (preserves boot lines). Three hidden easter egg
commands reward curious visitors.

A ZenQuotes daily motivation quote is fetched via a Next.js
server-side API route that proxies the public API to avoid CORS,
refreshing every 30 minutes. Mac-style window controls (close,
minimise, maximise, new tab) are fully functional.

The terminal uses a three-layer colour scheme: cyan prompt, green
commands, amber output. Deployed on Vercel with Cloudflare DNS
routing zacess.com and www.zacess.com.

Tech: Next.js 14, TypeScript, Tailwind CSS, Vercel, Cloudflare.
```

Media 1 - Live Site:
- Link: `zacess.com`
- Title: `zacess.com - Live Terminal`
- Description: `Live terminal-style portfolio. Type 'help' to see all commands.`

Media 2 - GitHub:
- Link: `github.com/zaccesss/zacess-pages`
- Title: `zacess.com - Source Code`
- Description: `Next.js 14 App Router terminal portfolio with command history, tab autocomplete, ZacessOS boot sequence and ZenQuotes integration.`

Media 3 - Website:
- Link: `isaacadjei.me/projects/zacess-pages`
- Title: `zacess.com - Project Page`
- Description: `Full breakdown of the zacess.com terminal portfolio including architecture and feature list.`

Images to upload (in order):
1. `main.png` - Title: `zacess.com Terminal` | Description: `ZacessOS terminal interface showing the boot sequence and blinking block cursor.`
2. `terminal.png` - Title: `Terminal in Use` | Description: `Terminal with active commands and output showing cyan prompt, green commands and amber output.`

---

### Skills Section (TO DO)
Add all skills from the draft - see skills list in previous SOCIAL-PROFILES-DRAFT sections.

### Featured Section (TO DO)
1. `isaacadjei.me` - Title: `isaacadjei.me - Personal Portfolio` | Description: `My full portfolio covering projects, experience, skills and blog.`
2. `phaemos.com` - Title: `PHAEMOS - Smart Maintenance Platform` | Description: `End-to-end IoT predictive maintenance platform I built from hardware up.`
3. `github.com/zaccesss/git-unlocked` - Title: `git-unlocked - Free Git Course` | Description: `Free MIT-licensed Git course with 217 topic files across 12 sections and 8 platforms.`
4. `github.com/zaccesss/avr-zac` - Title: `avr-zac - Bare Metal AVR C` | Description: `Bare metal AVR C projects on ATmega644P from LED blink to a 9-mode state machine.`
5. `github.com/zaccesss/two-stage-audio-amplifier` - Title: `Two-Stage Audio Amplifier` | Description: `TL071 + OPA551 two-stage audio amplifier PCB designed and built from scratch.`

### Awards & Certifications (TO DO)
1. Title: `Top 40 Finalist - Black Heritage Undergraduate of the Year Award 2026` | Issuer: TargetJobs & Sky | Date: Mar 2026 | Description: `Selected as one of the Top 40 finalists nationwide. Recognised for leadership, impact and potential. Progressed through application and video interview stages and was invited to the finalist Celebration Day at Sky's Osterley campus.`
2. Title: `Best and Most Hardworking Student` | Issuer: Stanmore College | Date: Jun 2024 | Description: `Recognised as the best and most hardworking student in the BTEC Level 3 Engineering cohort, graduating with D*DD (Distinction*, Distinction, Distinction).`

---

## GITHUB (TO DO)

Bio:
```
EE & CS student @AstonUniversity | Hardware x Software | Embedded C, Next.js, Python, ML | Building PHAEMOS & avr-zac | isaacadjei.me
```

Pinned repos (in this order):
1. phaemos
2. avr-zac
3. git-unlocked
4. two-stage-audio-amplifier
5. neopixel-led-cube-project
6. astoncv

---

## OTHER PROFILES (TO DO)

### Beehiiv
- Display name: Isaac Adjei
- Bio: match LinkedIn About short version
- Link: isaacadjei.me

### ORCID (if active)
- Name: Isaac Adjei
- Affiliation: Aston University, Birmingham
- Field: Electronic Engineering and Computer Science

---
