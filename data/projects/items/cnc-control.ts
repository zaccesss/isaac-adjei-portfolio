import type { Project } from "../index"

const _cnc_control: Project = {
    id: "cnc-control",
    title: "CNC Milling Machine Control System",
    description:
      "Safety-critical Arduino control system for a CNC milling machine with door interlocks, emergency stop, state machine firmware and LCD feedback",
    longDescription:
      "Designed and programmed a safety-critical control system for a CNC milling machine built around an Arduino ATmega328P. The central design constraint was that the machine must be incapable of operating unsafely regardless of how it is used - not just that it handles the happy path correctly. Every transition in the 8-state finite state machine (INIT, DOOR_OPEN, READY, RUNNING, COOLDOWN, FAULT) is guarded by a full safety check: no state change is permitted unless every relevant condition is satisfied simultaneously. This means, for example, that a door interlock open during RUNNING immediately drives the state to FAULT, not back to READY and FAULT can only exit after a deliberate manual reset sequence.\n\nThe emergency stop is a mushroom-head button wired to a hardware interrupt (INT0) so the ATmega328P reacts in under a millisecond regardless of where the main loop is executing. On activation it kills the motor, latches a fault flag in EEPROM so a power cycle cannot silently clear it, activates the buzzer and blocks all input acceptance until an operator physically holds the reset button for two seconds, confirming a human has acknowledged the fault. The 10-second cutting cycle and the mandatory 5-second post-cycle safety delay before the door can open are both driven by millis() non-blocking timing so the ISR and sensor polling continue running throughout and cannot miss an E-Stop or door event mid-cycle.\n\nSensor signal conditioning uses a TL071 op-amp configured as a Schmitt trigger to buffer the reed switch output. Industrial environments generate significant electrical noise from motor switching transients and the Schmitt trigger provides hysteresis that prevents false triggering on slow or noisy signal edges before they reach the ATmega digital input. A 16x2 HD44780 LCD driven over a 4-bit parallel interface shows a plain-English status message and a countdown during the safety delay. Multi-colour LED indicators (green for READY, yellow for RUNNING, red for FAULT) and a buzzer give at-a-glance state information without requiring the operator to read the display. A hardware watchdog timer restarts the system and enters FAULT if the main loop stalls for any reason, ensuring a firmware bug cannot leave the machine stuck in an active state.",
    technologies: ["Arduino", "C++", "Embedded Systems", "TL071", "LCD", "Safety Systems"],
    category: "embedded",
    featured: false,
    images: [
      "/images/projects/cnc-control/main.webp",
      "/images/projects/cnc-control/safety-test.webp",
      "/images/projects/cnc-control/lcd.webp",
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
  }

export default _cnc_control
