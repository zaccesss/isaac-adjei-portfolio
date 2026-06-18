import type { BlogPost } from "../index"

const _javascript_event_loop: BlogPost = {
    slug: "javascript-event-loop",
    title: "JavaScript's Event Loop Without the Metaphors",
    date: "2026-06-22",
    type: "article",
    cover_image: "/images/blog/covers/javascript-event-loop.webp",
    description:
      "Most explanations of the JavaScript event loop use hand-wavy analogies. This one explains the actual mechanism: the call stack, the task queue, the microtask queue and why the order matters for real code.",
    tags: ["JavaScript", "TypeScript", "Web", "Async", "Full-Stack"],
    published: true,
    content: [
      {
        type: "p",
        text: "JavaScript is single-threaded. There is one call stack. One thing runs at a time. And yet web applications handle button clicks while fetching data, animate the UI while processing responses and run timers while doing everything else. The mechanism that makes this possible is the event loop. Most explanations reach for analogies - a restaurant, a to-do list, a queue at the post office. I want to explain what is actually happening in the runtime instead.",
      },
      {
        type: "h2",
        text: "The Call Stack",
      },
      {
        type: "p",
        text: "The call stack is a LIFO data structure that tracks which function is currently executing and which functions called it. When you call a function, a stack frame is pushed containing the function's local variables and the return address. When the function returns, the frame is popped. If the stack is empty, no JavaScript is executing.",
      },
      {
        type: "p",
        text: "Stack overflow errors happen when recursion is too deep - each recursive call pushes a new frame, and eventually the engine runs out of stack space. The error message 'Maximum call stack size exceeded' is the runtime telling you the call stack is full.",
      },
      {
        type: "h2",
        text: "The Task Queue (Macrotask Queue)",
      },
      {
        type: "p",
        text: "Callbacks from setTimeout, setInterval, I/O events and UI events are not run immediately. They are added to the task queue (also called the macrotask queue or callback queue). The event loop checks this queue only when the call stack is empty. This is why setTimeout(fn, 0) does not run fn immediately - it runs fn after the current synchronous code finishes and the stack empties.",
      },
      {
        type: "code",
        lang: "javascript",
        text: `console.log("1")          // runs first - synchronous

setTimeout(() => {
  console.log("2")          // runs last - task queue, waits for stack to empty
}, 0)

console.log("3")          // runs second - still synchronous

// Output: 1, 3, 2`,
      },
      {
        type: "h2",
        text: "The Microtask Queue",
      },
      {
        type: "p",
        text: "Promises and queueMicrotask() use a separate queue: the microtask queue. The critical difference from the task queue is priority. After every task completes and before the event loop picks the next task from the task queue, it drains the entire microtask queue. All pending microtasks run before any pending macrotask.",
      },
      {
        type: "code",
        lang: "javascript",
        text: `console.log("1")          // synchronous

setTimeout(() => console.log("2"), 0)  // task queue

Promise.resolve()
  .then(() => console.log("3"))        // microtask queue
  .then(() => console.log("4"))        // another microtask

console.log("5")          // synchronous

// Output: 1, 5, 3, 4, 2
// Microtasks (3, 4) run before the macrotask (2)`,
      },
      {
        type: "p",
        text: "This ordering has real consequences. If you generate an infinite chain of microtasks (each .then() schedules another), the event loop never gets to process macrotasks. The page freezes even though no single function is blocking - the microtask queue never empties.",
      },
      {
        type: "h2",
        text: "async/await Is Promise Syntax",
      },
      {
        type: "p",
        text: "async/await is syntactic sugar over Promises. An async function returns a Promise. The await keyword pauses execution of the async function and schedules the rest of it as a microtask once the awaited Promise resolves. It does not block the call stack - the JavaScript engine continues executing other code while the async function is paused.",
      },
      {
        type: "code",
        lang: "javascript",
        text: `async function fetchUser(id) {
  console.log("A")                    // synchronous
  const user = await getUser(id)      // pauses here; rest is a microtask
  console.log("B")                    // runs after getUser resolves
  return user
}

fetchUser(1)
console.log("C")                      // runs before "B"

// Output: A, C, B
// "C" runs because await suspends the async function, freeing the stack`,
      },
      {
        type: "h2",
        text: "requestAnimationFrame Is Neither",
      },
      {
        type: "p",
        text: "requestAnimationFrame callbacks run after the current task and all microtasks, but before the browser renders the next frame. They sit in their own queue, separate from both the task queue and the microtask queue. The practical implication: if you update the DOM inside a rAF callback, the browser will paint those changes in the same frame. If you update the DOM from a setTimeout callback, the paint may or may not happen in the same frame depending on timing.",
      },
      {
        type: "h2",
        text: "The Event Loop Tick",
      },
      {
        type: "p",
        text: "One complete pass through the event loop - called a tick - follows this sequence: (1) run the oldest task from the task queue, (2) drain the entire microtask queue, (3) run any scheduled rAF callbacks, (4) let the browser render if needed, (5) repeat. This is the actual algorithm. Understanding it explains why Promises resolve before setTimeout callbacks, why long synchronous code freezes animations and why queueMicrotask() should be used sparingly.",
      },
      {
        type: "h2",
        text: "Why This Matters in Practice",
      },
      {
        type: "ul",
        items: [
          "State updates in React are batched and applied as microtasks - calling setState multiple times in one event handler causes one re-render, not multiple",
          "Long synchronous computations (image processing, large sorts) block both the UI and I/O - move them to a Web Worker if they take more than a few milliseconds",
          "Promise.all fires all promises in parallel and waits for all to resolve - but they still run on the same thread, so they are concurrent in scheduling but not parallel in execution",
          "Unhandled promise rejections are caught by the 'unhandledrejection' window event, which fires from the microtask queue - before any macrotask that follows",
          "Node.js has process.nextTick(), which runs even before the microtask queue - it is a third priority level that predates the standardised queueMicrotask() API",
        ],
      },
      {
        type: "h2",
        text: "Watch: The Event Loop Explained",
      },
      {
        type: "video",
        youtubeId: "cCOL7MC4Pl0",
        title: "In The Loop - Jake Archibald (JSConf Asia 2018)",
        description: "The best visual explanation of the JavaScript event loop, task queue, microtask queue and requestAnimationFrame. 35 minutes - worth every minute.",
      },
      {
        type: "h2",
        text: "References",
      },
      {
        type: "ol-links",
        items: [
          { text: "HTML Living Standard - event loop processing model (WHATWG)", url: "https://html.spec.whatwg.org/multipage/webappapis.html#event-loops" },
          { text: "MDN: Concurrency model and the event loop", url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Event_loop" },
          { text: "Jake Archibald: Tasks, microtasks, queues and schedules (2015)", url: "https://jakearchibald.com/2015/tasks-microtasks-queues-and-schedules/" },
          { text: "MDN: queueMicrotask() reference", url: "https://developer.mozilla.org/en-US/docs/Web/API/Window/queueMicrotask" },
          { text: "Node.js event loop documentation - includes process.nextTick() and libuv phases", url: "https://nodejs.org/en/learn/asynchronous-work/event-loop-timers-and-nexttick" },
          { text: "MDN: Using microtasks in JavaScript with queueMicrotask()", url: "https://developer.mozilla.org/en-US/docs/Web/API/HTML_DOM_API/Microtask_guide" },
        ],
      },
    ],
  }

export default _javascript_event_loop
