import { Power1, Timeline, Interpol, styles } from "@wbe/interpol"
import "./index.less"

/**
 * Query
 */
const ball = document.querySelector<HTMLElement>(".ball")
const ball2 = document.querySelector<HTMLElement>(".ball-2")
const play = document.querySelector<HTMLButtonElement>(".play")
const seek0 = document.querySelector<HTMLButtonElement>(".seek-0")
const seek05 = document.querySelector<HTMLButtonElement>(".seek-05")
const seek1 = document.querySelector<HTMLButtonElement>(".seek-1")
const inputProgress = document.querySelector<HTMLInputElement>(".progress")
const inputSlider = document.querySelector<HTMLInputElement>(".slider")

/**
 * Events
 */
;["reverse", "pause", "stop", "refresh", "resume"].forEach(
  (name) => (document.querySelector<HTMLButtonElement>(`.${name}`).onclick = () => tl[name]()),
)
play.onclick = () => tl.play()
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
  debug: false,
  onStart: (time, progress) => {
    console.log("tl onStart ici !", time, progress)
  },
  onComplete: (time, progress) => console.log(`tl onComplete!`),
})

const itp = new Interpol({
  x: [0, innerWidth / 2],
  y: [0, innerHeight / 2],
  ease: "power3.in",
  duration: 600,
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
  onUpdate: ({ scale }) => {
    styles(ball2, { scale })
  },
  onComplete: (e) => {
    console.log("itp 3 onComplete", e)
  },
})
