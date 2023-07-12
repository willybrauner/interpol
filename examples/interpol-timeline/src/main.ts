import { Interpol, Power3, Timeline } from "@wbe/interpol"
import "./index.less"
;["play", "reverse", "pause", "stop", "refresh", "resume"].forEach(
  (name) => (document.querySelector<HTMLButtonElement>(`.${name}`).onclick = () => tl[name]())
)

const inputProgress = document.querySelector<HTMLInputElement>(".progress")
inputProgress.onchange = () => {
  console.log("e", parseFloat(inputProgress.value) / 100)
  tl.seek(parseFloat(inputProgress.value) / 100)
}

document.querySelector<HTMLButtonElement>(`.play`).onclick = () => tl.play()
document.querySelector<HTMLButtonElement>(`.reverse`).onclick = () => tl.reverse()

const $el = document.querySelector<HTMLElement>(".ball")

let x = 200
let y = 200

const tl = new Timeline({ debug: true, paused:true })
.add({
  from: 0,
  to: 200,
  duration: 1000,
  ease: Power3.in,
  onUpdate: ({ value, time, progress }) => {
    x = value
    y = value
    $el.style.transform = `translate3d(${x}px, ${y}px, 0px)`
  },
})
.add({
  from: 0,
  to: 100,
  duration: 1000,
  ease: Power3.out,
  onUpdate: ({ value, time, progress }) => {
    $el.style.transform = `translate3d(${x + value}px, ${y}px, 0px)`
  },
})
