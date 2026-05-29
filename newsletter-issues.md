# Engineering and Tech by Zac — Newsletter Issues (000–010)

> DELETE THIS FILE when done. This is a working draft only.

## Beehiiv Template Recommendation

Use **Classic Editorial**. It is clean, text-forward and professional. It works well for long-form engineering content without distracting from the writing. The layout gives your words room to breathe and reads well on both desktop and mobile. Avoid the Template library options that rely heavily on image grids — your content is writing-led, not visual-led.

---

## Newsletter design notes

- Keep your accent colour consistent with your portfolio (dark background, clean white text or vice versa)
- Use a simple header with your name and "Engineering and Tech by Zac"
- Footer should include: unsubscribe link, isaacadjei.me and your GitHub (github.com/zaccesss)
- Sign every issue with just "Zac" — no sign-off phrase, no emoji, just the name
- Subject lines use sentence case throughout — no ALL CAPS, no excessive punctuation

---
---

## Issue 000

**Subject:** Issue 000: Hello. This is what you just signed up for.

**Preview text:** Engineering notes from someone actually building things. Here is what to expect.

**Tags:** welcome, introduction, engineering, newsletter

**Description:** The zeroth issue. Who writes this newsletter, what it covers and what you can expect from every issue that follows.

**Image suggestion:** None needed. Welcome issues work better without a project image. If you want something visual, use your portfolio headshot or the Phaemos main SVG at `/public/images/projects/phaemos/main.svg`.

---

Hello and welcome.

If you found this newsletter, you probably care about engineering. Maybe you are studying it. Maybe you are building something on the side. Maybe you are at the point where tutorials have stopped being enough and you want to read about someone actually working through the harder stuff.

Whatever brought you here, I am glad you are reading.

My name is Zac. I am an Electronic Engineering and Computer Science student at Aston University in Birmingham. I build at the intersection of hardware and software: embedded firmware, PCB design, IoT systems and full-stack platforms. I have one working eye, grew up in Ghana and came to engineering through a path that was not straightforward. None of that stopped me. Some of it shaped what I build.

**What you will get.**

Honest write-ups on what I am building and what I am learning. The interesting problems, not just the finished results. What goes wrong, what I had to read to fix it and what the experience taught me. Occasionally something personal. No filler. No recycled takes. No content written for an algorithm.

I write about hardware: PCB design, embedded systems, bare metal firmware and what datasheets actually tell you when you read them properly. I write about software: full-stack development, APIs, machine learning pipelines and how systems fit together across layers. I write about projects: everything I am building, in honest detail. And occasionally I write about the career and learning side of engineering, what studying it actually looks like and what is worth knowing before you start.

**What is coming.**

The next issue is about why I build. Not the technical reasons but the real ones. That is a good place to start.

After that: a 4x4x4 LED cube with 64 hand-soldered LEDs, a free Git course with 217 files and no paywall, bare metal C against hardware registers with no framework in the way, and a predictive maintenance platform built from firmware to a live machine learning dashboard.

If any of that sounds like something worth reading, stick around.

Zac

---
---

## Issue 001

**Subject:** Issue 001: Engineering was not something I planned. Here is what drives it now.

**Preview text:** The real reason I build. Plus the two projects I am actively working on right now.

**Tags:** engineering, motivation, personal, phaemos, avr, hardware, software

**Description:** Why I build at the intersection of hardware and software, what shaped that decision and what I am actively working on right now.

**Image suggestion:** Use the Phaemos pipeline SVG at `/public/images/projects/phaemos/pipeline.svg` or the AVR state machine diagram at `/public/images/projects/avr-zac/statemachine.svg`. Both are relevant to the two projects mentioned in the issue.

---

Engineering was not something I planned. It happened gradually, shaped by a father who built things with his hands, a school that demanded excellence and a series of decisions I had to make on my own when the path was not obvious.

My father was a mechanical and refrigeration engineer. During school holidays I would go to work with him and watch him diagnose faults in equipment that other people had given up on. He was calm, methodical and deliberate. He had a phrase he returned to often: always strive to make things better. I did not fully understand what that meant when I was young. I do now. In 2021 I lost him. Losing him was one of the hardest things I have been through. It was also a turning point. Engineering became the way I carry that mindset forward.

**Why hardware and software together.**

I build at the intersection of hardware and software because neither alone is enough.

A system that works in code but fails on real hardware is not finished. A circuit that cannot be controlled intelligently is limited. The interesting problems live where the two meet. The moment a sensor reading crosses a threshold and triggers an alert on a live dashboard. The moment a firmware state machine responds to a physical button press in under a millisecond. The moment a signal propagates from a PCB through a data pipeline into a machine learning model and back to a human who can act on it.

That is the class of problem I want to work on. It requires understanding both sides well enough to reason about what happens at the boundary.

**What I am building right now.**

Phaemos is a full-stack predictive maintenance platform. It collects real-time sensor data from four embedded hardware nodes, runs every reading through an Isolation Forest anomaly detection model and surfaces results on a live Next.js dashboard with automated maintenance ticket workflows. The hardware layer spans an ESP32 primary gateway with 11 sensors, an STM32 Black Pill running FFT vibration analysis at 100 Hz in bare HAL C, an Arduino Nano as a secondary sensor node and a Raspberry Pi Pico 2W running MicroPython independently over Wi-Fi. The FastAPI backend processes every telemetry POST in under 200 ms. The ML model is unsupervised: it learns the normal operating envelope and scores every reading from 0 to 1. Scores above 0.7 trigger an alert and auto-generate a maintenance ticket.

The name comes from Ancient Greek. Phaen means to reveal. The tagline is: reveal before failure.

