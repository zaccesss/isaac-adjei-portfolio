export const metadata = { robots: "noindex, nofollow" }

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{title}</p>
      {children}
    </div>
  )
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="border border-border rounded-lg p-4 bg-card flex flex-col gap-2">
      {children}
    </div>
  )
}

function List({ items }: { items: string[] }) {
  return (
    <ul className="flex flex-col gap-1">
      {items.map((item, i) => (
        <li key={i} className="text-sm text-muted-foreground flex gap-1.5">
          <span className="text-foreground/30 shrink-0 mt-0.5">-</span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  )
}

function BoundaryItem({ label, allowed }: { label: string; allowed: boolean }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className={`shrink-0 text-xs font-bold ${allowed ? "text-green-600 dark:text-green-400" : "text-red-500 dark:text-red-400"}`}>
        {allowed ? "YES" : "NO"}
      </span>
      <span className="text-muted-foreground">{label}</span>
    </div>
  )
}

export default function UsPage() {
  return (
    <div className="flex flex-col gap-10 max-w-3xl">
      <div>
        <h1 className="text-xl font-semibold">Zac x Pam</h1>
        <p className="text-sm text-muted-foreground mt-1">Our covenant and foundation book - private</p>
      </div>

      {/* Vision & Mission */}
      <Section title="Vision">
        <Card>
          <p className="text-sm">To build a God-centered relationship rooted in love, trust and discipline while honouring our boundaries, growing through faith and experience, and preparing a strong foundation for marriage and lifelong partnership.</p>
        </Card>
      </Section>

      <Section title="Mission">
        <Card>
          <p className="text-sm">To honour God in our relationship by keeping clear boundaries, nurturing trust and intimacy in healthy ways, practicing daily love and respect, and supporting each other&apos;s growth as we journey toward marriage.</p>
        </Card>
      </Section>

      {/* Notes */}
      <Section title="Notes and Reminders">
        <Card>
          <List items={[
            "All ruled-out activities (mainly to do with intimacy) must remain ruled out",
            "No indoors activities until the relationship is made official. Even then, activities should only glorify God (e.g. praying together, cooking together)",
            "No meetings until December 1-31st, when the relationship will be made official",
            "Every Tuesday at 7pm is Bible study (taking turns to lead)",
            "Every Sunday evening is Reflection Sunday",
            "Certain things in this note are subject to change over time, but only if both of us fully agree",
          ]} />
        </Card>
      </Section>

      {/* Traditions & Promises */}
      <Section title="Traditions and Promises">
        <Card>
          <List items={[
            "Not going to bed upset at one another",
            "Not going days without talking (snap, picture or quick message to avoid overthinking)",
            "Calling at least once every day",
            "Resolving conflicts instantly - no silent treatment, no dragging issues",
            "Always ending calls on a positive note (blessing, prayer or kind word)",
            "Apologising quickly when wrong and forgiving quickly when hurt",
            "Sharing one appreciation or gratitude each day",
            "Checking in on each other's wellbeing daily (mental, emotional, physical)",
            "Praying for each other every morning and night, even if apart",
            "Whenever we have a disagreement, schedule a proper sit-down call within 48 hours - calm, intentional, no leaving things unsettled",
            "Keep gifts as a surprise until the day",
          ]} />
        </Card>
      </Section>

      {/* Pledges */}
      <Section title="Our Pledges">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Card>
            <p className="text-xs font-semibold text-muted-foreground">Pamela&apos;s Pledge</p>
            <p className="text-sm">I, Pamela Abena Afrakoma Awuah, promise to love you, support you, and stand by you as we grow together. I will cherish our bond, listen to you, and respect your thoughts, feelings and dreams - while keeping God at the center of everything we do.</p>
            <p className="text-xs text-muted-foreground italic mt-1">Signed, @Pamela Awuah</p>
          </Card>
          <Card>
            <p className="text-xs font-semibold text-muted-foreground">Isaac&apos;s Pledge</p>
            <p className="text-sm">I, Isaac Papa Nii Adjei, promise to love you, support you, and stand by you as we grow together. I will cherish our bond, listen to you, and respect your thoughts, feelings and dreams while keeping God at the center of everything we do.</p>
            <p className="text-xs text-muted-foreground italic mt-1">Signed, @Isaac Adjei</p>
          </Card>
        </div>
      </Section>

      {/* Q&A */}
      <Section title="Questions and Answers">
        {[
          {
            q: "How do you feel about children in the future?",
            pamAns: "I want to have children but I also want to adopt a child one day too. Having two parents that prioritise God and love - patience, kindness, peace and self control especially in moments of disagreement.",
            zacAns: "Children are a blessing from the Lord (Psalm 127:3). I want children one day but believe we should build a strong foundation first - spiritually, emotionally and practically. Also open to adoption.",
          },
          {
            q: "How do you like to handle disagreements?",
            pamAns: "Talking it out together. Sometimes I go quiet after letting it out, I can be distant and need comfort and reassurance. What matters is talking about it in the end.",
            zacAns: "With respect, patience, honesty and love (James 1:19). Listen fully before responding, pray together and focus on understanding each other - not winning. Conflicts should bring us closer.",
          },
          {
            q: "What does quality time look like for you?",
            pamAns: "Checking in with each other, making sure we've gotten things done, calling, texting. Encouraging and being honest, worship music, reading Bible verses, praying together.",
            zacAns: "Simple moments - praying together, cooking, taking a walk, just talking about life. Being present matters more than what we're doing. Little consistent moments mean the most.",
          },
          {
            q: "What are your expectations for balancing work and studies?",
            pamAns: "Always put studies and work first, having a timetable. The love will always be there - it's important to put those first as they shape who we are individually.",
            zacAns: "Give the best to our personal responsibilities but intentionally carve out time to connect and make time together and for God. 'To everything there is a season' (Ecclesiastes 3:1).",
          },
        ].map(({ q, pamAns, zacAns }) => (
          <Card key={q}>
            <p className="text-sm font-medium">{q}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-1">
              <div>
                <p className="text-xs font-semibold text-muted-foreground mb-1">Pam</p>
                <p className="text-xs text-muted-foreground">{pamAns}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground mb-1">Zac</p>
                <p className="text-xs text-muted-foreground">{zacAns}</p>
              </div>
            </div>
          </Card>
        ))}
      </Section>

      {/* Intimacy Boundaries */}
      <Section title="Intimacy Levels and Boundaries">
        <Card>
          <p className="text-sm font-medium mb-2">Physical - Casual/Friendly</p>
          <div className="flex flex-col gap-1">
            <BoundaryItem label="High-fives, fist bumps, playful taps" allowed={true} />
            <BoundaryItem label="Side hugs or quick embraces" allowed={false} />
            <BoundaryItem label="Patting on the shoulder or back" allowed={true} />
            <BoundaryItem label="Light arm touches while talking" allowed={true} />
            <BoundaryItem label="Linking arms when walking" allowed={true} />
          </div>
        </Card>
        <Card>
          <p className="text-sm font-medium mb-2">Physical - Warm/Comforting</p>
          <div className="flex flex-col gap-1">
            <BoundaryItem label="Full hugs (5s, depending on atmosphere)" allowed={false} />
            <BoundaryItem label="Resting head on their shoulder" allowed={true} />
            <BoundaryItem label="Holding hands loosely (palm-to-palm)" allowed={true} />
            <BoundaryItem label="Kissing hands" allowed={false} />
            <BoundaryItem label="Leaning against each other while sitting" allowed={true} />
            <BoundaryItem label="Brushing hair out of their face" allowed={true} />
            <BoundaryItem label="Gentle back rubs" allowed={false} />
            <BoundaryItem label="Hand around shoulders" allowed={true} />
            <BoundaryItem label="Resting head on their lap" allowed={false} />
            <BoundaryItem label="Carrying the person" allowed={false} />
          </div>
        </Card>
        <Card>
          <p className="text-sm font-medium mb-2">Physical - Romantic/Intimate</p>
          <div className="flex flex-col gap-1">
            <BoundaryItem label="Interlacing fingers when holding hands" allowed={true} />
            <BoundaryItem label="Resting hand on their thigh or waist" allowed={false} />
            <BoundaryItem label="Laying on chest / laying forehead whilst sitting" allowed={false} />
            <BoundaryItem label="Long cuddling or spooning sessions" allowed={false} />
            <BoundaryItem label="Kisses on the cheek, forehead" allowed={false} />
            <BoundaryItem label="Sitting on each other's lap" allowed={false} />
            <BoundaryItem label="Tracing shapes on skin or playing with hair" allowed={false} />
            <BoundaryItem label="Massaging shoulders, neck or feet" allowed={false} />
          </div>
        </Card>
        <Card>
          <p className="text-sm font-medium mb-2">Physical - Deeply Intimate (all no)</p>
          <div className="flex flex-col gap-1">
            <BoundaryItem label="Kissing on the lips (lingering or passionate)" allowed={false} />
            <BoundaryItem label="Kissing on the neck, jawline or ears" allowed={false} />
            <BoundaryItem label="Stroking their face while making eye contact" allowed={false} />
            <BoundaryItem label="Lying with heads or legs intertwined" allowed={false} />
            <BoundaryItem label="Wrapping arms fully around each other under a blanket" allowed={false} />
            <BoundaryItem label="Gentle body caresses (no waist, chest or thighs)" allowed={false} />
          </div>
        </Card>
        <Card>
          <p className="text-sm font-medium mb-2">All other intimacy types (emotional, intellectual, spiritual, creative)</p>
          <p className="text-xs text-green-600 dark:text-green-400 font-medium">All YES - these are encouraged and valued</p>
        </Card>
        <Card>
          <p className="text-sm font-medium mb-2">Social Media</p>
          <div className="flex flex-col gap-1">
            <BoundaryItem label="Post on any platform (Snap, Insta, finsta)" allowed={true} />
            <BoundaryItem label="Post from side, behind or partly showing - not full face" allowed={true} />
            <BoundaryItem label="Post when out together" allowed={true} />
            <BoundaryItem label="Reply to each other's story privately" allowed={true} />
            <BoundaryItem label="Show full face" allowed={false} />
            <BoundaryItem label="Tag each other" allowed={false} />
            <BoundaryItem label="Comment publicly on TikTok or Insta" allowed={false} />
          </div>
        </Card>
      </Section>

      {/* Our Routines */}
      <Section title="Our Routines">
        {/* Zac's Routine */}
        <Card>
          <p className="text-sm font-semibold mb-2">Zac - Monday to Friday</p>
          <div className="flex flex-col gap-1 text-xs text-muted-foreground">
            <p className="font-medium text-foreground mt-1">Morning (5:15AM - 9:45AM)</p>
            {[
              "5:15 - 5:45 AM: Wake up, make bed, pray/morning devotion, brush teeth",
              "5:45 - 6:00 AM: Creatine (3-5g) + water, walk to gym",
              "6:00 - 7:00 AM: Gym session (strength, cardio or mix)",
              "7:00 - 7:15 AM: Bodyweight (push-ups, planks, squats)",
              "7:15 - 8:00 AM: Shower + skincare/haircare",
              "8:00 - 8:15 AM: Lemon & ginger tea + protein shake (30g protein)",
              "8:15 - 9:15 AM: Bible study/Quiet Time (30 mins) and reading (30 mins)",
              "9:15 - 9:45 AM: Relax/nap, prepare for the day",
            ].map((s, i) => <p key={i}>- {s}</p>)}
            <p className="font-medium text-foreground mt-2">Afternoon (9:45AM - 5:45PM)</p>
            <p>- Study (Uni lectures, labs, tutorials), work, stream, relax</p>
            <p>- Stay hydrated (3L water goal)</p>
            <p className="font-medium text-foreground mt-2">Evening (5:45PM - 10:00PM)</p>
            {[
              "5:45 PM: Pre-workout/stretch",
              "6:00 - 7:00 PM: Evening walk (1 hour, minimum 10k steps)",
              "7:00 - 7:30 PM: Sauna/steam/ice bath (10-12 mins)",
              "7:30 - 8:30 PM: Protein shake + healthy meal + shower & skincare",
              "8:30 - 8:45 PM: Light walk after eating",
              "8:45 - 9:45 PM: Relax/leisure or assignments/study - Bible study/Devotion",
              "9:45 PM: Pray/wind down",
              "10:00 PM: Sleep",
            ].map((s, i) => <p key={i}>- {s}</p>)}
          </div>
        </Card>

        <Card>
          <p className="text-sm font-semibold mb-2">Zac - Saturday (Swimming Day)</p>
          <div className="flex flex-col gap-1 text-xs text-muted-foreground">
            {[
              "9:00 - 10:30 AM: Wake up, make bed, pray, skincare, quiet time, tea, creatine & pre-workout",
              "10:45 AM - 12 PM: Full-Body HIIT & Conditioning + Full cardio",
              "12:00 - 12:45 PM: Swimming/sauna session/ice bath",
              "12:45 - 1:15 PM: Sauna/steam",
              "1:15 PM: Protein shake (post-workout)",
              "1:30 - 6:00 PM: Laundry + weekly reset, nap, gaming, assignments or leisure, virtual date",
              "6:00 - 8:00 PM: Healthy meal + protein shake, quick walk",
              "8:00 - 9:45 PM: Study, gaming, assignments, relax, virtual date or piano lessons",
              "9:45 - 10:00 PM: Pray/wind down",
              "10:00 PM: Sleep",
            ].map((s, i) => <p key={i}>- {s}</p>)}
          </div>
        </Card>

        <Card>
          <p className="text-sm font-semibold mb-2">Zac - Sunday (Rest, Church and Reflection)</p>
          <div className="flex flex-col gap-1 text-xs text-muted-foreground">
            {[
              "8:30 - 10:30 AM: Wake up, make bed, pray, skincare, tea + creatine, morning walk, protein shake",
              "10:30 AM - 4:30 PM: Church (London, Birmingham or Leicester)",
              "4:30 - 6:00 PM: Healthy meal + protein, shower",
              "6:00 - 9:45 PM: Study, games or leisure, virtual date, weekly reflection with Pam (Reflection Sunday)",
              "9:45 - 10:00 PM: Pray/wind down",
              "10:00 PM: Sleep",
            ].map((s, i) => <p key={i}>- {s}</p>)}
          </div>
        </Card>

        {/* Pam's Routine */}
        <Card>
          <p className="text-sm font-semibold mb-2">Pam - Monday to Friday</p>
          <div className="flex flex-col gap-1 text-xs text-muted-foreground">
            {[
              "6:00 AM: Wake up, kneel on bed, thank God in prayer",
              "6:05 AM: Make bed, put on soft gospel music, open curtains for fresh air",
              "6:15 AM: Shower, brush teeth, skincare, lotion",
              "6:35 AM: Dress up for the day (including hair)",
              "6:50 AM: Vitamins, tea/light breakfast",
              "7:10 AM: Read a short Bible passage/devotion, pray over the day",
              "7:30 AM: Check on mum and brothers, check on dad",
              "7:50 AM: Write/reflect To-Do list in book",
              "8:00 AM: Begin the day (study, classes, etc.)",
            ].map((s, i) => <p key={i}>- {s}</p>)}
            <p className="font-medium text-foreground mt-2">Early-finish lecture days (before 4PM):</p>
            {[
              "1:30 - 4:30 PM: Study block (2x90 min blocks with break)",
              "4:30 - 5:15 PM: Light reset (stretch, short walk, tidy)",
              "5:30 PM: Dinner",
              "6:30 PM: Shower",
              "7:00 - 8:30 PM: Quiet Time",
              "8:30 - 9:00 PM: Wind down",
              "9:00-9:30 PM: Family prayers - Sleep",
            ].map((s, i) => <p key={i}>- {s}</p>)}
            <p className="font-medium text-foreground mt-2">Late-finish lecture days (4PM):</p>
            {[
              "4:30 - 5:15 PM: Light revision (quick recap of notes, highlight key points)",
              "5:30 PM: Dinner",
              "6:30 PM: Shower",
              "7:00 - 8:30 PM: Quiet Time",
              "8:30 - 9:00 PM: Wind down",
              "9:00-9:30 PM: Family prayers - Sleep",
            ].map((s, i) => <p key={i}>- {s}</p>)}
            <p className="font-medium text-foreground mt-2">Friday - Driving Focus:</p>
            {[
              "Morning: Gym/errands/chores",
              "1:00 - 4:00 PM: Deep driving practice (theory + mock tests)",
              "5:30 PM: Dinner",
              "6:30 PM: Shower",
              "7:00 - 8:30 PM: Quiet Time",
              "9:00-9:30 PM: Family prayers - Sleep",
            ].map((s, i) => <p key={i}>- {s}</p>)}
          </div>
        </Card>

        <Card>
          <p className="text-sm font-semibold mb-2">Pam - Saturday</p>
          <div className="flex flex-col gap-1 text-xs text-muted-foreground">
            {[
              "6:00 AM: Wake up, prayer and gratitude, make bed, open curtains",
              "7:00 AM: Gym session, shower + skincare after",
              "9:00 AM: Breakfast/light snack, laundry or errands",
              "10:00 AM: Study/assignments/revision",
              "1:00 PM: Grocery shopping/cooking or relax/hobbies",
              "5:30 PM: Dinner",
              "6:30 PM: Shower",
              "7:00 - 8:30 PM: Quiet Time",
              "8:30 - 9:00 PM: Wind down",
              "9:00 PM: Sleep",
            ].map((s, i) => <p key={i}>- {s}</p>)}
          </div>
        </Card>

        <Card>
          <p className="text-sm font-semibold mb-2">Pam - Sunday</p>
          <div className="flex flex-col gap-1 text-xs text-muted-foreground">
            {[
              "6:00 AM: Wake up, morning prayer, make bed, curtains, fresh air",
              "7:00 AM: Gym session, shower + skincare after",
              "9:00 AM: Breakfast/tea, light chores",
              "10:30 AM: Study Bible, listen to sermon or journal reflections",
              "12:30 PM: Light assignments, review or prep for the week",
              "3:00 PM: Grocery/cooking/relax/family time or TikTok content (optional)",
              "5:30 PM: Dinner",
              "6:30 PM: Shower",
              "7:00 - 8:30 PM: Quiet Time",
              "9:00 PM: Virtual Bible study with family, prayer and reflection",
            ].map((s, i) => <p key={i}>- {s}</p>)}
          </div>
        </Card>
      </Section>

      {/* Notes about Pam */}
      <Section title="Notes about Pam">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Card>
            <p className="text-sm font-medium mb-2">Things she likes</p>
            <List items={[
              "Nature",
              "The ocean",
              "Hot or cold weather (depends on the day)",
              "Wants to visit Hawaii",
              "Oreo biscuits",
              "Red velvet cake",
              "Onion and cheese bake",
              "Chocolate",
              "Anything KFC (mainly chicken)",
              "Mayo and bread",
              "Chinese (mainly fried rice, also chow mein and garlic prawn dumplings)",
              "Fanta fruit twist and Coke",
              "Hugs",
              "Waakye",
            ]} />
          </Card>
          <Card>
            <p className="text-sm font-medium mb-2">Things she doesn&apos;t like</p>
            <List items={[
              "Bananas",
              "Raw and cut tomatoes",
            ]} />
            <p className="text-sm font-medium mb-2 mt-4">Things to remember</p>
            <List items={[
              "Sometimes gets distant or doesn't reply",
              "Sometimes cries",
              "Wants to visit Hawaii",
            ]} />
          </Card>
        </div>
      </Section>
    </div>
  )
}
