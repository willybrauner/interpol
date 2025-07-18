import { Power1, Timeline, Interpol, styles } from "@wbe/interpol"
import "./index.less"

/**
 * Query
 */
const ball = document.querySelector<HTMLElement>(".ball")
const ball2 = document.querySelector<HTMLElement>(".ball-2")
const play = document.querySelector<HTMLButtonElement>(".play")
const progress0 = document.querySelector<HTMLButtonElement>(".progress-0")
const progress05 = document.querySelector<HTMLButtonElement>(".progress-05")
const progress1 = document.querySelector<HTMLButtonElement>(".progress-1")
const inputProgress = document.querySelector<HTMLInputElement>(".progress")
const inputSlider = document.querySelector<HTMLInputElement>(".slider")

/**
 * Events
 */
;["reverse", "pause", "stop", "refresh", "resume"].forEach(
  (name) => (document.querySelector<HTMLButtonElement>(`.${name}`).onclick = () => tl[name]()),
)
play.onclick = () => tl.play()
progress0.onclick = () => tl.progress(0, false, false)
progress05.onclick = () => tl.progress(0.5, false, false)
progress1.onclick = () => tl.progress(1, false, false)
inputProgress.onchange = () => tl.progress(parseFloat(inputProgress.value) / 100, false, false)
inputSlider.oninput = () => tl.progress(parseFloat(inputSlider.value) / 100, false, false)
window.addEventListener("resize", () => tl.progress(1))

/**
 * Timeline
 */
const tl: Timeline = new Timeline({
  debug: false,
  onComplete: (time, progress) => console.log(`tl onComplete!`),
})

const itp = new Interpol({
  x: [100, innerWidth / 2],
  y: [0, innerHeight / 2],
  ease: "power3.in",
  duration: 600,
  onStart: (e) => {
    console.log("itp 1 onStart", e)
  },
  onUpdate: ({ x, y }) => {
    styles(ball, { x: x + "px", y: y + "px" })
  },
  onComplete: (e) => {
    console.log("itp 1 onComplete", e)
  },
})
tl.add(itp)

tl.add({
  x: [innerWidth / 2, 0],
  duration: 600,
  ease: "power3.out",
  onStart: (e) => {
    console.log("itp 2 onStart", e)
  },
  onUpdate: ({ x }) => {
    styles(ball, { x })
  },
  onComplete: (e) => {
    console.log("itp 2 onComplete", e)
  },
})

tl.add({
  scale: [1, 0.5],
  ease: "power4.out",
  onStart: (e) => {
    console.log("itp 3 onStart", e)
  },
  onUpdate: ({ scale }) => {
    styles(ball2, { scale })
  },
  onComplete: (e) => {
    console.log("itp 3 onComplete", e)
  },
})

tl.add(() => {
  console.log("add callback blue")
  styles(ball, { background: "blue" })
}, 300)
tl.add(() => {
  console.log("add callback green")
  styles(ball, { background: "green" })
}, "+=1000")

tl.add(() => {
  console.log("add callback red")
  styles(ball, { background: "red" })
}, "+500")
