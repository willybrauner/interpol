import { Power1, Timeline, Interpol } from "@wbe/interpol"
import "./index.less"
;["play", "reverse", "pause", "stop", "refresh", "resume"].forEach(
  (name) => (document.querySelector<HTMLButtonElement>(`.${name}`).onclick = () => tl[name]())
)

const inputProgress = document.querySelector<HTMLInputElement>(".progress")
inputProgress.onchange = () => {
  tl.seek(parseFloat(inputProgress.value) / 100)
}
const inputSlider = document.querySelector<HTMLInputElement>(".slider")
inputSlider.oninput = () => {
  tl.seek(parseFloat(inputSlider.value) / 100)
}
document.querySelector<HTMLButtonElement>(`.play`).onclick = () => tl.play()
document.querySelector<HTMLButtonElement>(`.reverse`).onclick = () => tl.reverse()
const ball = document.querySelector<HTMLElement>(".ball")
const ball2 = document.querySelector<HTMLElement>(".ball-2")

/**
 * Utils
 *
 *
 *
 */
const styles = (el: HTMLElement | null, s: Record<string, string>) => {
  for (let key in s) if (s.hasOwnProperty(key)) el.style[key] = s[key]
}

/**
 *
 * Example
 *
 *
 */
const duration = 1000
const tl: Timeline = new Timeline({
  // debug: true,
  paused: true,
  onComplete: () => console.log(`tl complete reverse ? ${tl.isReversed}`),
})

const itp = new Interpol<"y" | "x">({
  props: {
    x: [0, 200],
    y: [0, 200],
  },
  duration,
  ease: Power1.in,
  onUpdate: ({ x, y }) => {
    styles(ball, {
      transform: `translate3d(${x}px, ${y}px, 0)`,
    })
  },

  onComplete: (e) => {
    console.log("itp 1 onComplete", e)
  },
})

tl.add(itp)

tl.add({
  props: {
    x: [200, 100],
    y: [200, 300],
  },
  duration,
  ease: Power1.out,
  onUpdate: ({ x, y }) => {
    styles(ball, {
      transform: `translate3d(${x}px, ${y}px, 0)`,
    })
  },
  onComplete: (e) => {
    console.log("itp 2 onComplete", e)
  },
})

tl.add({
  props: {
    x: [0, 100],
    y: [0, 400],
  },
  duration,
  ease: Power1.out,
  onUpdate: ({ x, y }) => {
    styles(ball2, {
      transform: `translate3d(${x}px, ${y}px, 0)`,
    })
  },
  onComplete: (e) => {
    console.log("itp 3 onComplete", e)
  },
})
