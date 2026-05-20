export const metadata = { robots: "noindex, nofollow" }

const days = [
  {
    day: "Day 1",
    label: "Chest & Triceps (Push)",
    exercises: [
      "Barbell Bench Press - 4 × 8-10",
      "Incline Dumbbell Press - 3 × 10-12",
      "Cable Flyes - 3 × 12-15",
      "Tricep Dips - 3 × 8-10",
      "Tricep Pushdowns - 3 × 12-15",
      "Overhead Dumbbell Tricep Extensions - 3 × 10-12",
      "Push-Ups (finisher) - 2 × max reps",
    ],
  },
  {
    day: "Day 2",
    label: "Back & Biceps (Pull)",
    exercises: [
      "Deadlifts - 4 × 6-8",
      "Lat Pulldowns - 3 × 10-12",
      "Bent-Over Barbell Rows - 3 × 8-10",
      "Seated Rows - 3 × 10-12",
      "Dumbbell Bicep Curls - 3 × 10-12",
      "Hammer Curls - 3 × 10-12",
      "Face Pulls (rear delt + traps) - 3 × 12-15",
    ],
  },
  {
    day: "Day 3",
    label: "Legs",
    exercises: [
      "Barbell Squats - 4 × 8-10",
      "Romanian Deadlifts - 3 × 8-10",
      "Walking Lunges (each leg) - 3 × 12-15",
      "Leg Press - 3 × 10-12",
      "Leg Extensions - 3 × 12-15",
      "Calf Raises - 4 × 12-15",
      "Glute Bridges or Hip Thrusts - 3 × 10-12",
    ],
  },
  {
    day: "Day 4",
    label: "Cardio, Core & Mobility",
    exercises: [
      "Treadmill / Outdoor Run - 25-30 mins",
      "Plank Variations - 3 × 45-60 sec",
      "Russian Twists - 3 × 15 each side",
      "Hanging Leg Raises - 3 × 10-12",
      "Mountain Climbers - 3 × 20 each leg",
      "Dynamic Stretching - 10-15 mins",
    ],
  },
  {
    day: "Day 5",
    label: "Shoulders & Arms",
    exercises: [
      "Barbell Overhead Press - 4 × 8-10",
      "Arnold Press - 3 × 10-12",
      "Dumbbell Lateral Raises - 3 × 12-15",
      "Front Raises - 3 × 10-12",
      "Barbell Curls - 3 × 8-10",
      "Skull Crushers - 3 × 8-10",
      "Shrugs (traps) - 3 × 12-15",
    ],
  },
  {
    day: "Day 6",
    label: "Full-Body HIIT",
    exercises: [
      "Circuit × 3 rounds (1 min each, no rest within round, 2 min between rounds):",
      "Jumping Jacks · Push-Ups · Squat Jumps · Dumbbell Rows · Burpees · Russian Twists · Jumping Lunges · Plank Hold",
      "Finisher: Battle Ropes 3 × 30s + Medicine Ball Slams 3 × 12",
    ],
  },
  {
    day: "Day 7",
    label: "Rest & Recovery",
    exercises: [
      "Stretching, yoga or light walk (30-40 mins)",
      "Focus on mobility, hydration and sleep",
    ],
  },
]

const nutrition = [
  {
    meal: "Breakfast",
    desc: "High protein, moderate fat, low carb",
    items: ["Eggs, omelette or frittata with vegetables", "Avocado or Greek yogurt with berries"],
  },
  {
    meal: "Lunch",
    desc: "Balanced, fiber-rich",
    items: ["Protein: chicken, salmon, tofu, beans", "Carbs: quinoa, lentils, brown rice (small)", "Vegetables: big serving, colourful"],
  },
  {
    meal: "Dinner",
    desc: "Protein + veg, moderate carbs post-workout",
    items: ["Grilled chicken, salmon, cod or tofu", "Sweet potatoes, brown rice or couscous (after gym)", "Vegetables: always half the plate"],
  },
  {
    meal: "Snacks",
    desc: "Light, high-protein",
    items: ["Greek yogurt + mixed berries", "Nuts/seeds (in moderation)", "Hummus with cucumber/carrots", "Protein shake (post-workout)"],
  },
]

const rules = [
  "Protein goal: 1.6-2g per kg bodyweight",
  "Save most carbs for post-workout meals",
  "Healthy fats (avocado, nuts, olive oil): moderate",
  "Minimum 3L water daily",
  "Supplements: Creatine 3-5g daily, Whey Protein, Omega-3, Vitamin D",
  "No alcohol · Less sugar",
  "Eating window: 3PM - 8PM (2 meals)",
]

export default function GymPage() {
  return (
    <div className="flex flex-col gap-8 max-w-3xl">
      <div>
        <h1 className="text-xl font-semibold">Gym</h1>
        <p className="text-sm text-muted-foreground mt-1">6-day split - strength, conditioning and recovery</p>
      </div>

      {/* Weekly split */}
      <div className="flex flex-col gap-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Weekly split</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {days.map((d) => (
            <div key={d.day} className="border border-border rounded-lg p-4 bg-card flex flex-col gap-2">
              <div>
                <span className="text-xs font-mono text-muted-foreground">{d.day}</span>
                <p className="font-medium text-sm">{d.label}</p>
              </div>
              <ul className="flex flex-col gap-1">
                {d.exercises.map((e, i) => (
                  <li key={i} className="text-xs text-muted-foreground flex gap-1.5">
                    <span className="text-foreground/30 shrink-0">-</span>
                    <span>{e}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Nutrition */}
      <div className="flex flex-col gap-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Nutrition plan</p>

        {/* Rules */}
        <div className="border border-border rounded-lg p-4 bg-card flex flex-col gap-2">
          <p className="text-sm font-medium">Key rules</p>
          <ul className="flex flex-col gap-1">
            {rules.map((r, i) => (
              <li key={i} className="text-xs text-muted-foreground flex gap-1.5">
                <span className="text-foreground/30 shrink-0">-</span>
                <span>{r}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Meals */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {nutrition.map((n) => (
            <div key={n.meal} className="border border-border rounded-lg p-4 bg-card flex flex-col gap-2">
              <div>
                <p className="font-medium text-sm">{n.meal}</p>
                <p className="text-xs text-muted-foreground">{n.desc}</p>
              </div>
              <ul className="flex flex-col gap-1">
                {n.items.map((item, i) => (
                  <li key={i} className="text-xs text-muted-foreground flex gap-1.5">
                    <span className="text-foreground/30 shrink-0">-</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
