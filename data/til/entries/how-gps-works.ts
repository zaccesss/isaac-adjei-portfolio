import type { TILEntry } from "../index"

const _how_gps_works: TILEntry = {
    id: "how-gps-works",
    title: "GPS works by trilateration from four satellites: three for position, one to correct clock error",
    date: "2026-07-25",
    category: "Architecture",
    published: true,
    body: "Each GPS satellite broadcasts its precise position and a timestamp. Your receiver calculates the time delay between broadcast and reception and converts it to a distance. Three satellites give you three spheres; the intersection narrows to two points, one of which is obviously on Earth. But your receiver's clock is not as precise as an atomic clock, so its timing error translates directly to position error (light travels ~30 cm per nanosecond). The fourth satellite resolves this: by requiring all four distance estimates to intersect at one point, the receiver can solve for its own clock offset as a fourth unknown.",
    detail: [
      {
        type: "embed",
        url: "https://www.youtube.com/embed/wCcARVbL_Dk",
        caption: "Veritasium: How GPS Works Today: trilateration, atomic clocks and relativistic corrections",
      },
      {
        type: "p",
        text: "The satellites are in medium Earth orbit at about 20,200 km altitude, completing two orbits per day. Each carries an atomic clock accurate to about 20-30 nanoseconds. The signal takes roughly 60-80 ms to reach a receiver on the ground. General and special relativity both affect the clocks: the satellites' clocks tick faster due to weaker gravity (general) and slower due to orbital speed (special). Both corrections are applied to the satellite clock rate before launch.",
      },
    ],
    tags: ["GPS", "systems", "hardware", "networking"],
  }

export default _how_gps_works