avr-zac is a deliberately low-level project. I am writing bare metal C directly against hardware registers on an ATmega644P microcontroller with no framework between me and the silicon. No Arduino. No HAL. Just the datasheet and the code. The current milestone is a nine-mode state machine cycling on each button press: Chase, Blink All, Alternate, PWM Fade, Knight Rider, Binary Counter, Random seeded from ADC noise, a Reaction Game and a Tetris Melody with buzzer and LED synchronisation. Each mode was built with a full understanding of every register involved before the code was written.

Both are ongoing. That is the point. Engineering is not a destination.

**What this newsletter is.**

Honest write-ups on what I am building, what I am learning and what actually goes wrong. No filler. No clickbait. Just engineering and tech from someone living it.

What are you building right now? Hit reply and let me know. I read every response.

Zac

---
---

## Issue 002

**Subject:** Issue 002: My story starts with an eye operation at age two

**Preview text:** From Ghana to Birmingham, via a lot of starting over.

**Tags:** personal, journey, ghana, disability, engineering, career

**Description:** The full story of how I got to where I am: monocular vision, losing my father, Adisadel College, moving to the UK and building tools for my own constraints.

**Image suggestion:** No project image for this one. If you have a personal photo that represents the journey (at university, in a lab, at Adisadel), use that. Otherwise leave it image-free — the writing carries this issue.

---

Before I get into projects and technical write-ups, I want to share where I came from. Context matters, and mine is unusual.

**I grew up in Ghana.**

At age two, I lost the sight in my right eye after surgery for suspected retinoblastoma, a rare childhood eye cancer. I missed years of early schooling because of the surgeries and recovery. When I eventually returned, I was around six or seven while many of my classmates were already ahead. I had to catch up without anyone acknowledging how significant that gap was.

Growing up monocular, I dreamed of becoming a pilot. That dream was taken from me when I learned that monocular vision closes that door. I was young when I found out and it stung. But it was the first time I had to redirect a dream rather than abandon it. It would not be the last.

I also faced bullying growing up. There were periods that were genuinely dark. I struggled with confidence and cared too much about what other people thought. What I learned, slowly and through repetition, is that the opinions of people who want to diminish you are not data. They are noise. Consistency beats cruelty every time.

**My father.**

My father was a mechanical and refrigeration engineer. During school holidays I would go to work with him and watch him fix things other people had given up on. He was calm, methodical and deliberate. He had a phrase: always strive to make things better.

In 2021, I lost him. It was one of the hardest moments of my life. It was also a turning point. I decided I wanted to carry his problem-solving mindset forward, not as sentiment but as practice. Engineering felt like honouring something he left behind.

**Adisadel College.**

I spent my senior high school years at Adisadel College in Cape Coast, one of the most prestigious schools in Ghana, founded in 1910. The motto is Vel Primus, Vel Cum Primis: either the first, or with the first. That is not decorative. It is a standard the school actually holds you to.

I served as Dispensary Prefect, House Secretary and Vice President of my church group. I was active in the Robotics Club, Scripture Union, PENSA and the Debate Society. Adisadel taught me what real accountability looks like and gave me a standard for what excellence means that I carry into every project I start.

**Moving to the UK.**

In April 2022, my mother was posted to the UK for work and I came with her. Starting again in a new country and a completely new education system was harder than I expected. My academic background was in General Arts. I had no formal technical foundation.

I enrolled at Stanmore College in London on a business course. After two months I knew it was wrong. I approached the college, sat the necessary assessments to demonstrate my aptitude and transferred onto the engineering programme, joining two months after it had already started.

I caught up. I graduated D*DD: Distinction*, Distinction, Distinction in the Pearson BTEC Level 3 National Extended Diploma in Engineering. I was named Best and Most Hardworking Student at Stanmore College. Every day at that college I thought about my father.

**Building for my own constraints.**

Being partially sighted shaped what I build. At university, reading lecture slides and dense textbook pages was often genuinely difficult. So I built something to fix it.

The project is called Zaccess. It photographs lecture material, extracts the text with OCR and converts it into high-contrast, large-text notes with text-to-speech support. I built it for myself. Then I shared it with another visually impaired student and he told me it saved him hours every week.

That moment changed how I think about my constraints. The limitations I live with are not separate from the engineer I am becoming. They are part of why I build what I build.

**Where I am now.**

I am studying BEng Electronic Engineering and Computer Science at Aston University, working towards a First Class degree. I am a Student Representative at the Aston Students Union, a Student Member of the IET and active in the Aston Ghana Society and Computing Society. In 2026 I was named a Top 40 Finalist for the Black Heritage Undergraduate of the Year Award.

None of it is finished. That is the point. My father said it best: always strive to make things better.

Zac

---
---

## Issue 003

**Subject:** Issue 003: 64 LEDs, 200 solder joints and one algorithm that simulates fire

**Preview text:** What a university assignment turned into, and what I learned the hard way.

**Tags:** hardware, led, arduino, embedded, project, electronics

**Description:** How I built a 4x4x4 NeoPixel LED cube with 64 hand-soldered WS2812B LEDs, adaptive ambient brightness and a fire effect algorithm that runs in under 30 lines of code.

**Image suggestion:** Use `/public/images/projects/led-cube/neopixel-main.jpg` as the header image. It shows the finished cube with an active animation and is the strongest visual from this project. You could also upload `/public/images/projects/led-cube/build-layer.jpeg` to show the construction process mid-issue.

---

This issue is the first proper technical write-up. I am going to tell you about the NeoPixel LED cube: how I built it, what nearly went wrong and the fire effect algorithm that was the most satisfying thing I have coded.

**What it is.**

The cube is a 4x4x4 matrix of 64 WS2812B LEDs, all hand-soldered onto a copper wire frame, controlled by an Arduino Uno. It has four animation modes, ambient brightness that adapts automatically to the room and physical button controls. No kit. No pre-made frame. Built from scratch as a university project that became something I am genuinely proud of.

