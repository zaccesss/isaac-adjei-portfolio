import type { Project } from "../index"

const _led_cube: Project = {
    id: "led-cube",
    title: "4x4x4 NeoPixel LED Cube",
    description:
      "64 individually addressable WS2812B LEDs on an Arduino Uno with adaptive brightness, four animation modes and a custom wooden enclosure",
    longDescription:
      "Designed and built a fully functional 4x4x4 interactive LED display system combining hardware construction and embedded software. The cube uses 64 WS2812B NeoPixel LEDs soldered onto a custom copper wire frame built layer by layer using a precision jig to maintain consistent spacing and alignment. Each of the four layers was continuity-tested before stacking and the complete assembly was housed inside a custom wooden enclosure with access ports for USB programming and power input.\n\nThe build process was the most demanding part of the project. Soldering 64 LEDs onto a three-dimensional copper wire frame while keeping every LED facing outward and every connection solid required building a dedicated jig from a drilled wooden block before any soldering started. Each layer was tested for short circuits and open connections before being added to the stack. The wooden enclosure was measured and cut to fit the finished frame with deliberate clearance for heat dissipation and the front panel was drilled for the power button, mode button and LDR window.\n\nThe firmware runs on an Arduino Uno (ATmega328P at 16 MHz) and implements a non-blocking state machine using millis() to manage four independent animation modes without blocking the input polling loop. Mode 0 runs a colour wipe cascading through red, green and blue. Mode 1 smoothly fades all LEDs through the RGB spectrum simultaneously. Mode 2 simulates a fire effect using a per-LED heat value algorithm that maps temperature to colour from deep red through orange to bright yellow-white. Mode 3 cycles a full rainbow gradient across the array using a hue-wheel algorithm.\n\nAn LDR sensor on pin A0 reads ambient light at 10-bit resolution (0-1023) and maps it inversely to LED brightness (20-255) so the cube dims automatically in bright environments to reduce eye strain. A debounced power button on D2 toggles the system on and off with buzzer confirmation and a mode button on D3 steps through the animation patterns. A 1000 µF electrolytic capacitor on the 5V rail stabilises voltage during rapid LED switching. The firmware streams live diagnostic data over serial at 9600 baud including LDR readings, calculated brightness values and active pattern name.",
    technologies: ["Arduino", "C++", "WS2812B", "Embedded Systems", "Electronics"],
    category: "embedded",
    featured: true,
    images: [
      "/images/projects/led-cube/neopixel-main.webp",
      "/images/projects/led-cube/cube-lit-2.webp",
      "/images/projects/led-cube/final-setup.webp",
      "/images/projects/led-cube/build-layer.webp",
      "/images/projects/led-cube/frame-angle.webp",
      "/images/projects/led-cube/internals-1.webp",
      "/images/projects/led-cube/internals-2.webp",
      "/images/projects/led-cube/power-circuit.webp",
      "/images/projects/led-cube/build-lit.webp",
      "/images/projects/led-cube/main.webp",
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
  }

export default _led_cube
