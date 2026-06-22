// I build the weekly routine iCal in a shared module so two callers can reuse it: the public
// /api/routine-ical endpoint (Apple/Google Calendar subscriptions) and the dashboard calendar page.
// The dashboard used to fetch that endpoint over the network during SSR, but a same-origin fetch loops
// through Cloudflare/Vercel and silently returned nothing in production, so the routine feed was
// invisible on the calendar while external feeds worked. Building the iCal in-process removes the hop.
//
// I generate concrete VEVENTs for the current Mon-Sun in Europe/London (no RRULE) and roll to the next
// week at Monday 00:00 London. Calendar subscriptions refresh hourly so the new week loads itself.

function getLondonDateStr(date: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/London",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date).replace(/-/g, "")
}

function getLondonDayIndex(date: Date): number {
  // 0 = Monday ... 6 = Sunday
  const name = new Intl.DateTimeFormat("en-US", {
    timeZone: "Europe/London",
    weekday: "long",
  }).format(date)
  return ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].indexOf(name)
}

function shiftDate(yyyymmdd: string, days: number): string {
  const y = +yyyymmdd.slice(0, 4)
  const m = +yyyymmdd.slice(4, 6) - 1
  const d = +yyyymmdd.slice(6, 8)
  const dt = new Date(Date.UTC(y, m, d))
  dt.setUTCDate(dt.getUTCDate() + days)
  return dt.toISOString().slice(0, 10).replace(/-/g, "")
}

function getWeekDates() {
  const now = new Date()
  const today = getLondonDateStr(now)
  const idx = getLondonDayIndex(now)
  const mon = shiftDate(today, -idx)
  return {
    mon,
    tue: shiftDate(mon, 1),
    wed: shiftDate(mon, 2),
    thu: shiftDate(mon, 3),
    fri: shiftDate(mon, 4),
    sat: shiftDate(mon, 5),
    sun: shiftDate(mon, 6),
    nextMon: shiftDate(mon, 7),
  }
}

interface VEvent {
  uid: string
  summary: string
  dtstart: string
  dtend: string
  description: string
  categories: string
}

function escapeIcal(str: string): string {
  return str
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\n/g, "\\n")
}

function foldLine(line: string): string {
  if (line.length <= 75) return line
  const out: string[] = []
  let i = 0
  while (i < line.length) {
    if (i === 0) { out.push(line.slice(0, 75)); i = 75 }
    else { out.push(" " + line.slice(i, i + 74)); i += 74 }
  }
  return out.join("\r\n")
}

function buildVEvent(e: VEvent): string {
  return [
    "BEGIN:VEVENT",
    foldLine(`UID:${e.uid}`),
    foldLine(`DTSTART;TZID=Europe/London:${e.dtstart}`),
    foldLine(`DTEND;TZID=Europe/London:${e.dtend}`),
    foldLine(`SUMMARY:${escapeIcal(e.summary)}`),
    foldLine(`DESCRIPTION:${escapeIcal(e.description)}`),
    foldLine(`CATEGORIES:${e.categories}`),
    "END:VEVENT",
  ].join("\r\n")
}

function ev(
  startDate: string, startHHMM: string,
  endDate: string, endHHMM: string,
  slug: string, summary: string, description: string, categories: string,
): VEvent {
  return {
    uid: `${slug}-${startDate}@routine.isaacadjei.com`,
    summary,
    dtstart: `${startDate}T${startHHMM}00`,
    dtend: `${endDate}T${endHHMM}00`,
    description,
    categories,
  }
}

// ── Shared morning block Mon-Fri (04:15-09:00) ─────────────────────────────

