import type { BlogPost } from "../index"

const _my_journey_so_far: BlogPost = {
    slug: "my-journey-so-far",
    title: "My Journey So Far",
    date: "2024-06-01",
    type: "journal",
    cover_image: "/images/blog/covers/my-journey-so-far.webp",
    description:
      "From losing sight in one eye at age two, to losing my father, to moving countries and rebuilding from scratch. The full story of how I got to where I am today.",
    tags: ["Personal", "Ghana", "Aston", "Journey", "Engineering", "Faith"],
    published: true,
    content: [
      {
        type: "h2",
        text: "Acknowledgements",
      },
      {
        type: "p",
        text: "Before anything else, I want to acknowledge the people who made this possible. To God, for every open door, every moment of clarity in difficulty and every grace that carried me further than I could carry myself. To my late father, whose hands built things and whose words, \"Always strive to make things better\", still guide everything I do. We hope you are proud, Dad. To my mum, who has had the single biggest impact on who I am. She has looked after us with everything she has, continuing to give, protect and pour into us even without our dad by her side. Her strength, sacrifice and love are behind every step I have taken. And to my siblings, who I carry with me in everything I do. This journey is for all of you.",
      },
      {
        type: "divider",
      },
      {
        type: "p",
        text: "I was not supposed to end up in engineering. Nobody sat me down and mapped a route. It happened gradually, shaped by a father who showed me what it meant to build things with your hands, by a school that demanded excellence and by a series of decisions I had to make on my own when the path was not obvious.",
      },
      {
        type: "p",
        text: "This is the full story. I am writing it because I think there are people who need to read it. If you are the first in your family to pursue this, if you have faced setbacks that made you question whether you belong here, if you have had to start over more than once, this one is for you.",
      },
      {
        type: "h2",
        text: "The beginning",
      },
      {
        type: "p",
        text: "I grew up in Ghana. At age two, I lost the sight in my right eye after surgery for suspected retinoblastoma, a rare childhood eye cancer. Because of the surgeries and recovery, I missed several early years of school. When I eventually returned, I was around six or seven years old while many of my classmates were already ahead. I had to catch up without anyone acknowledging how significant that gap was.",
      },
      {
        type: "p",
        text: "Growing up with monocular vision, I faced assumptions about what I could and could not do. For a long time, I dreamed of becoming a pilot. That dream was taken from me when I was told that monocular vision made it an impossible career path. I was young when I heard that and it stung. But looking back, it was the first moment I had to redirect a dream rather than abandon it. It would not be the last.",
      },
      {
        type: "p",
        text: "I also faced bullying growing up. I struggled with confidence, with insecurity and with caring too much about what other people thought. There were periods that were genuinely dark. I am not going to give those periods more space than they deserve here, but I want to acknowledge them because honesty matters more than a polished story. What I learned, slowly and through repetition, is that the opinions of people who want to diminish you are not data. They are noise. Consistency beats cruelty every time.",
      },
      {
        type: "h2",
        text: "My father",
      },
      {
        type: "p",
        text: "My father was a mechanical and refrigeration engineer. During school holidays I would go to work with him and watch engineering happen in real time. He moved parts, diagnosed faults and fixed things that other people had given up on. I absorbed all of it without knowing that was what I was doing. He had a way of approaching problems that was calm and methodical and it left a deep impression on me.",
      },
      {
        type: "p",
        text: "He used to say: always strive to make things better. I did not fully understand what that meant when I was young. I do now.",
      },
      {
        type: "p",
        text: "In 2021, I lost him. He passed away during a period that was already difficult. Losing him was one of the hardest moments of my life. But it also became a turning point. I decided I wanted to carry forward that problem-solving mindset. I wanted to choose engineering not just because I was interested in it but because it felt like honouring something he left behind.",
      },
      {
        type: "h2",
        text: "Adisadel College",
      },
      {
        type: "p",
        text: "I spent my senior high school years at Adisadel College in Cape Coast, one of the most prestigious boys' schools in Ghana, founded in 1910. The motto is Vel Primus, Vel Cum Primis: either the first or with the first. That motto is not decorative. It is a standard the school actually holds you to.",
      },
      {
        type: "p",
        text: "I lived in Thomas Jonah House. I served as Dispensary Prefect, House Secretary of Thomas Jonah House and Vice President of APOSA, my church group. I was also active in the Robotics Club, Scripture Union, PENSA and the Debate Society. Those roles taught me leadership in a way that classrooms cannot: real responsibility, real accountability and real consequences when you let people down.",
      },
      {
        type: "p",
        text: "Adisadel shaped me in ways I am still discovering. It gave me a standard for what excellence looks like and a deep belief that where you start does not determine where you finish.",
      },
      {
        type: "h2",
        text: "Moving to the UK",
      },
      {
        type: "p",
        text: "In April 2022, my mother was posted to the UK for work and I came with her. Starting again in a new country and a completely new education system was harder than I expected. My academic background was in General Arts. I had no formal technical foundation. Engineering was the direction I wanted to go but I had to get there from a standing start.",
      },
      {
        type: "p",
        text: "I enrolled at Stanmore College in London on a business course. After two months I knew it was wrong. I approached the college, sat the necessary examinations to demonstrate my aptitude and transferred onto the engineering programme, joining two months after it had already started. I had to catch up again, this time in a subject I had never formally studied, while balancing part-time work and everything that comes with being new to a country.",
      },
      {
        type: "p",
        text: "That pattern, of arriving late and still succeeding, has repeated itself at almost every stage of my life. I do not say that to make it sound romantic. At the time it is stressful and disorienting. But it has taught me that late starts do not have to mean worse outcomes.",
      },
      {
        type: "p",
        text: "I graduated with D*DD: Distinction*, Distinction, Distinction in the Pearson BTEC Level 3 National Extended Diploma in Engineering. I was recognised as the Best and Most Hardworking Student at Stanmore College. Every day at that college I thought about my father and what he had built. He was my motivation.",
      },
      {
        type: "h2",
        text: "Limitations becoming solutions",
      },
      {
        type: "p",
        text: "Being partially sighted has shaped how I think about technology. During my studies I found that reading lecture slides and textbook pages was often difficult. So I built something to fix it.",
      },
      {
        type: "p",
        text: "The project is called Zaccess. It takes photos of lecture slides or textbook pages, uses OCR to extract the text and converts it into high-contrast large-text notes with text-to-speech support. It was built to help me study more comfortably. But something more interesting happened: I shared it with another visually impaired student and he told me it saved him hours every week.",
      },
      {
        type: "p",
        text: "That moment changed how I think about my condition. The limitations I have lived with are not separate from the engineer I am becoming. They are part of why I build the things I build. Sometimes your constraints become your direction.",
      },
      {
        type: "h2",
        text: "Faith",
      },
      {
        type: "p",
        text: "Faith has been a constant throughout all of this. I am a Christian and that is not a footnote to my story. It runs through it. There were moments where things could have gone very differently. Doors that opened when they logically should not have. The engineering transfer. The results. The university offers. The scholarship. Clearing working out. Surviving situations that could have ended differently.",
      },
      {
        type: "h2",
        text: "Aston University",
      },
      {
        type: "p",
        text: "I am now studying BEng Electronic Engineering and Computer Science at Aston University, Birmingham, working towards a First Class degree. The programme covers embedded systems, digital electronics, software development, engineering mathematics and more. It is demanding and I am exactly where I want to be.",
      },
      {
        type: "p",
        text: "I am a Student Representative at Aston Students Union, a Student Member of the [IET](https://www.theiet.org) and active in the Aston Ghana Society, Computing Society and Gaming Society. In 2026 I was named a Top 40 Finalist for the Black Heritage Undergraduate of the Year Award, run by TargetJobs and Sky. I completed the Cancer Research UK 10 Days of 5K Challenge, running more than 50 kilometres to raise funds for cancer research. I also completed a student judging role for the targetjobs National Graduate Recruitment Awards.",
      },
      {
        type: "h2",
        text: "Where things stand",
      },
      {
        type: "p",
        text: "I have worked as a Consular Intern and Administrative and Estates Intern at the Ghana High Commission in London. I have completed virtual engineering programmes with British Airways, analysing A320 maintenance schedules and producing material forecast reports and with Yunex Traffic, exploring intelligent transport systems and air quality sensor networks. Between 2022 and 2025 I worked at Casa do Frango Piccadilly, developing communication and composure under pressure alongside my studies.",
      },
      {
        type: "p",
        text: "On the technical side: I have designed and built a [two-stage audio amplifier](/blog/two-stage-audio-amplifier) as a PCB from scratch, a 4x4x4 [NeoPixel LED Cube](/projects/led-cube) with adaptive brightness, a full-stack predictive maintenance platform called [Phaemos](/projects/phaemos) (ongoing), an open-source Git course with over 200 files and Zaccess, an ongoing accessibility tool that uses OCR and text-to-speech to convert lecture slides into readable notes. I work across bare-metal C for microcontrollers, full-stack web with Next.js and Python-based machine learning.",
      },
      {
        type: "p",
        text: "None of it is finished. That is the point. Engineering is not a destination. It is a commitment to keep improving, keep building and keep asking what else is possible. My father said it best: always strive to make things better.",
      },
      {
        type: "h2",
        text: "For whoever needs to hear this",
      },
      {
        type: "p",
        text: "If you are struggling academically, if you are living with a disability or medical trauma, if you are an immigrant adapting to a new system, if you are dealing with grief or battling insecurity, if you feel like you are behind: you are not out. You are in the middle of something. The starting point does not define the outcome. I am living proof of that.",
      },
    ],
  }

export default _my_journey_so_far