**The hardware problem nobody warned me about.**

Before I could write a single line of firmware, I had to physically construct a three-dimensional wire frame and solder 64 LEDs onto it with every LED facing outward. That sounds manageable until you are on your fifteenth joint and the frame starts to twist.

The solution was a jig: a wooden block with holes drilled at precise intervals. Each LED sits in a hole, held in position while you solder. Each layer was tested for continuity before it was stacked onto the previous one. A cold joint in the middle of a chain is extremely difficult to find because everything after the fault just goes dark.

Testing each layer individually before stacking saved me hours of rework. That discipline, checking thoroughly before committing, applies well beyond soldering.

**Power budgeting is not optional.**

Each WS2812B LED draws up to 60 mA at full white brightness. Multiply that by 64 and you are looking at 3.84 A. A USB port cannot supply that, and running close to that limit causes voltage spikes that corrupt the LED data line and produce random colour flashes mid-animation.

Two things fixed this. First, I capped the maximum brightness in software so the cube never runs all 64 LEDs at full white simultaneously. Second, I added a 1000 microfarad electrolytic capacitor across the 5V power rail. That capacitor does not appear in most beginner tutorials. It matters the moment you scale beyond a handful of LEDs. Without it, the voltage spikes from rapid switching corrupt the WS2812B's single-wire data protocol.

**The fire effect.**

This was the most technically interesting animation to build. It uses a two-dimensional heat array representing the temperature at each LED position in the matrix. Every frame, heat propagates upward from the bottom layer with random variation and decays at a configurable rate. The heat value maps to a colour: deep red at low heat, orange in the mid range and bright yellow-white at maximum.

The result is a convincing upward flame in under 30 lines of C++. The algorithm is not complicated but getting the decay rate and propagation speed right required several iterations. Too fast and it looks like static. Too slow and it looks like a lava lamp. The right parameters produce something that genuinely looks like fire.

**Adaptive brightness with the LDR.**

A light-dependent resistor on an analogue pin reads ambient light in real time. The raw 10-bit ADC reading maps inversely to LED brightness. In a bright room the cube runs at higher brightness. In a dark room it dims automatically to avoid being uncomfortable. This runs in a non-blocking loop using millis() so the brightness updates continuously without interrupting the animation.

**What the timing constraint taught me.**

The WS2812B data protocol uses specific pulse widths measured in hundreds of nanoseconds. On an Arduino running at 16 MHz this is reliable, but any interrupt that fires mid-frame corrupts the entire frame. Disabling interrupts during LED updates was necessary for stable output. That is a detail you only find by reading the datasheet rather than following a tutorial.

The full source code for this project is available on GitHub: github.com/zaccesss/neopixel-led-cube-project

**What I learned.**

Hand-soldering 64 LEDs into a 3D matrix is significantly harder than building on a flat breadboard. Spatial reasoning matters. Planning the build sequence before you start matters enormously. And flux makes every joint better.

Building this taught me to think carefully about power before writing firmware, to test incrementally rather than all at once and to read documentation rather than rely on examples. Those habits apply to every project I have worked on since.

Next issue: I built a free Git course with 217 files and no paywall. Here is why.

Zac

---
---

## Issue 004

**Subject:** Issue 004: I wrote 217 files about Git and gave them all away for free

**Preview text:** Because the existing resources were too shallow, paywalled or just plain wrong.

**Tags:** git, open source, teaching, github, version control, learning

**Description:** The motivation behind git-unlocked, what the course actually contains and what writing 217 files about version control taught me about how engineering knowledge travels.

**Image suggestion:** Use `/public/images/projects/git-unlocked/git_unlocked_banner.svg` as the header image. It is the official banner for the project and will look clean on a dark or light Beehiiv background.

---

Most Git tutorials cover init, add, commit and push, then stop. They leave out branches, rebasing, conflict resolution, platform differences, real-world workflows and everything that actually matters when you join a team or contribute to open source for the first time.

The more advanced resources are often paywalled. Platform-specific ones cover GitHub and ignore everything else. None of them cover what happens when things go wrong.

I was frustrated. So I built what I wished had existed.

**What git-unlocked actually contains.**

git-unlocked is a free, open-source Git and version control course. v1.2.0 ships 217 files across 12 sections covering eight platforms. MIT licensed. No paywall. No account required. No upsell.

The course covers Git core from init to internals, with every command explained at the level of what it actually does, not just what to type. Full platform coverage includes GitHub, GitLab, Bitbucket, Azure DevOps, Gitea, Forgejo and Codeberg. The IDE section covers VS Code, JetBrains, Neovim, Cursor and Zed. The terminal tools section covers lazygit, git-delta, fzf and more.

The real-world section is the part I am most proud of. It covers GitOps with ArgoCD and Flux, monorepo patterns using Nx and Turborepo, disaster recovery from force push accidents and supply chain security including gitleaks, TruffleHog, commit signing and SLSA. A curated resource index collects 120 books, videos, tools and communities with recommended learning paths by level.

Every file shows commands on Windows, Mac and Linux side by side. Nothing is assumed. Nothing is skipped.

The repo also ships a first-contribution sandbox that lets anyone make their first open source pull request in under ten minutes, a full CHANGELOG, a CONTRIBUTING guide, a HALL_OF_FAME for contributors, a CODE_OF_CONDUCT and a SECURITY policy. GitHub Actions CI runs automated markdownlint and link validation on every push.

The full project is at: github.com/zaccesss/git-unlocked

**What writing it taught me.**

Teaching is one of the most effective ways to learn. Writing 217 files about Git forced me to understand everything at a depth I would not have reached by just using it.

When you write a glossary definition for every Git term, you quickly discover which concepts you only half understand. When you try to explain a rebase clearly enough for a complete beginner to follow without getting lost, you find out whether you actually understand it yourself. The exercise of articulating something precisely enough for someone else to act on it is different from knowing how to do it yourself. Better, in some ways.