function morningBlock(date: string): VEvent[] {
  return [
    ev(date, "0415", date, "0420", "wake-make-bed",
      "Wake up + make bed",
      "Start the day with purpose. Wake up and make the bed immediately - it is the first win of the day and sets the standard for discipline and order throughout.",
      "Routine"),
    ev(date, "0420", date, "0435", "morning-prayer",
      "Morning prayer",
      "Begin the day in prayer. Give thanks, hand the day to God and ask for focus, wisdom, strength and guidance. Set an intention for what matters most today.\n\nDon't forget to mark Morning Prayer on the dashboard or via Discord once complete.",
      "Routine,Faith"),
    ev(date, "0435", date, "0440", "brush-teeth-wash-face",
      "Brush teeth + wash face",
      "Morning hygiene: brush teeth for 2 minutes, floss, wash face with cold water to fully wake up. Apply eye drops now if you use them in the morning.\n\nDon't forget to mark Brush Teeth & Wash Face on the dashboard or via Discord once complete.\nDon't forget to mark Eye Drops (morning) on the dashboard or via Discord once complete.",
      "Routine,Wellbeing"),
    ev(date, "0440", date, "0445", "creatine-water-morning",
      "Creatine + water",
      "Take 5g creatine monohydrate with a full glass of water. Daily creatine at the same time each day ensures consistent muscle saturation. Take it every day including rest days - consistency is what matters, not timing around workouts.",
      "Routine,Health"),
    ev(date, "0445", date, "0600", "morning-run-walk",
      "Morning run / walk",
      "75-minute outdoor morning run or brisk walk. Aim for 5-8km. This is a daily habit that builds cardiovascular base, improves mood through endorphin release and sets a productive tone for the day. Bring water, breathe the fresh morning air. No earphones necessary - the quiet is part of it.\n\nDon't forget to mark Morning Run/Exercise on the dashboard or via Discord once complete.",
      "Routine,Fitness"),
    ev(date, "0600", date, "0615", "bodyweight-warmup",
      "Bodyweight warmup",
      "15 minutes of bodyweight exercises post-run: push-ups (3 sets to failure), bodyweight squats (3x20), lunges (3x15 each leg), plank holds (3x45 seconds), shoulder rotations and hip circles. Keeps muscles engaged and builds a baseline strength layer on top of the cardio base.",
      "Routine,Fitness"),
    ev(date, "0615", date, "0645", "shower-skincare-haircare",
      "Shower + skincare/haircare",
      "Post-run shower. Follow with your full morning skincare routine: cleanser, toner, serum, moisturiser, SPF if going outside. Style hair. You represent yourself all day - look sharp.\n\nDon't forget to mark Shower on the dashboard or via Discord once complete.\nDon't forget to mark Get Ready on the dashboard or via Discord once complete.",
      "Routine,Wellbeing"),
    ev(date, "0645", date, "0700", "lemon-ginger-tea",
      "Lemon & ginger tea",
      "Prepare and enjoy a cup of lemon and ginger tea with honey. Anti-inflammatory, supports digestion and gut health, alkalising after morning exercise. A calming ritual that bridges exercise and the structured morning session.",
      "Routine,Health"),
    ev(date, "0700", date, "0715", "protein-shake-morning",
      "Protein shake",
      "Morning protein shake - 30-40g protein within 30 minutes of finishing exercise. Blend with milk or oat milk, add banana, oats or peanut butter for extra energy. This is the nutritional foundation for muscle repair and sustained morning energy.",
      "Routine,Health"),
    ev(date, "0715", date, "0745", "bible-study",
      "Bible study",
      "30 minutes of focused, intentional Bible reading and study. Follow a structured reading plan. Journal key insights, cross-references and reflections in your faith notes on the dashboard. Pray through what you read - do not treat this as passive reading.\n\nDon't forget to mark Bible Study on the dashboard or via Discord once complete.",
      "Routine,Faith"),
    ev(date, "0745", date, "0815", "morning-reading",
      "Reading",
      "30 minutes of intentional reading: non-fiction (self-development, biography, psychology, history), engineering and technical books, research papers or long-form articles. No social media. Track progress in the dashboard library. Aim for at least one book per month.",
      "Routine,Learning"),
    ev(date, "0815", date, "0900", "relax-prep-day",
      "Relax / nap / prepare for the day",
      "Transition time after the structured morning. Review your goals and task list for the day, check the university deadlines dashboard, open any assignments that need attention. A 20-minute nap is fine if the early start is taking its toll. Set up your workspace ready for 09:00 - no friction when the main block begins.",
      "Routine"),
  ]
}

// ── Shared hydration reminders ──────────────────────────────────────────────

function hydrationMorning(date: string): VEvent {
  return ev(date, "1000", date, "1005", "hydration-morning",
    "Hydration reminder - drink water",
    "3-litre daily water goal check-in (morning). By 10:00 you should have had at least 500-750ml since waking. Refill your bottle now and aim to reach 1.5L by midday. Hydration directly improves focus, cognitive performance and energy levels.",
    "Routine,Health")
}

function hydrationEvening(date: string): VEvent {
  return ev(date, "1900", date, "1905", "hydration-evening",
    "Hydration reminder - drink water",
    "3-litre daily water goal check-in (evening). By 19:00 you should be close to 2-2.5L for the day. Top up now and finish 3L by 21:00. Avoid large amounts of water right before bed to protect sleep quality.",
    "Routine,Health")
}

