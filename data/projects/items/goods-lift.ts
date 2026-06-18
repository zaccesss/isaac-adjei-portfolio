import type { Project } from "../index"

const _goods_lift: Project = {
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
      "/images/projects/goods-lift/main.webp",
      "/images/projects/goods-lift/breadboard.webp",
      "/images/projects/goods-lift/lcd.webp",
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
  }

export default _goods_lift