The CHANGELOG tells the story of how the project grew. Reading from v0.1.0 to v1.2.0 shows how a course outline became a reference. It also demonstrates that good documentation is not written once. It is maintained.

**Why free and open source.**

Because the cost of knowledge should not be access.

I was a student who needed to understand version control properly and found the landscape fragmented, shallow and paywalled. Open sourcing under MIT means anyone can take it, fork it and build on it. A contributor from another country can add platform coverage I do not have. A lecturer can use it in a class. A bootcamp can point students to it without a licensing conversation.

None of that requires my involvement or anyone's money.

There is more to come: a GitHub Pages site at zaccesss.github.io/git-unlocked, interactive HTML quiz pages with instant answer checking, animated SVG diagrams for key Git concepts and an accessibility review.

Next issue: bare metal AVR programming. No frameworks, no Arduino library and no shortcuts. Just me, a datasheet and an ATmega644P.

Zac

---
---

## Issue 005

**Subject:** Issue 005: No frameworks. No libraries. Just me, a datasheet and a microcontroller.

**Preview text:** What happens when you refuse to use Arduino and write directly to the hardware.

**Tags:** embedded, avr, c, microcontroller, hardware, bare metal, firmware

**Description:** Why I chose to write bare metal C directly against hardware registers on an ATmega644P, what I built and what reading a datasheet actually teaches you that tutorials never do.

**Image suggestion:** Use `/public/images/projects/avr-zac/statemachine.svg` as the main image. It visualises the nine-mode state machine which is the centrepiece of this issue. Alternatively use `/public/images/atmelavr.png` for a visual of the AVR architecture.

---

Most embedded tutorials start with a framework. Arduino, HAL, CubeMX. They abstract away the hardware so you can get an LED blinking in five minutes without understanding a single register.

That is fine for prototyping. It is not fine for learning.

This project was a deliberate choice to do the opposite. I wanted to write directly to hardware registers on an ATmega644P microcontroller with nothing in between. To understand not just what the code does but what the silicon does when the code runs.

**The hardware.**

The ATmega644P is a DIP-40 AVR microcontroller running at 20 MHz on an external crystal. The PCB was designed by Richard Reeves, a lab technician at Aston University, who also provided components and guidance throughout this project. The board includes an LM317T voltage regulator and ten-way headers breaking out all 32 I/O pins. A Pololu USB AVR Programmer v2.1 handles flashing via STK500v2. The breadboard components were five LEDs, one button and one active buzzer.

**Why bare metal matters.**

When you call digitalWrite() in Arduino, the library writes to the correct DDRx and PORTx registers on your behalf. You get the result without the understanding. When something breaks, you have no mental model to debug from because you never built one.

Bare metal forces you to read the datasheet. Every single thing an ATmega644P can do is documented there. You learn that DDRB controls the data direction of Port B, that setting a bit high makes that pin an output and that PORTB controls the output state. You learn how the interrupt control registers work, why sei() must be called after configuring EICRA and EIMSK and not before, and what happens in silicon when an interrupt fires. That knowledge transfers to every microcontroller you ever touch because every MCU has these registers, just with different names.

**The build progression.**

I worked through structured steps rather than jumping to complexity:

Fuse configuration and restoration. Understanding fuse bits is essential before anything else — wrong fuse settings can leave the chip in a state that looks broken.

Double blink on PB0 using DDRB, PORTB and _delay_ms. Proving the toolchain and the most basic I/O.

Five LEDs cycling sequentially using bit shifting on PORTB. Learning data direction and output simultaneously.

Button driving a buzzer via polling using PIND. Reading input state directly.

Button driving a buzzer via interrupt using ISR, EICRA and EIMSK. Replacing polling with hardware interrupt handling.

Four-mode state machine using enum, ISR and software debounce. Combining everything above into structured logic.

Nine-mode state machine: the final build.

Each step added exactly one new concept, understood at register level before moving on.

**The nine-mode state machine.**

The final project cycles through nine modes on each button press. A volatile variable updated inside an INT0 interrupt service routine tracks the current mode. Software debounce inside the ISR prevents multiple triggers from a single physical press.

The modes are: Chase, Blink All, Alternate, PWM Fade, Knight Rider, Binary Counter, Random, Reaction Game and Tetris Melody.

The Tetris melody was the most satisfying to build. The Korobeiniki theme has 30 notes across two phrases. Each note requires a specific frequency and duration. The buzzer is driven by toggling a GPIO pin at the note frequency using timer overflow interrupts, with the LED pattern updating between notes to sync visually. Getting the timing accurate required measuring against a reference recording and adjusting the tempo constant until it matched. The result is recognisable from several metres away.

**One insight worth keeping.**

ADC noise as a random seed: a floating, unconnected ADC input picks up electrical noise from the environment. That noise is unpredictable enough to seed a pseudo-random number generator. I read the ADC from an unused pin on startup, use the least significant bits as the seed and get different random patterns every power cycle with no RTC, no EEPROM and no external component. It is a small thing but it is the kind of detail you only discover by reading the datasheet properly.

The full project is on GitHub: github.com/zaccesss/avr-zac

The project is ongoing. Future sessions will add UART transmission, ADC reception and more advanced timer patterns.

Next issue: Phaemos. Four hardware nodes, an ML pipeline and a live dashboard. The biggest project I am building.

Zac

---
---

## Issue 006

**Subject:** Issue 006: The machine does not know it is about to break. Mine does.

**Preview text:** Four hardware nodes, a machine learning pipeline and a live dashboard, built from scratch.

**Tags:** iot, embedded, machine learning, fastapi, phaemos, predictive maintenance, esp32, stm32