// ── Mon-Thu afternoon/evening (09:00 - sleep) ───────────────────────────────

function monThuAfternoon(date: string, nextDate: string): VEvent[] {
  return [
    ev(date, "0900", date, "1630", "study-work-block",
      "Study / work / stream / relax",
      "Main productive block. Prioritise in this order: (1) university assignments, coursework and upcoming deadlines - check the deadlines dashboard before starting, (2) personal engineering projects and open-source contributions, (3) tech and engineering reading, (4) streaming or leisure once priority tasks are complete.\n\nUse Pomodoro (25 on, 5 break) or longer focus blocks (50 on, 10 break). Log study time on the Study page of the dashboard.\n\nDon't forget to mark Check & Complete Assignments and Attend Work/Uni on the dashboard or via Discord once complete.",
      "Routine,Study"),
    hydrationMorning(date),
    ev(date, "1630", date, "1700", "pre-workout",
      "Pre-workout",
      "Take pre-workout supplement 30 minutes before training. Pack your gym bag if not already ready: water bottle, towel, headphones, padlock. Change into gym clothes. Review today's session - what muscle groups, what target weights, any progression from last week.",
      "Routine,Fitness"),
    ev(date, "1700", date, "1800", "gym-session",
      "Gym session",
      "60-minute gym session. Rotate across the week: push days (chest, shoulders, triceps), pull days (back, biceps), leg and core days. Always: 5-minute warm-up, compound lifts first (bench press, squat, deadlift, overhead press), isolation exercises second, 5-minute cool-down and stretching. Track weights and reps - progressive overload every week.\n\nDon't forget to mark HIIT & Cardio on the dashboard or via Discord once complete.",
      "Routine,Fitness"),
    ev(date, "1800", date, "1830", "sauna-steam-cold",
      "Sauna / steam / cold shower",
      "Post-gym recovery. Use the sauna or steam room for 15-20 minutes if available at the gym. Follow with a cold shower (at least 2 minutes cold at the end). If sauna is unavailable, cold shower or ice bath at home works equally well - choose whichever is accessible today.\n\nDon't forget to mark Sauna / Ice Bath on the dashboard or via Discord once complete.",
      "Routine,Wellbeing"),
    ev(date, "1830", date, "1845", "protein-shake-post-gym",
      "Protein shake",
      "Post-workout protein shake - 30-40g protein within 30 minutes of finishing training. Blend with milk, add oats or banana for carbohydrates to replenish glycogen stores. This is the most important nutrition window of the day for muscle recovery and growth.",
      "Routine,Health"),
    ev(date, "1845", date, "1930", "healthy-meal-evening",
      "Healthy meal",
      "Main evening meal. Whole foods: lean protein (chicken, turkey, fish, salmon, eggs), complex carbs (rice, sweet potato, pasta, oats), plenty of vegetables and healthy fats (avocado, olive oil). Aim for 600-800 calories. Cook in batches where possible to save time across the week.\n\nDon't forget to mark Eat Healthy Meals on the dashboard or via Discord once complete.",
      "Routine,Health"),
    hydrationEvening(date),
    ev(date, "1930", date, "1945", "shower-evening-skincare",
      "Shower + evening skincare",
      "Quick evening shower to wash off the day. Full evening skincare routine: cleanser, toner, serum, moisturiser, eye cream if used. Apply eye drops now if you use them in the evening.\n\nDon't forget to mark Evening Skincare on the dashboard or via Discord once complete.\nDon't forget to mark Eye Drops (evening) on the dashboard or via Discord once complete.",
      "Routine,Wellbeing"),
    ev(date, "1945", date, "2000", "light-walk-evening",
      "Light walk",
      "15-minute post-dinner walk. Aids digestion, lowers blood sugar spikes after eating and gives a mental reset before the evening coding session. No phone scrolling - use this time to think, decompress or listen to a podcast or audiobook.\n\nDon't forget to mark Evening Walk on the dashboard or via Discord once complete.",
      "Routine,Fitness"),
    ev(date, "2000", date, "2115", "coding-tech-study",
      "Coding & tech study",
      "75-minute focused evening coding and learning session. Rotate between:\n- Competitive programming: LeetCode daily challenge and topic practice (arrays, graphs, DP, binary search), Codeforces problem sets and virtual contests\n- Engineering and tech learning: system design, computer architecture, OS concepts, networking, algorithms and data structures\n- Personal projects: dashboard features, automation scripts, open-source contributions\n- University technical modules that benefit from focused deep-work (keep separate from daytime coursework where possible)\n\nLog the session type and duration on the Study page of the dashboard. Aim for at least 3 LeetCode problems per week.\n\nDon't forget to mark Assignments/Revision/Rest on the dashboard or via Discord once complete.",
      "Routine,Study,Coding"),
    ev(date, "2115", date, "2130", "streaks-prayer-meditation",
      "Streaks + prayer + meditation",
      "Evening wind-down ritual. Mark all habits and streaks for today on the dashboard - do not let a streak break over something avoidable. Review what went well and what to improve tomorrow. Evening prayer: give thanks, reflect on the day, pray for tomorrow. 5 minutes of quiet meditation or box breathing (4-4-4-4) to calm the nervous system before sleep.\n\nDon't forget to mark all outstanding habits and streaks on the dashboard or via Discord before closing the day.\nDon't forget to mark Evening Prayer and Prepare for Next Day on the dashboard or via Discord once complete.",
      "Routine,Faith,Wellbeing"),
    ev(date, "2130", nextDate, "0415", "sleep",
      "Sleep",
      "Target 6 hours 45 minutes of sleep. Wind down fully before this: no bright screens 20 minutes before bed, room dark and cool (16-18 degrees ideal). Consistent sleep and wake times are the highest-leverage health habit - protect this window.",
      "Routine,Wellbeing"),
  ]
}

