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
const $el = document.querySelector<HTMLElement>(".ball")
const itp = new Interpol({
  props: {
    x: [-10, 200],
    y: [0, 50],
  },
  //  debug: true,
  duration: 2000,
  ease: Power3.inOut,
  onUpdate: ({ props, time, progress }) => {
    $el.style.transform = `translate3d(${props.x}px, ${props.y}px, 0px)`
  },
})

console.log("itp", itp)
