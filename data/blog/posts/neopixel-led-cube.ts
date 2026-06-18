import type { BlogPost } from "../index"

const _neopixel_led_cube: BlogPost = {
    slug: "neopixel-led-cube",
    title: "64 LEDs, One Cube: How I Built a 4x4x4 NeoPixel LED Cube with Adaptive Brightness",
    date: "2025-12-01",
    type: "blog",
    projectSlug: "led-cube",
    cover_image: "/images/projects/led-cube/final-setup.webp",
    description:
      "A walkthrough of building a 4x4x4 NeoPixel LED Cube with four animation modes and automatic brightness adjustment via an LDR sensor, using Arduino and bare C++.",
    tags: ["Arduino", "C++", "LED", "Hardware", "IoT"],
    published: true,
    content: [
      {
        type: "image",
        src: "/images/projects/led-cube/neopixel-main.webp",
        alt: "4x4x4 NeoPixel LED Cube showing an active animation",
        caption: "The finished 4x4x4 NeoPixel LED Cube - 64 WS2812B LEDs hand-soldered into a matrix",
      },
      {
        type: "p",
        text: "A WS2812B is an addressable RGB LED: each one contains a tiny built-in controller chip that lets you set its colour independently using a single data wire. You chain them together and send a 24-bit colour value for each LED in sequence. The chip handles the rest.",
      },
      {
        type: "p",
        text: "The [NeoPixel LED Cube](/projects/led-cube) started as a university assignment and turned into something I am genuinely proud of. 64 individually addressable WS2812B LEDs, hand-soldered into a 4x4x4 matrix, controlled by an [Arduino](https://www.arduino.cc) Uno with adaptive brightness and physical button controls. No pre-made cube kit. Built from scratch.",
      },
      {
        type: "h2",
        text: "The Hardware",
      },
      {
        type: "p",
        text: "The cube uses 64 WS2812B LEDs arranged in four horizontal layers of 16 LEDs each. All 64 LEDs are chained on a single data line controlled by the Arduino Uno's digital output. The WS2812B is a self-contained RGB LED with an integrated driver chip, which means each LED only needs a single data wire in addition to power and ground. You send a 24-bit colour value for each LED in the chain and the chain self-propagates the data.",
      },
      {
        type: "ul",
        items: [
          "64 WS2812B addressable LEDs in a 4x4x4 layout",
          "Arduino Uno (ATmega328P)",
          "LDR (light-dependent resistor) for ambient brightness sensing",
          "Two physical buttons: power toggle and mode cycle",
          "5V DC power supply at 2A or above (required for full brightness)",
          "Adafruit NeoPixel library for LED control",
        ],
      },
      {
        type: "h2",
        text: "Power Budgeting",
      },
      {
        type: "p",
        text: "Power budgeting was one of the most important design decisions. Each WS2812B LED draws up to 60 mA at full white brightness. With 64 LEDs that is potentially 3.84 A. Running all LEDs at full white would require a substantial power supply and would generate significant heat. The solution was to cap brightness in software using the [Adafruit NeoPixel library](https://learn.adafruit.com/adafruit-neopixel-uberguide) and never display full white on all LEDs simultaneously. In practice the cube draws well under 2 A during normal operation.",
      },
      {
        type: "h2",
        text: "Animation Modes",
      },
      {
        type: "p",
        text: "The firmware implements four animation modes, cycled through using a physical button:",
      },
      {
        type: "ul",
        items: [
          "Colour Wipe: fills the cube LED by LED from bottom to top, cycling through colours",
          "Smooth RGB Fade: all 64 LEDs smoothly transition through the full RGB spectrum simultaneously",
          "Fire Effect: simulates a flame using randomised warm colours with upward propagation through the layers",
          "Rainbow Cycle: each LED is offset in the colour wheel so the whole cube displays a rolling rainbow pattern",
        ],
      },
      {
        type: "h2",
        text: "Adaptive Brightness with the LDR",
      },
      {
        type: "p",
        text: "The LDR reads ambient light via the Arduino's ADC on an analogue pin. The raw reading is mapped to a brightness value using Arduino's map() function. In bright environments the cube runs at higher brightness. In dim or dark environments it automatically reduces brightness to avoid being blinding. This runs in a non-blocking loop, sampling the LDR and updating the NeoPixel brightness value at regular intervals without interrupting the animation.",
      },
      {
        type: "h2",
        text: "Serial Diagnostics",
      },
      {
        type: "p",
        text: "The firmware outputs real-time debug information over serial at 9600 baud: current animation mode, current brightness value and LDR reading. This was invaluable during development and makes it straightforward to verify the brightness scaling is working as expected.",
      },
      {
        type: "h2",
        text: "The Fire Effect Algorithm",
      },
      {
        type: "p",
        text: "The fire effect was the most technically interesting animation to implement. It uses a two-dimensional heat array representing temperature at each LED position. Each frame, heat propagates upward with random variation and decays at a configurable rate. The heat value maps to a colour: deep red at low heat, orange in the mid range, bright yellow-white at maximum. The result is a convincing upward flame despite the algorithm being under 30 lines of C++.",
      },
      {
        type: "code",
        lang: "cpp",
        text: `// Heat propagation - simplified
for (int layer = LAYERS - 1; layer > 0; layer--) {
  for (int i = 0; i < LEDS_PER_LAYER; i++) {
    heat[layer][i] = (heat[layer-1][i]
      + heat[layer-1][(i+1) % LEDS_PER_LAYER]
      + heat[layer-1][(i-1+LEDS_PER_LAYER) % LEDS_PER_LAYER]) / 3;
    heat[layer][i] = max(0, heat[layer][i] - random(0, COOLING));
  }
}`,
      },
      {
        type: "h2",
        text: "Power Budget",
      },
      {
        type: "p",
        text: "Power budgeting was critical. Each WS2812B draws up to 60mA at full white. 64 LEDs at full brightness would draw 3.84A, far more than a USB port can supply and enough to cause visible flickering and colour shift. The solution was to cap brightness in software using the Adafruit NeoPixel setBrightness() function and to never run all LEDs at full white simultaneously. In practice during normal operation the cube draws well under 2A at 5V.",
      },
      {
        type: "p",
        text: "A 1000uF electrolytic capacitor across the 5V power rail is essential. Without it, the sudden current draw when LEDs switch state causes voltage spikes that can corrupt the WS2812B data line and produce random colour flashes. This is one of those details that is not in beginner tutorials but matters the moment you scale past a handful of LEDs.",
      },
      {
        type: "h2",
        text: "What I Learned",
      },
      {
        type: "p",
        text: "Hand-soldering 64 LEDs into a 3D matrix is significantly harder than it looks. The physical construction took more time than the firmware. The main lessons: use flux, keep your iron tip clean and solder each joint fully before moving to the next. Cold joints on LEDs in the middle of the chain are very difficult to diagnose because the entire section after the fault goes dark. Testing each layer with continuity checks before stacking them saved significant rework time.",
      },
      {
        type: "p",
        text: "The WS2812B protocol is unforgiving of timing. The data signal uses specific high and low pulse widths measured in hundreds of nanoseconds. On an Arduino running at 16MHz this works reliably, but any interrupt that disrupts the timing mid-frame corrupts the entire frame. Disabling interrupts during LED updates was necessary for stable output.",
      },
      {
        type: "h2",
        text: "References",
      },
      {
        type: "ol-links",
        items: [
          { text: "WS2812B datasheet - LED and driver integrated light source (WorldSemi)", url: "https://cdn-shop.adafruit.com/datasheets/WS2812B.pdf" },
          { text: "Adafruit NeoPixel Uberguide - comprehensive guide to wiring, power and programming NeoPixels", url: "https://learn.adafruit.com/adafruit-neopixel-uberguide" },
          { text: "Arduino Reference - language and library documentation", url: "https://www.arduino.cc/reference/en/" },
          { text: "Wikipedia: LED cube - background on LED matrix displays", url: "https://en.wikipedia.org/wiki/LED_cube" },
          { text: "NeoPixel LED Cube - project page on this site", url: "/projects/led-cube" },
          { text: "Adafruit NeoPixel library - GitHub repository and API reference", url: "https://github.com/adafruit/Adafruit_NeoPixel" },
        ],
      },
    ],
  }

export default _neopixel_led_cube
