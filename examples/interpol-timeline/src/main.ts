import { Power1, Timeline } from "@wbe/interpol"
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
  onComplete: () => console.log(`tl complete reverse ? ${tl.isReversed}`),
})
  .add({
    props: {
      x: [0, 200],
      y: [0, 200],
    },
    duration: 500,
    ease: Power1.in,
    onUpdate: ({ props }) => {
      x = props.x
      y = props.y
      $el.style.transform = `translate3d(${x}px, ${y}px, 0px)`
      console.log("itp 0 onUpdate", x, y)
    },
    // doesn't work
    onComplete: (e) => {
      console.log("itp 1 onComplete", e)
    },
  })
  .add({
    props: {
      x: [0, 100],
    },
    duration: 500,
    ease: Power1.out,
    onUpdate: ({ props }) => {
      let currX = props.x + x
      $el.style.transform = `translate3d(${currX}px, ${y}px, 0px)`
    },
    onComplete: (e) => {
      console.log("itp 2 onComplete", e)
    },
  })

  .add({
    props: {
      x: [0, 100],
    },
    duration: 500,
    ease: Power1.in,
    onUpdate: ({ props }) => {
      $el.style.transform = `translate3d(${x + 100}px, ${y + props.x}px, 0px)`
    },
    onComplete: (e) => {
      console.log("itp 3 onComplete", e)
    },
  })
