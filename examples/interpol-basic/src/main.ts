import { Interpol, Power3 } from "@wbe/interpol"
import "./index.less"
;["play", "reverse", "pause", "stop", "refresh", "resume"].forEach(
  (name) => (document.querySelector<HTMLButtonElement>(`.${name}`).onclick = () => itp[name]())
)

const inputProgress = document.querySelector<HTMLInputElement>(".progress")
inputProgress.onchange = () => {
  console.log("e", parseFloat(inputProgress.value) / 100)
  itp.seek(parseFloat(inputProgress.value) / 100)
}

document.querySelector<HTMLButtonElement>(`.play`).onclick = () => itp.play(0)
document.querySelector<HTMLButtonElement>(`.reverse`).onclick = () => itp.reverse(1)

const $el = document.querySelector<HTMLElement>(".ball")
const itp = new Interpol({
  from: 0,
  to: 200,
  duration: 2000,
  debug: true,
  ease: Power3.inOut,
  onUpdate: ({ value, time, progress }) => {
    $el.style.transform = `translate3d(${value}px, ${value}px, ${value}px)`
  },
})