**Description:** A detailed look at Phaemos, a full-stack predictive maintenance platform spanning embedded firmware, a FastAPI backend, Isolation Forest anomaly detection and a live Next.js dashboard.

**Image suggestion:** Use `/public/images/projects/phaemos/dashboard.svg` as the header image showing the live dashboard. You can also include `/public/images/projects/phaemos/pipeline.svg` mid-issue to illustrate the data pipeline from hardware to ML model to alert.

---

Machines fail. Not suddenly in most cases, but gradually and silently. A temperature that drifts upward over days. A vibration frequency that shifts as a bearing wears. A current draw that increases as a motor degrades. None of these are catastrophic on their own. Together, with enough data and the right model, they tell you what is coming before it arrives.

Phaemos exists to reveal what machines cannot say about themselves.

The name comes from Ancient Greek. Phaen means to reveal. Mos means order or system. The tagline is: reveal before failure.

**Why predictive maintenance.**

Industrial equipment fails. The question is whether you find out before or after it happens.

Reactive maintenance waits for failure then repairs. Preventive maintenance follows a fixed schedule, replacing parts whether or not they actually need replacing. Predictive maintenance uses real sensor data to intervene only when something is genuinely wrong.

The third approach is more efficient, less expensive and far more interesting to build. It requires sensors, connectivity, a reliable data pipeline, a machine learning model and a usable interface for the people who act on the alerts. Phaemos is all of that.

**The hardware layer.**

Four nodes collect data simultaneously.

The ESP32 is the primary IoT gateway. It consolidates 11 sensors over I2C and analogue inputs: BME280 for temperature, humidity and pressure; MPU6050 for vibration and acceleration; INA219 for current and voltage monitoring; MLX90614 for contactless infrared surface temperature; VL53L0X for distance; MQ-2 for gas and smoke detection; AS5600 for shaft RPM via magnetic encoding; DS18B20 for contact temperature; MAX4466 microphone for acoustic level; LDR for ambient light; and FC-28 for water ingress detection. Output components include a SSD1306 OLED, a WS2812B RGB LED strip, a passive buzzer and a four-channel relay module for triggering external actuators. Consolidated JSON telemetry is posted to the backend every five seconds.

The STM32 Black Pill F411CEU6 is the vibration specialist. It samples an MPU6050 at 100 Hz over I2C in bare HAL C, accumulates one second of acceleration data, runs a short-window FFT and transmits the peak vibration frequency and magnitude over UART to the ESP32. Rather than sending raw acceleration values, this gives the ML model a richer signal. Bearing wear, imbalance and cavitation each produce characteristic resonant frequencies that raw acceleration alone cannot distinguish.

The Arduino Nano reads a secondary BME280, LDR and FC-28 moisture sensor and relays formatted CSV strings to the ESP32 over serial every two seconds.

The Raspberry Pi Pico 2W runs MicroPython. It reads a BME280 and LDR, displays locally on a SSD1306 OLED and posts its own telemetry payload to the API independently over Wi-Fi. It operates completely standalone from the ESP32, which means it continues logging even if the primary node fails.

**The backend.**

FastAPI in Python 3.11, backed by PostgreSQL 15 and Redis. On every incoming telemetry POST, the backend validates the device API key, stores the reading across a 25-field schema, evaluates all alert rules for that device, scores the reading through the ML model, updates the device status and last-seen timestamp and returns a 200 response. Target latency is under 200 ms end to end.

Every significant action writes to an immutable audit log. JWT authentication with bcrypt password hashing enforces three role levels: admin for full access, technician for creating and updating tickets and viewer for read-only access. Role enforcement happens at both the API route level and the frontend route level so neither side trusts the other alone.

**The ML pipeline.**

The anomaly detection model is a scikit-learn Isolation Forest. It is unsupervised: it requires no labelled fault data to train. It learns the normal operating envelope from real baseline telemetry and scores each new reading from 0 to 1. Scores above 0.7 trigger an alert and auto-generate a maintenance ticket. Scores above 0.85 attach a diagnostic recommendation string to that ticket.

The feature vector for each reading includes raw sensor values, rolling means and standard deviations over the last ten readings, total vibration magnitude and time-of-day encoding. The rolling statistics are critical. A single spike is noise. A sustained drift in the rolling mean for temperature or vibration frequency is a genuine signal worth acting on. Time-of-day encoding captures the fact that thermal behaviour differs significantly between startup, steady state and shutdown.

**The dashboard.**

The Next.js frontend polls the API every five seconds and renders live Recharts charts for each sensor metric. Anomalous readings are highlighted red as they arrive. Device cards show current status: online, warning, fault or offline. The ticket system lets technicians acknowledge alerts, add notes, update status and close resolved issues. All views are role-gated at the UI level.

The full stack runs with Docker Compose locally. The frontend deploys to Vercel and the backend and database deploy to Render.

The project is on GitHub at: github.com/zaccesss/phaemos and the live demo is at: phaemos.com

**What building this taught me.**

The interesting problems were all at the boundaries between layers. Making the ESP32 reliably deliver data over Wi-Fi under electrically noisy conditions. Ensuring the FastAPI ingest endpoint handled concurrent posts without dropping readings. Keeping the Next.js dashboard live without hammering the backend. Designing the feature vector so the Isolation Forest learned useful patterns rather than memorising noise.

Building a system that spans embedded firmware, a REST API, a machine learning pipeline and a production frontend taught me more than any single-layer project could. Each layer has its own failure modes and its own debugging tools. Getting them to work together reliably is a genuinely different class of problem from getting any one of them to work in isolation.

Next issue: something personal. I have one working eye and I build in engineering labs. That is what the next issue is about.

Zac

---
---

## Issue 007

**Subject:** Issue 007: I have one working eye. Here is what an engineering lab looks like from where I stand.

**Preview text:** Soldering, PCBs and depth perception. The engineering experience nobody writes about.

