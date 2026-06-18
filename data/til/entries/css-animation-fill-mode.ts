import type { TILEntry } from "../index"

const _css_animation_fill_mode: TILEntry = {
    id: "css-animation-fill-mode",
    title: "`animation-fill-mode: both` keeps the element in its animated state before and after",
    date: "2026-06-16",
    category: "CSS",
    published: true,
    body: "The [`animation-fill-mode`](https://developer.mozilla.org/en-US/docs/Web/CSS/animation-fill-mode) property controls what styles apply to an element outside its active animation period. `forwards` retains the final keyframe state after the animation ends. `backwards` applies the first keyframe state during the `animation-delay` period, so the element does not flash its pre-animation style while waiting to start. `both` does both: the most useful value for entrance animations where you set `opacity: 0` in the first keyframe and want the element to be invisible during the delay.",
    detail: [
      {
        type: "code",
        lang: "css",
        code: `@keyframes fadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* Without both: element flashes at opacity:1 during the 0.3s delay */
.card {
  animation: fadeIn 0.4s ease 0.3s;
}

/* With both: invisible during delay, stays at final state after */
.card {
  animation: fadeIn 0.4s ease 0.3s both;
}`,
        caption: "both is almost always the right choice for entrance animations with a delay",
      },
      {
        type: "link",
        url: "https://developer.mozilla.org/en-US/docs/Web/CSS/animation-fill-mode",
        label: "MDN: animation-fill-mode",
        description: "Interactive examples showing none, forwards, backwards and both side by side.",
      },
    ],
    tags: ["CSS", "animation", "web"],
  }

export default _css_animation_fill_mode