// ── Friday afternoon/evening (default: no football) ────────────────────────

function fridayAfternoon(date: string, nextDate: string): VEvent[] {
  return [
    ev(date, "0900", date, "1645", "study-work-block",
      "Study / work / stream / relax",
      "Main productive block. Prioritise in this order: (1) university assignments, coursework and upcoming deadlines - check the deadlines dashboard before starting, (2) personal engineering projects and open-source contributions, (3) tech and engineering reading, (4) streaming or leisure once priority tasks are complete.\n\nLog study time on the Study page of the dashboard.\n\nDon't forget to mark Check & Complete Assignments and Attend Work/Uni on the dashboard or via Discord once complete.",
      "Routine,Study"),
    hydrationMorning(date),
    ev(date, "1645", date, "1715", "friday-meal-early",
      "Healthy meal",
      "Early Friday dinner before the evening gym session. Eat a proper meal now: lean protein, complex carbs, vegetables. Allow at least 90 minutes before training for digestion. Aim for 500-700 calories.\n\nDon't forget to mark Eat Healthy Meals on the dashboard or via Discord once complete.",
      "Routine,Health"),
    ev(date, "1715", date, "1900", "friday-rest-leisure",
      "Rest / nap / leisure",
      "Post-dinner rest before the late evening gym session. Nap if needed (keep under 30 minutes), relax, watch something, game or browse freely. Recovery is part of the programme - do not feel guilty resting.",
      "Routine"),
    ev(date, "1900", date, "2000", "friday-gym-session",
      "Gym session",
      "Friday evening gym session - 60 minutes. Full-body or lagging muscle group focus since it is the last gym session before the Saturday HIIT and swim. Go hard and recover well over the weekend.\n\nFootball alternative (when football is on this Friday): skip gym and instead - travel to pitch 19:15, commute approximately 75 minutes; football 5-a-side or 11-a-side 20:30-21:30; commute home 21:30-22:30; protein shake and light snack 22:30-22:45; shower and recovery 22:45-23:15; sleep 23:15 (wake 09:00 Saturday). Don't forget to mark Football on the dashboard or via Discord if you played.\n\nDon't forget to mark HIIT & Cardio on the dashboard or via Discord once complete.",
      "Routine,Fitness"),
    ev(date, "2000", date, "2030", "friday-sauna-cold",
      "Sauna / steam / cold shower",
      "Post-gym recovery: sauna or steam 15-20 minutes if available, then cold shower. End-of-week recovery before the Saturday full HIIT and swimming session - take it seriously.\n\nDon't forget to mark Sauna / Ice Bath on the dashboard or via Discord once complete.",
      "Routine,Wellbeing"),
    ev(date, "2030", date, "2045", "friday-protein-shake",
      "Protein shake",
      "Post-gym protein shake - 30-40g protein. Blend with milk and add carbs (banana, oats) to replenish after the session. Prepare any snacks needed for the rest of the evening.",
      "Routine,Health"),
    ev(date, "2045", date, "2100", "friday-shower-skincare",
      "Shower + evening skincare",
      "Evening shower and full skincare routine. Apply eye drops if needed.\n\nDon't forget to mark Evening Skincare on the dashboard or via Discord once complete.\nDon't forget to mark Eye Drops (evening) on the dashboard or via Discord once complete.",
      "Routine,Wellbeing"),
    ev(date, "2100", date, "2215", "friday-coding-study",
      "Coding & tech study",
      "75-minute Friday coding and learning session. End-of-week review: push any outstanding code, solve a LeetCode problem, read an engineering article or work on a personal project. Lighter than weekday sessions if needed - but keep the habit alive every day.\n\nLog on the Study page of the dashboard.",
      "Routine,Study,Coding"),
    ev(date, "2215", date, "2230", "friday-streaks-prayer",
      "Streaks + prayer + meditation",
      "End-of-week wind-down. Mark all today's habits and streaks on the dashboard. Review the week: what you achieved, what to improve next week. Evening prayer: gratitude for the week, prayer for the weekend. Short meditation before sleep.\n\nDon't forget to mark all outstanding habits and streaks on the dashboard or via Discord before closing the day.\nDon't forget to mark Evening Prayer and Prepare for Next Day on the dashboard or via Discord once complete.",
      "Routine,Faith,Wellbeing"),
    ev(date, "2230", nextDate, "0900", "friday-sleep",
      "Sleep",
      "Friday night sleep - target 10 hours 30 minutes. A longer sleep on Friday nights compensates for the early Mon-Fri wake at 04:15 and gives the body a full recovery window before the Saturday HIIT and swimming session. Room dark and cool, no screens before bed.",
      "Routine,Wellbeing"),
  ]
}