**Tags:** personal, disability, engineering, accessibility, partially sighted, labs

**Description:** What it is actually like to be partially sighted in an engineering programme, how it shapes the way I build and what I have learned from working around constraints most curricula are not designed for.

**Image suggestion:** No project image for this one. The writing is the focus. If you want a visual, a close-up of a soldering iron on a PCB or a lab bench image works well. If you have a personal photo from an Aston lab session, that would be ideal.

---

This issue is personal. I want to talk about what it is actually like to be partially sighted in an engineering programme.

**The background.**

At age two, I lost the sight in my right eye after surgery for suspected retinoblastoma, a rare childhood eye cancer. I have been monocular for as long as I can remember. I have a good left eye and a non-functioning right one.

Most of the time I do not think about it. Then I sit down in a lab.

**Depth perception and the soldering iron.**

Soldering requires judging distance precisely. You need to bring a hot iron tip and a thin wire of solder to the same small point on a PCB simultaneously, without burning an adjacent component or bridging two pads that should not touch.

Binocular vision gives stereo depth cues that tell the brain exactly where objects sit in three-dimensional space. Monocular vision replaces these with learned cues: shadow, relative size and context. These work well in everyday life. They are slower in precision tasks.

When I started soldering I was slower than my peers. Not dramatically, but noticeably. I compensated by using more light, angling the board to give myself better shadow cues and working more deliberately than I might otherwise have done. Every joint was inspected closely before I moved on.

The result of slowing down was actually better joints. Rushing produces cold joints. Deliberateness produces clean ones. That discipline is now something I apply automatically, not just in soldering but in how I approach code reviews, circuit checks and system tests. It came from a constraint.

The NeoPixel LED cube in Issue 003 involved 200 solder joints in a three-dimensional frame. Every one of them required precise placement under close inspection. Building a jig to hold each LED in position was partly a practical necessity and partly an adaptation to working with one eye. The jig did for spatial alignment what binocular vision would have done automatically.

**Oscilloscope probes and PCB inspection.**

Placing an oscilloscope probe on a specific test point while watching the screen requires spatial judgment about exactly where the probe tip is landing. Standard briefings assume you can judge this binocularly. I had to develop a habit of using physical reference points: placing my finger or a marker adjacent to the target pad before bringing the probe in. Slower, but reliable.

PCB inspection is similar. Checking pad alignment, via placement and track routing on a finished board requires careful close-range inspection of small features. I use a magnifier lamp and take extra time at this stage. The outcome is the same as anyone else's inspection but the process is different.

**Reading slides and textbooks.**

The less visible challenge is not the lab work. It is the daily reading.

Lecture slides are often designed with small fonts, low contrast and cramped layouts. Textbook diagrams can be dense and assume excellent near vision. For a sighted reader with no visual impairment, these are minor inconveniences at worst. For someone managing contrast sensitivity and visual fatigue in one eye across a full day of study, they add up.

This is the problem that produced Zaccess. It photographs lecture material, extracts the text using OCR and converts it into high-contrast, large-text notes with text-to-speech support. I built it for myself. Then I shared it with another visually impaired student and he told me it saved him hours every week. That changed how I understood the project. I had solved my own problem and found it solved someone else's. That is the best outcome a tool can have.

**What the curriculum gets right and wrong.**

Aston's engineering labs are well equipped. The benches have good lighting, the equipment is modern and the technicians are genuinely helpful. Nobody has ever made my monocular vision a formal obstacle.

What the curriculum does not do is acknowledge that depth perception and visual acuity vary between students. Safety briefings assume everyone has two functioning eyes. PCB inspection exercises assume binocular close-range judgment. Oscilloscope probe placement assumes binocular spatial reasoning. These are small things individually. Across a three-year programme they accumulate into a consistent pattern of additional effort that most students around me do not have to manage.

This is not a complaint. It is an observation. Engineering education is designed for a median student. Working around the edge cases makes you better at identifying them in other contexts.

**What the constraint produced.**

I genuinely believe working around my vision has made me a more deliberate engineer. I check things twice because I learned to check things twice. I document thoroughly because I cannot rely on visual recall the way others might. I build accessibility into the tools I create because I know what it is like to need it.

If you are navigating engineering with a disability, visible or not: you are not behind. You are building habits of precision and deliberateness that your peers are not being forced to develop. Those habits compound.

Next issue: the books and resources that actually changed how I think. Not a list of classics everyone recommends. The ones that genuinely shifted something.

Zac

---
---

## Issue 008

**Subject:** Issue 008: The books and resources that actually changed how I think

**Preview text:** Not the classics everyone recommends. The ones that genuinely shifted something.

**Tags:** books, resources, learning, reading, engineering, software, embedded

**Description:** A curated list of books and resources that materially changed how I approach engineering problems, learn new things and write code, with a short note on why each one mattered.

**Image suggestion:** No project image needed. A clean text layout works best for a reading list issue. If Beehiiv allows it, use a simple horizontal rule between each book section to give the reader visual breathing room.

---

I read a lot. Not always books. Often documentation, datasheets, changelogs and long-form articles. This issue is about the things that actually changed how I think, with a short note on why each one mattered.

These are not the books everyone puts on a list because they are famous. They are the ones that shifted something in how I approach problems.

**On electronics and hardware.**

*The Art of Electronics* by Horowitz and Hill is not a textbook. It is a companion. It explains what is happening in a circuit and why, not just what the formula produces. The chapter on op-amps rewrote how I thought about my audio amplifier project. The sections on noise, filtering and grounding are things I return to every time I am designing something analogue. I go back to it when I am confused, not when I want to confirm something I already know. That is the mark of a useful reference.

