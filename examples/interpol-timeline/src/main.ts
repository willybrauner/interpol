import { Interpol, Power1, Power3, Timeline } from "@wbe/interpol"
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

const $el = document.querySelector<HTMLElement>(".ball")

let x = 200
let y = 200

const tl = new Timeline({ 
  debug: true, 
  paused: true,
  onComplete: ()=> console.log(`tl complete reverse ? ${tl._isReversed}`) })
.add({
  from: 0,
  to: 200,
  duration: 500,
  ease: Power1.in,
  onUpdate: ({ value, time, progress }) => {
    x = value
    y = value
    $el.style.transform = `translate3d(${x}px, ${y}px, 0px)`
  },
  // doesn't work 
  onComplete: (e) => {
    console.log("itp 1 onComplete",e)
  }
})
.add({
  from: 0,
  to: 100,
  duration: 500,
  ease: Power1.out,
  onUpdate: ({ value, time, progress }) => {
    $el.style.transform = `translate3d(${x + value}px, ${y}px, 0px)`
  },
  onComplete: (e) => {
    console.log("itp 2 onComplete",e)
  }
})
