import type { BlogPost } from "../index"

const _writing_for_engineers: BlogPost = {
    slug: "writing-for-engineers",
    title: "Writing Clearly as an Engineer: Notes on Technical Communication",
    date: "2026-08-03",
    type: "notes",
    cover_image: "/images/blog/covers/writing-for-engineers.webp",
    description:
      "Notes on writing clearly: how to structure explanations, when to use diagrams, why passive voice creeps into technical writing and how to remove it. Based on mistakes I made writing reports, documentation and blog posts.",
    tags: ["Writing", "Communication", "Documentation", "Career"],
    published: true,
    content: [
      {
        type: "p",
        text: "Engineering writing is full of sentences like: 'It was determined that the threshold value should be modified to accommodate the revised specification requirements.' What this means is: 'We changed the threshold to match the new spec.' The passive voice is not more professional. It is harder to read and hides who made the decision. These are notes on the specific habits that make technical writing clearer.",
      },
      {
        type: "h2",
        text: "Lead with the Conclusion",
      },
      {
        type: "p",
        text: "Academic writing builds to a conclusion. Technical writing should lead with it. State the main point in the first sentence, then explain how you got there. 'The component fails above 85 degrees Celsius. Our measurements showed...' is better than two paragraphs of methodology before the finding. Readers rarely read in full; they scan for the answer to their question. Put the answer first.",
      },
      {
        type: "h2",
        text: "One Idea Per Paragraph",
      },
      {
        type: "p",
        text: "A paragraph that covers three ideas will be re-read three times and understood once. The discipline of one idea per paragraph forces you to know what each paragraph is for. If you cannot summarise a paragraph in one sentence, it is doing too much. Write the summary sentence first, then write the paragraph around it.",
      },
      {
        type: "h2",
        text: "Use Active Voice",
      },
      {
        type: "p",
        text: "Subject-verb-object. 'The script reads the config file' not 'The config file is read by the script.' Active voice is shorter, faster to parse and clearer about causality. Passive voice is appropriate when the subject is genuinely unknown or irrelevant. Otherwise, use active. Most passive sentences in engineering writing are passive out of habit, not necessity.",
      },
      {
        type: "h2",
        text: "Avoid Nominalisations",
      },
      {
        type: "p",
        text: "Nominalisations are verbs turned into nouns. 'Perform an investigation of' rather than 'investigate'. 'Make a decision about' rather than 'decide'. 'Provide an explanation of' rather than 'explain'. Every nominalisation adds words and slows the reader down. The verb form is almost always shorter and clearer.",
      },
      {
        type: "ul",
        items: [
          "perform an analysis of -> analyse",
          "make a determination -> determine",
          "provide a summary of -> summarise",
          "conduct an evaluation of -> evaluate",
          "have an impact on -> affect",
        ],
      },
      {
        type: "h2",
        text: "When to Use a Diagram",
      },
      {
        type: "p",
        text: "Use a diagram when the spatial or temporal relationship between things is the point. System architecture diagrams, signal timing diagrams, flowcharts and state machines communicate structure that text cannot. Do not use a diagram to avoid writing. A block diagram with no explanation is not useful; a block diagram with one sentence per component explaining its role is.",
      },
      {
        type: "h2",
        text: "Code Comments Are Documentation",
      },
      {
        type: "p",
        text: "A comment that says 'set the baud rate' next to `UBRR0H = (F_CPU / 16 / BAUD - 1) >> 8` tells you nothing you could not read from the code. A comment that says 'UBRR value is calculated per datasheet Table 20-1; F_CPU must match the fuse configuration' tells you something the code cannot. The rule: comment the why, not the what. What the code does is visible. Why it does it that way is not.",
      },
      {
        type: "h2",
        text: "Writing for an Audience You Do Not Know",
      },
      {
        type: "p",
        text: "Technical documentation often has two readers: the expert who knows the domain but not your specific system and the newcomer who knows neither. Write for both by defining terms on first use and providing references for background knowledge rather than explaining it inline. 'The system uses I2C (a two-wire serial protocol; see the NXP UM10204 specification for protocol details)' gives the newcomer a path and does not waste the expert's time.",
      },
      {
        type: "h2",
        text: "References",
      },
      {
        type: "ol-links",
        items: [
          { text: "The Elements of Style - Strunk and White - short, specific and still the best general writing guide", url: "https://en.wikipedia.org/wiki/The_Elements_of_Style" },
          { text: "Google developer documentation style guide - free online, practical and well-maintained", url: "https://developers.google.com/style" },
          { text: "Microsoft Writing Style Guide - particularly useful for UI copy and error messages", url: "https://learn.microsoft.com/en-us/style-guide/welcome/" },
          { text: "Write the Docs - community and resources for technical writers and developers who write docs", url: "https://www.writethedocs.org/" },
          { text: "Style: Lessons in Clarity and Grace - Joseph M. Williams and Joseph Bizup - the most practically useful academic writing guide", url: "https://www.amazon.co.uk/Style-Lessons-Clarity-Grace-12th/dp/0134080416" },
          { text: "Oxford Guide to Plain English - Martin Cutts - UK-focused plain English guidance", url: "https://global.oup.com/academic/product/oxford-guide-to-plain-english-9780198844785" },
        ],
      },
    ],
  }

export default _writing_for_engineers