*Practical Electronics for Inventors* by Scherz and Monk is more accessible than Horowitz and broader in scope. It is useful for the moments when you need context before you need precision. Good coverage of power supplies, motors, sensors and digital interfaces. I used it when specifying components for the Phaemos hardware layer.

**On software and systems thinking.**

*The Pragmatic Programmer* by Hunt and Thomas contains career advice but the deeper value is the mental models. DRY, orthogonality, programming by coincidence versus programming by design. Reading it early changed what I noticed when reading other people's code and when reviewing my own. The "broken windows" concept is one I think about whenever I am tempted to leave something messy because it is not the main task.

*A Philosophy of Software Design* by John Ousterhout is short, direct and opinionated. The core argument is that complexity is the enemy and depth is the goal: modules should do a lot and expose little. I think about this when designing API endpoints, firmware state machine interfaces and database schemas. Deep modules reduce the cognitive load on everyone who has to use them. Shallow ones push the complexity outward where it multiplies.

**On learning.**

*A Mind for Numbers* by Barbara Oakley describes the focused versus diffuse thinking model in a way that is genuinely actionable. Focused thinking is deliberate and directed. Diffuse thinking happens when you step back, take a walk or sleep. Both are required for understanding to consolidate. Reading this changed how I structure study sessions and how I treat breaks. Taking a break when stuck is not laziness. It is part of the process.

*Make It Stick* by Brown, Roediger and McDaniel was uncomfortable to read because it made it clear that most of what I thought counted as studying did not. Re-reading notes feels productive and produces almost no durable retention. Retrieval practice, spaced repetition and interleaving are the methods that actually build knowledge you can use under pressure. I changed how I revise for exams and how I plan projects where I am learning while building.

**Resources I return to regularly.**

The ATmega644P datasheet. Not a book, but the most useful document I have read in the past year. Every answer about the microcontroller is in there. Learning to navigate a datasheet is a skill that transfers to every piece of hardware you ever touch. The index, the register summary tables and the timing diagrams are where the real information lives.

Phil's Lab on YouTube covers PCB design, embedded systems and STM32 content with clear explanations and real projects. No padding. I watched his KiCad and STM32 series before starting the Phaemos hardware layer.

embedded.fm is a podcast of conversations with working embedded engineers. Useful for understanding how the industry actually thinks rather than how academia presents it. The episode archive is long and the quality is consistent. The website is embedded.fm.

**A note on the classics.**

Structure and Interpretation of Computer Programs is important. Clean Code is widely cited. I have read both. Neither changed how I think as concretely as the books above.

The best resource is the one that meets you where you are and gives you something you can apply to whatever you are building right now. That changes as you develop. The books I recommend today are not the ones I would have found useful two years ago and probably not the ones I will recommend in two years from now.

Next issue: what a British Airways maintenance simulation taught me about engineering rigour and why aviation documentation practices are worth studying regardless of your field.

Zac

---
---

## Issue 009

**Subject:** Issue 009: Inside British Airways Engineering: what planning aircraft maintenance actually taught me

**Preview text:** Simulation, A320s and what aviation engineering reveals about discipline.

**Tags:** aviation, career, engineering, maintenance, british airways, rigour

**Description:** Reflections on the British Airways Engineering virtual experience on Forage: A320 maintenance planning, C-check operations, material forecasting and what aviation-level rigour means for any engineering discipline.

**Image suggestion:** No project image from the repo is relevant here. For visual interest you could use a public domain aviation image, but if you prefer to keep it image-free that works well too. This is a reflective issue and the writing carries it.

---

In October 2025 I completed the British Airways Engineering Virtual Experience on Forage. It was a structured simulation of real maintenance and supply chain operations, and it gave me a perspective on what engineering looks like at scale that lab projects and coursework do not provide.

**What the programme involved.**

The simulation was built around Airbus A320 aircraft maintenance. The A320 is one of the most widely operated commercial aircraft in the world and British Airways operates a significant fleet. The programme asked participants to think like an engineering operations planner: analyse maintenance schedules, forecast material requirements, identify risk factors and produce professional documentation.

The tasks included:

Analysing A320 maintenance schedules across a six-aircraft fleet and identifying components approaching their service limits.
Building a Material Forecast and Planning Report covering component replacement timelines, lead times and risk mitigation options.
Diagnosing component faults and producing Work Request reports in the format used by an EASA Part 145 approved maintenance organisation.
Proposing risk mitigation strategies for long-lead parts using data-driven forecasting.
Applying EASA and CAA compliance requirements to maintenance planning decisions.
Integrating sustainable options including certified recycled components and consolidated logistics to reduce environmental impact.

**What a C-check is.**

Commercial aircraft undergo structured maintenance checks at increasing intervals and depth. An A-check is a routine overnight inspection. A C-check is a heavy maintenance visit, typically occurring every 18 to 24 months depending on the operator's maintenance programme. The aircraft is partially disassembled, systems are inspected in detail and many components are replaced on a fixed schedule rather than waiting for failure.

The planning complexity of a C-check is significant because many critical components have long procurement lead times. A landing gear actuator or an engine control unit may have a lead time of six to eighteen months. If a component approaches its replacement limit and is not already on order, the aircraft cannot return to service on schedule. The financial and operational consequences of a delayed aircraft are substantial.

Understanding this made the material forecasting task much clearer. You are not just tracking what needs replacing. You are modelling a probability distribution over when each part will fail and comparing that against procurement timelines to find the gap before it becomes a crisis.

**The Work Request report.**

A Work Request is the formal document that initiates a maintenance action in an EASA Part 145 environment. It must specify the fault description with reference to the relevant chapter of the Aircraft Maintenance Manual, the required corrective action and the applicable airworthiness directive or service bulletin if relevant, the parts required by part number and quantity and the category of licensed maintenance engineer required to perform the work.

