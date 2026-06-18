import type { BlogPost } from "../index"

const _another_year_another_lesson: BlogPost = {
    slug: "another-year-another-lesson",
    title: "Another Year, Another Lesson",
    date: "2026-06-25",
    type: "journal",
    cover_image: "/images/blog/covers/another-year-another-lesson.webp",
    description:
      "Another year older. Reflections on what this year has shown me: the projects built, the research published, the doors opened, what my father taught me and what I am still learning about who I am becoming.",
    tags: ["Personal", "Reflection", "Faith", "Growth", "Journal", "Ghana"],
    published: true,
    content: [
      {
        type: "h2",
        text: "Acknowledgements",
      },
      {
        type: "p",
        text: "Before anything else, I want to acknowledge the people who made every year possible. To God, for another year of life, provision and grace. For favour that I did not earn and for doors that opened when they logically should not have. To my late father, whose hands built things and whose words, \"Always strive to make things better\", still run underneath everything I do. I hope you are proud, Dad. To my mum, who has carried this family with more strength than I can fully articulate, who has never stopped believing in us even when believing cost her something. And to my siblings: every good thing I build is built with you in mind. This one is for all of you.",
      },
      {
        type: "divider",
      },
      {
        type: "p",
        text: "Another year older. I will not name the number because I do not think the number is the point. Numbers mark time. What matters is what the time actually contained. And this year contained more than most.",
      },
      {
        type: "h2",
        text: "Where I started from",
      },
      {
        type: "p",
        text: "I think about this every year on this day: where the journey began, and how unlikely it looked from there. I grew up in Ghana, lost the sight in my right eye at two years old after surgery for suspected retinoblastoma, missed the first years of school because of it, attended [Adisadel College](https://en.wikipedia.org/wiki/Adisadel_College) in Cape Coast where the motto is Vel Primus, Vel Cum Primis (either the first, or with the first), lost my father in 2021, moved to the UK in April 2022 with no formal technical education behind me, enrolled at Stanmore College on a business course and switched to engineering two months in by sitting the entrance exams and catching up while working part-time.",
      },
      {
        type: "p",
        text: "I graduated from Stanmore with D*DD and was named Best and Most Hardworking Student. Then Aston University. Then the work really started.",
      },
      {
        type: "p",
        text: "I write this not to perform the backstory but because I genuinely need to look back at it from where I am standing now. The distance between those two points is not small. And the distance is not really mine: it is God's, and my mum's, and my father's, carried forward through me.",
      },
      {
        type: "h2",
        text: "What this year actually built",
      },
      {
        type: "p",
        text: "[git-unlocked](https://github.com/zaccesss/git-unlocked) was formally published on [Zenodo](https://zenodo.org/records/20694984) with a citable DOI this year. That sentence does not fully capture what it meant. git-unlocked is a complete open source Git curriculum: 217 files, every concept written and structured from scratch, MIT licensed. Publishing it formally on Zenodo with a DOI meant giving it a permanent academic record, an ORCID credit, a Google Scholar listing. That is my first peer-citable research output. I did not plan that. It grew from wanting to teach Git properly and then not stopping until the thing was complete.",
      },
      {
        type: "p",
        text: "[Phaemos](https://phaemos.com) is further along than it has ever been. It is a predictive maintenance platform using IoT sensor data and machine learning, and it is a real thing now, not a side project in the abstract. avr-zac is bare-metal C running on an ATmega644P: no HAL, no abstraction layer, just registers and timing and understanding exactly what the hardware is doing. The audio amplifier is a TL071 active filter and OPA551 unity-gain output buffer, designed, simulated, fabricated and tested by hand. I built a World Cup 2026 AI predictor. I have been doing competitive programming consistently for the first time since I started. I ran over 50 kilometres for [Cancer Research UK](https://www.cancerresearchuk.org) during the 10 Days of 5K Challenge.",
      },
      {
        type: "p",
        text: "None of these were assigned. Nobody set a deadline for any of them. That matters to me.",
      },
      {
        type: "h2",
        text: "The Sky invitation",
      },
      {
        type: "p",
        text: "Yesterday I was at [Sky](https://www.sky.com)'s campus in Osterley, West London, for the Black Heritage Undergraduate of the Year Celebration Day. I was a finalist. Being in that room, surrounded by people who had built and contributed and been recognised for it, the fireside chat with this year's winner Valerie Fiamavle and last year's winner Nigel Danquah-Kuma, the conversations with Sky professionals across technology and product and media, all of it landed heavily. I wrote about the day properly in [the post before this one](/blog/sky-black-heritage-celebration-day). But the part I want to say here is this: I did not expect to get that invitation. And every time something like that happens, I come back to the same realisation.",
      },
      {
        type: "p",
        text: "The rooms you get into are almost always the product of the work you did when no one was watching. The Sky application asked about impact and character. git-unlocked exists because I wanted to teach something properly. Phaemos exists because I wanted to understand how production ML systems work. The amplifier exists because I wanted to know how hardware behaves at the signal level, not just in simulation. None of that was done for the application. The application just asked about who I already was.",
      },
      {
        type: "h2",
        text: "My father's words",
      },
      {
        type: "p",
        text: "He used to say: always strive to make things better. I understood that phrase differently when I was young. I thought it meant improvement, iteration, fixing what was broken. I think now it means something larger: that the posture of an engineer, and really the posture of a person, should be one of active contribution. Not passive consumption. Not waiting for someone else to fix things. Building.",
      },
      {
        type: "p",
        text: "He was a mechanical and refrigeration engineer. He fixed things other people had given up on. He did it calmly and methodically. I absorbed that watching him work, without knowing I was learning anything. He has been gone since 2021 and I still hear him in the way I approach problems.",
      },
      {
        type: "p",
        text: "One of the things that hits hardest on a birthday is the awareness that he cannot see any of this. He cannot see the PCB, the Zenodo record, the Aston results, the Sky campus day. But I believe he would have understood every single one of them. And I build them partly for that reason.",
      },
      {
        type: "h2",
        text: "What my constraints taught me",
      },
      {
        type: "p",
        text: "Living with monocular vision has shaped how I think about technology in ways I did not expect. Zaccess, the accessibility tool I built using OCR and text-to-speech to convert lecture slides into readable notes, did not start as a project with a vision statement. It started because I was struggling to read slides and decided to fix that. When I shared it with another visually impaired student and he told me it saved him hours every week, something shifted for me.",
      },
      {
        type: "p",
        text: "The limitations you live with are not separate from the engineer you become. Sometimes they are the direction. I build things that solve real problems partly because I have had real problems to solve. That is not a hardship story. That is just a true one.",
      },
      {
        type: "h2",
        text: "Piano and the things that have no shortcut",
      },
      {
        type: "p",
        text: "I have been practising piano this year in a more committed way than before. There is something about it that software cannot give me. The same passage, hands separate, slowing the tempo down until it is clean, then building it back up, is a discipline that has no equivalent in code. You cannot grep the problem. You cannot refactor the fingering into something more elegant. You sit with it until it works.",
      },
      {
        type: "p",
        text: "It has been a useful corrective. I spend a lot of time in environments that reward speed: fast iteration, quick debugging, clean deploys. Piano is the opposite. It rewards patience and repetition and incremental honesty about whether you have actually learned the thing or just learned to fake it at tempo.",
      },
      {
        type: "h2",
        text: "Faith",
      },
      {
        type: "p",
        text: "I am a Christian and that is not a footnote. It runs through everything I have described above. There were moments this year, and in every year, where things could have gone differently. The Zenodo record being the first of its kind from me. The Sky invitation arriving. The Aston work holding up. There is too much specificity in the provision for me to attribute it to effort alone. Effort was there. So was something else.",
      },
      {
        type: "p",
        text: "Faith has kept me grounded in seasons where I did not know what the outcome would be. It is the constant underneath everything else I have written here. I do not talk about it to mark myself as distinct. I talk about it because it is true.",
      },
      {
        type: "h2",
        text: "What I am carrying forward",
      },
      {
        type: "p",
        text: "The lesson this year reinforced most clearly: start before you are ready, document as you go and finish what you start. git-unlocked was not finished when I first thought it might be finished. Phaemos is still not finished. avr-zac is not finished. But they all exist, and existing is worth more than planning to exist.",
      },
      {
        type: "p",
        text: "I am also carrying forward a clearer sense of what I want to build. Embedded systems and real hardware. Production ML pipelines. Accessible tools. Open curriculum. Things that help people understand how systems work or make those systems work better. The thread running through all of it is the same thread that was already there in Adisadel, at Stanmore, at Aston: always strive to make things better.",
      },
      {
        type: "p",
        text: "Another year. Another lesson. Grateful for all of it. On to the next one.",
      },
    ],
  }

export default _another_year_another_lesson
