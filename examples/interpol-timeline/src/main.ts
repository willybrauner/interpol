import { Power1, Timeline, Interpol, styles } from "@wbe/interpol"
import "./index.less"

/**
 * Query
 */
const ball = document.querySelector<HTMLElement>(".ball")
const ball2 = document.querySelector<HTMLElement>(".ball-2")
const seek0 = document.querySelector<HTMLButtonElement>(".seek-0")
const seek05 = document.querySelector<HTMLButtonElement>(".seek-05")
const seek1 = document.querySelector<HTMLButtonElement>(".seek-1")
const inputProgress = document.querySelector<HTMLInputElement>(".progress")
const inputSlider = document.querySelector<HTMLInputElement>(".slider")

/**
 * Events
 */
;["play", "reverse", "pause", "stop", "refresh", "resume"].forEach(
  (name) => (document.querySelector<HTMLButtonElement>(`.${name}`).onclick = () => tl[name]()),
)
seek0.onclick = () => tl.seek(0, false, false)
seek05.onclick = () => tl.seek(0.5, false, false)
seek1.onclick = () => tl.seek(1, false, false)
inputProgress.onchange = () => tl.seek(parseFloat(inputProgress.value) / 100, false, false)
inputSlider.oninput = () => tl.seek(parseFloat(inputSlider.value) / 100, false, false)
window.addEventListener("resize", () => tl.seek(1))

/**
 * Timeline
 */
const tl: Timeline = new Timeline({
  debug: true,
  onComplete: (time, progress) => console.log(`tl onComplete!`),
})

const itp = new Interpol({
  x: [0, 200],
  y: [0, 200],
  ease: Power1.in,
  onUpdate: ({ x, y }) => {
    styles(ball, { x: x + "px", y: y + "px" })
  },
  onComplete: (e) => {
    console.log("itp 1 onComplete", e)
  },
})
tl.add(itp)

tl.add({
  x: [200, 100],
  y: [200, 300],
  ease: Power1.out,
  onUpdate: ({ x, y }) => {
    styles(ball, { x: x + "px", y: y + "px" })
  },
  onComplete: (e) => {
    console.log("itp 2 onComplete", e)
  },
})

tl.add({
  x: [0, 100],
  y: [0, 400],
  ease: Power1.out,
  onUpdate: ({ x, y }) => {
    styles(ball2, { x: x + "px", y: y + "px" })
  },
  onComplete: (e) => {
    console.log("itp 3 onComplete", e)
  },
})
