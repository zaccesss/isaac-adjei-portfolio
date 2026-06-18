import type { BlogPost } from "../index"

const _eleven_things_learning_to_code: BlogPost = {
    slug: "eleven-things-learning-to-code",
    title: "Eleven Things That Actually Help When Learning to Code",
    date: "2026-09-07",
    type: "article",
    cover_image: "/images/blog/covers/eleven-things-learning-to-code.webp",
    description:
      "Not 'learn Python first' or 'do LeetCode every day'. The things that actually made a difference when moving from knowing nothing to shipping things: how to read documentation, how to get unstuck, how to build the habit.",
    tags: ["Learning", "Career", "Programming", "Beginner", "Advice"],
    published: true,
    content: [
      {
        type: "p",
        text: "The internet has no shortage of advice on learning to code. Most of it is either a technology recommendation (learn Python / JavaScript / Rust first) or a method recommendation (do LeetCode / build projects / contribute to open source). Both miss the more fundamental problems: how do you stay consistent, how do you get unstuck, how do you know if you are learning efficiently. This is the list I wish someone had given me.",
      },
      {
        type: "h2",
        text: "1. Read Error Messages All the Way Through",
      },
      {
        type: "p",
        text: "The instinct when an error appears is to scan for the first familiar word and Google it. A better instinct is to read the entire error message first, including the stack trace. Error messages in modern languages are usually very specific: 'Cannot read properties of undefined (reading map)' tells you exactly what is null and what operation you tried on it. 'No module named requests' tells you the package is not installed in the current environment. Google is for error messages you do not understand after reading them, not instead of reading them.",
      },
      {
        type: "h2",
        text: "2. Type Out Code Examples, Do Not Copy-Paste",
      },
      {
        type: "p",
        text: "When following a tutorial or reading documentation, type the examples manually rather than pasting them. Typing forces you to read each character and think about what it does. Pasting lets your brain treat the block as a single token without engaging with the structure. The difference in retention is significant. You will make typing mistakes that give you useful error messages. You will notice syntax you would have skipped over.",
      },
      {
        type: "h2",
        text: "3. Learn to Use the Debugger Before You Need It",
      },
      {
        type: "p",
        text: "Most beginners debug by adding print statements. Print-debugging works but it is slow: you add prints, run the program, read the output, add more prints, repeat. A debugger lets you pause execution at any line, inspect every variable in scope and step through the code instruction by instruction. Learning to use the debugger in VS Code or PyCharm takes an afternoon. It will save you hours on every non-trivial bug after that.",
      },
      {
        type: "h2",
        text: "4. Documentation Is Not Optional",
      },
      {
        type: "p",
        text: "When you use a function or library you do not fully understand, go to the official documentation and read the section for that function. Not a tutorial about it - the actual documentation. Documentation tells you the function signature, the types of arguments, the return type, the edge cases and the exceptions it can throw. Tutorials tell you the happy path. You will eventually hit a non-happy path. For web platform APIs, [MDN Web Docs](https://developer.mozilla.org) is the authoritative reference.",
      },
      {
        type: "h2",
        text: "5. Version Control from Day One",
      },
      {
        type: "p",
        text: "Start using Git from your very first project, even if it is a 50-line script. The habit of committing working states means you always have a point to revert to. It also means you build a record of how your code evolved, which is more useful for learning than the final state alone. The mechanical cost of `git init`, `git add`, `git commit` is two minutes. The cost of not doing it when you need to revert something is everything since the last save. If you want a structured starting point for learning Git properly, [git-unlocked](https://github.com/zaccesss/git-unlocked) covers everything from the basics to professional workflows.",
      },
      {
        type: "h2",
        text: "6. Stuck for 20 Minutes? Explain It Out Loud",
      },
      {
        type: "p",
        text: "Rubber duck debugging works. Explaining a problem to an inanimate object - or writing it out in full sentences - forces you to articulate assumptions you were holding implicitly. The act of formulating the explanation often surfaces the bug. Before asking someone else for help, spend a few minutes articulating the problem precisely: what you expected to happen, what actually happened and what you have already tried. This process frequently produces the answer before you finish the question.",
      },
      {
        type: "h2",
        text: "7. Build Things You Actually Want to Exist",
      },
      {
        type: "p",
        text: "Tutorial projects are fine for learning syntax. They are not good at sustaining motivation. The projects that stick are the ones you actually want to use - a script that automates something tedious, a tool that solves a problem you have, a website for something you care about. When the project matters to you, debugging feels like progress rather than obstacle. The best thing I built for learning purposes was something I actively used afterwards.",
      },
      {
        type: "h2",
        text: "8. Read Other People's Code",
      },
      {
        type: "p",
        text: "Most beginners only read their own code and tutorial code. Reading production-quality open source code exposes you to patterns, conventions and approaches you would not arrive at yourself. Start with a project in a language you know, find something with fewer than 5000 lines of code and a README that explains what it does. Read the main files. Do not worry about understanding everything - focus on what looks unfamiliar and why.",
      },
      {
        type: "h2",
        text: "9. Consistency Beats Intensity",
      },
      {
        type: "p",
        text: "Two hours of coding every day for a month produces more learning than a 14-hour marathon on a weekend. The marathon feels productive but most of the deep work happens in the hours after you stop - when your brain consolidates what it processed. Regular shorter sessions give the brain more consolidation time. They also build the habit, which compounds. The learner who codes for 45 minutes every evening will outpace the learner who does full-day sessions every two weeks.",
      },
      {
        type: "h2",
        text: "10. Understand Why Before How",
      },
      {
        type: "p",
        text: "When learning something new, spend time on why it exists before learning how to use it. Why does Python have list comprehensions when for loops exist? Why do databases have indexes? Why does React have a virtual DOM? The why is the mental model. The how is syntax. Mental models transfer to new contexts; syntax is specific and forgettable. Once you understand why closures exist in JavaScript, the specific syntax becomes obvious.",
      },
      {
        type: "h2",
        text: "11. Write It Down",
      },
      {
        type: "p",
        text: "Keep a text file or notebook where you record things you learned, bugs you fixed and approaches that worked. The act of writing reinforces the memory. The record becomes searchable. You will encounter the same class of problem again in a different context; having notes from the first time means you spend minutes on the second encounter rather than hours. This is also the foundation of writing technical blog posts, which are a multiplier: they force you to understand something well enough to explain it, which is a different and deeper kind of knowing.",
      },
      {
        type: "h2",
        text: "Further Reading",
      },
      {
        type: "ol-links",
        items: [
          { text: "The Pragmatic Programmer - Hunt and Thomas - the best book on developer habits and thinking", url: "https://pragprog.com/titles/tpp20/the-pragmatic-programmer-20th-anniversary-edition/" },
          { text: "A Mind for Numbers - Barbara Oakley - the science behind learning technical subjects effectively", url: "https://barbaraoakley.com/books/a-mind-for-numbers/" },
          { text: "git-unlocked - free open-source Git course covering version control from scratch", url: "https://github.com/zaccesss/git-unlocked" },
          { text: "MDN Web Docs - the authoritative web platform reference; go here before Stack Overflow", url: "https://developer.mozilla.org/" },
          { text: "Rubber Duck Debugging - Wikipedia - the formal name for the technique in point 6", url: "https://en.wikipedia.org/wiki/Rubber_duck_debugging" },
        ],
      },
    ],
  }

export default _eleven_things_learning_to_code