// ── Saturday ────────────────────────────────────────────────────────────────

function saturdayEvents(date: string, nextDate: string): VEvent[] {
  return [
    ev(date, "0900", date, "0905", "sat-wake-make-bed",
      "Wake up + make bed",
      "Saturday lie-in wake at 09:00. Make the bed immediately - keep the morning ritual consistent even on weekends. The discipline builds regardless of the day.",
      "Routine"),
    ev(date, "0905", date, "0920", "sat-morning-prayer",
      "Morning prayer",
      "Saturday morning prayer. Give thanks for the rest, hand the day to God, ask for energy for the full HIIT and swim session ahead. Set weekend intentions.\n\nDon't forget to mark Morning Prayer on the dashboard or via Discord once complete.",
      "Routine,Faith"),
    ev(date, "0920", date, "0935", "sat-skincare-get-ready",
      "Skincare + get ready",
      "Morning skincare: cleanser, moisturiser, SPF. Apply eye drops if needed. Get dressed for the gym session.\n\nDon't forget to mark Get Ready on the dashboard or via Discord once complete.\nDon't forget to mark Eye Drops (morning) on the dashboard or via Discord once complete.",
      "Routine,Wellbeing"),
    ev(date, "0935", date, "0955", "sat-quiet-time",
      "Quiet time / Bible study",
      "20 minutes of quiet Bible reading or devotional. Saturday mornings are slower - use this for reflective reading rather than deep structured study. Journal any thoughts or prayers.\n\nDon't forget to mark Bible Study on the dashboard or via Discord once complete.",
      "Routine,Faith"),
    hydrationMorning(date),
    ev(date, "0955", date, "1010", "sat-lemon-ginger-tea",
      "Lemon & ginger tea",
      "Pre-gym hydration ritual. Lemon and ginger tea with honey while preparing your gym bag. Hydrate well before the HIIT session - arrive at the gym already well-hydrated.",
      "Routine,Health"),
    ev(date, "1010", date, "1020", "sat-creatine-preworkout",
      "Creatine + pre-workout",
      "Take creatine and pre-workout supplement 30 minutes before training. Pack the gym bag: water bottle, towel, headphones, swimming kit (goggles, swimwear, cap if needed), padlock. Check you have everything before leaving.",
      "Routine,Health"),
    ev(date, "1020", date, "1045", "sat-travel-gym",
      "Travel to gym",
      "25-minute journey to the gym. Walk, cycle or take public transport. Use the journey to mentally prepare: visualise the HIIT session, set performance targets for today's swim.",
      "Routine,Fitness"),
    ev(date, "1045", date, "1145", "sat-hiit-cardio",
      "Full cardio / HIIT session",
      "60-minute full-body HIIT and cardio session. Example structure: 10-minute warm-up (light jog, dynamic stretches); 40 minutes of high-intensity circuits (burpees, kettlebell swings, box jumps, rowing machine, battle ropes - rotate every 3-4 minutes); 10-minute cool-down (light jog, full-body stretches). Push the intensity - this is the weekly cardio peak session.\n\nDon't forget to mark HIIT & Cardio on the dashboard or via Discord once complete.",
      "Routine,Fitness"),
    ev(date, "1145", date, "1245", "sat-swimming",
      "Swimming session",
      "60-minute swimming session immediately after HIIT. Target: at least 1km of lap swimming. Mix strokes - freestyle (primary), breaststroke, backstroke. Swimming after HIIT provides active recovery while building cardiovascular endurance and full-body muscle engagement. Goggles and cap are essential.\n\nDon't forget to mark Swimming on the dashboard or via Discord once complete.",
      "Routine,Fitness"),
    ev(date, "1245", date, "1315", "sat-sauna-cold",
      "Sauna / steam / cold shower",
      "Post-swim recovery: sauna or steam room 15-20 minutes then cold shower. On a day this physically demanding, recovery is not optional. The heat-cold contrast reduces delayed muscle soreness, speeds tissue repair and is deeply relaxing. Take your time.\n\nDon't forget to mark Sauna / Ice Bath on the dashboard or via Discord once complete.",
      "Routine,Wellbeing"),
    ev(date, "1315", date, "1330", "sat-protein-shake-midday",
      "Protein shake",
      "Post-exercise protein shake - 30-40g protein after HIIT and swimming combined. You have been training for 2 hours. Add electrolytes (banana, coconut water) if feeling depleted. This is a priority - do not skip it.",
      "Routine,Health"),
    ev(date, "1330", date, "1430", "sat-laundry",
      "Laundry",
      "Load the laundry: gym kit, weekly clothes, towels and bedding. Start the wash cycle and let it run while you do the weekly reset. Clean kit ready for Monday.",
      "Routine,Admin"),
    ev(date, "1430", date, "1530", "sat-weekly-reset",
      "Weekly reset",
      "Saturday weekly reset - review the week and prepare for the next. Tasks: review goals progress on the dashboard, check upcoming university deadlines for next week, plan the study schedule, review finances briefly, tidy the room and desk, organise notes and files. This is your weekly governance session.\n\nDon't forget to mark Weekly Reset on the dashboard or via Discord once complete.",
      "Routine,Admin"),
    ev(date, "1530", date, "1600", "sat-shower-afternoon",
      "Shower",
      "Fresh shower after the gym, laundry and weekly reset. Apply post-shower skincare, get comfortable for the afternoon leisure block.\n\nDon't forget to mark Shower on the dashboard or via Discord once complete.",
      "Routine,Wellbeing"),
    ev(date, "1600", date, "1800", "sat-leisure",
      "Nap / gaming / assignments / leisure",
      "2-hour Saturday leisure block. Nap if needed after the intense morning session (keep naps under 30 minutes for sleep quality later). Game, watch a film, browse freely, work on personal projects or start any assignments due next week. Full freedom - this is earned recovery time.",
      "Routine"),
    ev(date, "1800", date, "1815", "sat-protein-shake-evening",
      "Protein shake",
      "Late afternoon protein shake. After a heavy training day, a second shake ensures daily protein targets are met. Aim for 150-180g total protein on intense training days.",
      "Routine,Health"),
    ev(date, "1815", date, "1900", "sat-healthy-meal-evening",
      "Healthy meal",
      "Saturday evening meal. Lean protein, complex carbs, plenty of vegetables. Reward the effort of today's session with good nutrition - do not undo it with junk food.\n\nDon't forget to mark Eat Healthy Meals on the dashboard or via Discord once complete.",
      "Routine,Health"),
    hydrationEvening(date),
    ev(date, "1900", date, "1915", "sat-light-walk",
      "Light walk",
      "15-minute post-dinner Saturday walk. Digest the meal, get some fresh air, decompress. Reflect on the week or listen to music.\n\nDon't forget to mark Evening Walk on the dashboard or via Discord once complete.",
      "Routine,Fitness"),
    ev(date, "1915", date, "2045", "sat-evening-study-leisure",
      "Study / gaming / assignments / relax",
      "Saturday evening leisure and optional study. Complete any outstanding coursework, work on personal projects or simply relax. If there are deadlines approaching this week, use this time wisely. Log any study on the Study page of the dashboard.",
      "Routine,Study"),
    ev(date, "2045", date, "2100", "sat-streaks-prayer",
      "Streaks + prayer + meditation",
      "Saturday wind-down. Mark all habits and streaks on the dashboard. Saturday reflection: how did the week go? What were the wins? What needs improvement next week? Evening prayer: gratitude and reflection. Short meditation before sleep.\n\nDon't forget to mark all outstanding habits and streaks on the dashboard or via Discord before closing the day.\nDon't forget to mark Evening Prayer and Prepare for Next Day on the dashboard or via Discord once complete.",
      "Routine,Faith,Wellbeing"),
    ev(date, "2100", nextDate, "0830", "sat-sleep",
      "Sleep",
      "Saturday night sleep - target 11 hours 30 minutes. The longest sleep of the week after the most physically demanding day. Deep sleep is essential for full recovery from HIIT and swimming. Dark room, cool temperature, no screens before bed.",
      "Routine,Wellbeing"),
  ]
}