Writing one properly requires understanding not just the technical problem but the regulatory framework surrounding it. Every maintenance action on a commercial aircraft must be traceable, documented and signed off by a licensed engineer. There is no ambiguity tolerated and no informal workaround acceptable. The consequences of getting it wrong are not a failed test or a broken system. They are airworthiness events.

**What aviation engineering taught me about my own practice.**

Aviation maintenance is rigorous in a way that most engineering contexts are not. Every decision is documented. Every component has a traceable history. The regulatory framework is non-negotiable and exists because the consequences of failure are irreversible.

That level of rigour is not unique to aviation. It is the standard that any safety-critical or reliability-critical system should meet. As an Electronic Engineering and Computer Science student, this experience was a useful reminder that careful documentation, systematic fault diagnosis and deep understanding of failure modes are the same disciplines regardless of whether you are planning a C-check or debugging a microcontroller.

The difference is that in aviation, the habits are enforced by regulation. In software and embedded systems, they have to be self-imposed. The best engineers impose them on themselves regardless.

There is no git rollback for a landing gear failure.

Next issue: what Yunex Traffic and intelligent transport systems taught me about IoT at city scale and why the engineering behind traffic signals is more interesting than it appears.

Zac

---
---

## Issue 010

**Subject:** Issue 010: The engineering behind traffic lights is more interesting than you think

**Preview text:** Smart cities, air quality sensors and what IoT looks like at the scale of an entire city.

**Tags:** iot, smart cities, yunex, transport, air quality, sensors, career

**Description:** Reflections on the Yunex Traffic Smart Mobility and Environmental Sustainability virtual experience: intelligent transport systems, Zephyr air quality sensors and what city-scale IoT engineering actually involves.

**Image suggestion:** No project image from the repo is directly relevant. If you want a visual, a public domain image of a city traffic intersection or air quality sensor installation works well. Alternatively keep it image-free — the content is the focus.

---

In August 2025 I completed Yunex Traffic's Smart Mobility and Environmental Sustainability virtual work experience via Springpod. Yunex Traffic is one of the largest providers of intelligent transport systems in the world. The programme explored how digital technology improves urban air quality and traffic efficiency.

Before this experience, I thought of traffic lights as solved infrastructure. I was wrong.

**What Yunex Traffic actually does.**

Yunex Traffic designs and operates intelligent transport systems. This includes traffic signal controllers, adaptive signal control software, vehicle detection sensors and urban traffic management centres. Their systems are deployed across hundreds of cities and directly influence how millions of road users move every day.

The connection to IoT is direct. Sensors collect data at intersections, cameras detect vehicle types and counts and software makes real-time decisions to optimise traffic flow. Modern traffic management is a distributed IoT system operating at city scale with real safety and environmental consequences.

Adaptive signal control is the part that interests me most. Rather than running on a fixed timer, an adaptive system uses real-time vehicle detection data to extend or reduce green phases based on actual demand. This reduces idling, improves throughput and decreases the stop-and-start cycling that contributes most to vehicle emissions at urban junctions. The algorithm is making thousands of small decisions every minute across a network of intersections, each one affecting journey times and air quality in ways that accumulate into significant measured improvements.

**Zephyr air quality sensors.**

The most technically interesting part of the programme was the Zephyr air quality monitoring system. Zephyr sensors measure nitrogen dioxide (NO2), ozone (O3) and particulate matter in real time using electrochemical and optical methods. These pollutants are directly linked to respiratory health outcomes and are regulated under UK and EU air quality standards.

The data pipeline from a Zephyr sensor to a policy decision is a good example of how engineering and public health connect in practice. A sensor reading below a threshold is just a number. But connected to a traffic signal timing algorithm, a reading above a NO2 threshold can trigger an adaptive response: extending green phases to reduce idling, rerouting heavy vehicles away from sensitive zones like schools and hospitals or generating an alert for the local authority's air quality team.

I produced an infographic for the programme explaining how Zephyr sensors are deployed in an urban environment, how the data transmits in near real time to a cloud platform and how local authorities use the visualised readings against air quality index thresholds to make operational decisions. Building the infographic required understanding the full pipeline from sensor to policy. That exercise is one I have returned to when designing the Phaemos data pipeline. The questions are structurally identical: how does a raw sensor reading become a decision that a human can act on?

**The engineering roles.**

The programme gave insight into different career paths within a company like Yunex Traffic. Software engineers build the traffic management platforms and adaptive control algorithms. Electrical and systems engineers design and qualify sensor hardware for outdoor deployment across all weather conditions. Project managers coordinate city-scale deployments spanning multiple local authorities, contractors and regulatory certification bodies. The collaboration between these roles is what makes a system that operates continuously in a real city work reliably.

What struck me is that the engineering challenges at Yunex Traffic are the same challenges I am working on in miniature with Phaemos: reliable sensor data collection, a processing pipeline that handles the data faster than it arrives, anomaly detection that distinguishes signal from noise and a human-facing interface that presents the right information at the right moment. The scale is different by several orders of magnitude. The fundamental structure is the same.

**What I took from it.**

Smart city technology is not abstract. It is physical infrastructure that affects air quality, journey times and road safety for real people every day. The engineering behind a traffic signal controller or an air quality sensor network is not glamorous in the way a consumer product might be but the scale and the measurable real-world impact are significant.

This programme confirmed my interest in IoT at scale: systems where sensors, connectivity, real-time data processing and measurable outcomes are connected in a continuous feedback loop. That is the kind of engineering I want to build.

Thank you for reading to the end of this run of issues. More to come.

Zac

---

## End of file

Total: Issues 000 through 010 = 11 issues.
Issue 001 is already published on Beehiiv. All others are ready to publish.

**Publish order recommendation:** 000 first (retroactively if needed), then work chronologically. Space them out — one every one to two weeks is a sustainable cadence to start with.

**To delete this file:**
```
rm newsletter-issues.md
```