// ── Sunday ──────────────────────────────────────────────────────────────────

function sundayEvents(date: string, nextDate: string): VEvent[] {
  return [
    ev(date, "0830", date, "0835", "sun-wake-make-bed",
      "Wake up + make bed",
      "Sunday wake at 08:30. Make the bed, start the day with the same intention as every other day. Sunday is a day of rest, reflection and preparation for the week ahead - but it still begins with the same discipline.",
      "Routine"),
    ev(date, "0835", date, "0850", "sun-morning-prayer",
      "Morning prayer",
      "Sunday morning prayer - take more time than usual. Give thanks, pray for the week ahead, for family, for the church service. Set spiritual intentions for the day.\n\nDon't forget to mark Morning Prayer on the dashboard or via Discord once complete.",
      "Routine,Faith"),
    ev(date, "0850", date, "0905", "sun-skincare-get-ready",
      "Skincare + get ready",
      "Morning skincare routine. Apply eye drops if needed in the morning.\n\nDon't forget to mark Get Ready on the dashboard or via Discord once complete.\nDon't forget to mark Eye Drops (morning) on the dashboard or via Discord once complete.",
      "Routine,Wellbeing"),
    ev(date, "0905", date, "0915", "sun-lemon-ginger-tea",
      "Lemon & ginger tea",
      "Sunday morning lemon and ginger tea. Slow morning ritual - enjoy the quiet before the training session. No rush.",
      "Routine,Health"),
    ev(date, "0915", date, "0930", "sun-creatine-preworkout",
      "Creatine + pre-workout",
      "Take creatine and pre-workout 30 minutes before training. Prepare the gym bag for the cardio and leg session.",
      "Routine,Health"),
    ev(date, "0930", date, "1030", "sun-cardio-leg-day",
      "Cardio / leg day",
      "60-minute Sunday training session. Focus on legs and core with cardio: 10-minute warm-up; squat variations (back squat, goblet squat, Bulgarian split squat); Romanian deadlifts; leg press; leg curls; calf raises; plank and core work; 10-minute cool-down. Alternatively: 30-minute treadmill run followed by 30 minutes of leg and core work. Track weights and reps.\n\nDon't forget to mark HIIT & Cardio on the dashboard or via Discord once complete.",
      "Routine,Fitness"),
    hydrationMorning(date),
    ev(date, "1030", date, "1045", "sun-protein-shake-morning",
      "Protein shake",
      "Post-training protein shake - 30-40g protein immediately after the session. Add creatine if not already taken. Drink before church prep begins.",
      "Routine,Health"),
    ev(date, "1045", date, "1100", "sun-church-prep",
      "Church prep + get ready",
      "Get ready for church: shower quickly if needed, choose and iron smart clothes, pack Bible and any notes. Leave the house looking your best. Check the time and plan the journey so you are not rushing.\n\nDon't forget to mark Get Ready on the dashboard or via Discord once complete.",
      "Routine,Faith"),
    ev(date, "1100", date, "1130", "sun-travel-church",
      "Travel to church",
      "30-minute journey to church. Use the travel time to read a Psalm, review the passage for today or pray quietly. Arrive ready to worship.",
      "Routine,Faith"),
    ev(date, "1130", date, "1330", "sun-church-service",
      "Church service",
      "2-hour church service. Engage fully: worship, listen to the sermon with intention, take notes on key messages. Speak to people, build community relationships. Church attendance is both a spiritual discipline and a social anchor.\n\nDon't forget to mark Church on the dashboard or via Discord once complete.",
      "Routine,Faith"),
    ev(date, "1330", date, "1430", "sun-post-church-rest",
      "Return home + post-church rest",
      "Travel home and decompress after the service. Reflect on the sermon, journal any thoughts or convictions. Rest and hydrate - you have been active since 09:30 with training and church.",
      "Routine"),
    ev(date, "1430", date, "1530", "sun-healthy-meal",
      "Healthy meal",
      "Sunday main meal - often the best meal of the week. Cook a proper meal: roast chicken, rice and peas, jollof, pasta bake or any substantial whole-food meal. Aim for 700-900 calories. Sunday lunch and early dinner combined.\n\nDon't forget to mark Eat Healthy Meals on the dashboard or via Discord once complete.",
      "Routine,Health"),
    ev(date, "1530", date, "1700", "sun-rest-leisure",
      "Rest / assignments / leisure",
      "Sunday afternoon leisure. Rest, game, watch a film or work on any outstanding assignments. Recovery time before the week restarts. If there are urgent deadlines, prioritise them now rather than leaving them for Monday morning.",
      "Routine"),
    ev(date, "1700", date, "1715", "sun-light-walk",
      "Light walk",
      "Sunday evening walk. Digest the main meal, get some air, decompress before the evening reflection and study session.\n\nDon't forget to mark Evening Walk on the dashboard or via Discord once complete.",
      "Routine,Fitness"),
    ev(date, "1715", date, "1900", "sun-evening-leisure-study",
      "Study / leisure / gaming",
      "Sunday evening free block. Study if the week ahead has deadlines - check the university timetable and deadlines dashboard, review Monday's assignments and plan the study block for tomorrow. Otherwise: gaming, relaxed learning or leisure. Use this time to prepare for the week that starts at 04:15 Monday.",
      "Routine,Study"),
    hydrationEvening(date),
    ev(date, "1900", date, "2045", "sun-sunday-reflection",
      "Sunday reflection",
      "Weekly Sunday reflection and week preparation session. Review the week just passed: what habits were kept, what streaks were maintained, what goals advanced. Mark any remaining habits for the week on the dashboard. Plan next week: deadlines, study schedule, appointments and any events. Journal key reflections and decisions.\n\nDon't forget to mark Sunday Reflection on the dashboard or via Discord once complete.",
      "Routine,Faith,Wellbeing"),
    ev(date, "2045", date, "2100", "sun-streaks-prayer",
      "Streaks + prayer + meditation",
      "Sunday wind-down. Final habit and streak check for the entire week on the dashboard - ensure nothing was missed. Evening prayer: gratitude for the week, prayers for the new week, surrender the unknowns. 5-minute meditation or deep breathing before sleep.\n\nDon't forget to mark all outstanding habits and streaks for the week on the dashboard or via Discord.\nDon't forget to mark Evening Prayer on the dashboard or via Discord once complete.",
      "Routine,Faith,Wellbeing"),
    ev(date, "2100", nextDate, "0415", "sun-sleep",
      "Sleep",
      "Sunday night sleep - target 7 hours 15 minutes ahead of the 04:15 Monday wake. This is the bridge back into the weekday routine. Room dark and cool, no screens, consistent bed time. Monday starts early - protect this sleep window.",
      "Routine,Wellbeing"),
  ]
}

// ── Feed builder ─────────────────────────────────────────────────────────────

function generateAllEvents(): VEvent[] {
  const w = getWeekDates()
  return [
    ...morningBlock(w.mon), ...monThuAfternoon(w.mon, w.tue),
    ...morningBlock(w.tue), ...monThuAfternoon(w.tue, w.wed),
    ...morningBlock(w.wed), ...monThuAfternoon(w.wed, w.thu),
    ...morningBlock(w.thu), ...monThuAfternoon(w.thu, w.fri),
    ...morningBlock(w.fri), ...fridayAfternoon(w.fri, w.sat),
    ...saturdayEvents(w.sat, w.sun),
    ...sundayEvents(w.sun, w.nextMon),
  ]
}

export function buildRoutineIcal(): string {
  const events = generateAllEvents()
  const w = getWeekDates()

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Isaac Adjei//Daily Routine//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "X-WR-CALNAME:Routine",
    "X-WR-TIMEZONE:Europe/London",
    `X-WR-CALDESC:Isaac Adjei weekly routine - ${w.mon} to ${w.sun}`,
    ...events.map(buildVEvent),
    "END:VCALENDAR",
  ].join("\r\n")
}
