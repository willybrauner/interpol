import "./index.less"
import { Power1, Timeline, Interpol } from "@wbe/interpol"
import { styles } from "../utils/styles"

/**
 *
 * Events
 *
 *
 */
import { randomRange } from "@wbe/interpol/tests/utils/randomRange"
import { clamp } from "../utils/clamp"
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

/**
 *
 * Example
 *
 *
 */
const tl: Timeline = new Timeline({
  debug: true,
  //  paused: true,
  onComplete: () => console.log(`tl complete reverse ? ${tl.isReversed}`),
})

const win = { w: innerWidth, h: innerHeight }

const calcCoords = () => {
  const coords: Array<Record<string, [number, number]>> = []
  const NUM = 25
  const ballRect = ball.getBoundingClientRect()
  const ballRectP = ballRect.width / NUM

  for (let i = 0; i < NUM; i++) {
    const odd = i % 2 === 0
    const last = coords?.[coords.length - 1]
    if (!last) {
      coords.push({
        x: [0, win.w / NUM - ballRectP],
        y: [0, -win.h / 3],
      })
    } else {
      const x = last.x[1]
      const y = last.y[1]
      coords.push({
        x: [x, x + win.w / NUM - ballRectP],
        y: [
          y,
          odd ? clamp(-win.h, randomRange(0, -win.h), 0) : clamp(-win.h, -randomRange(0, win.h), 0),
        ],
      })
    }
  }
  return coords
}

for (let props of calcCoords()) {
  tl.add({
    props,
    delay: 100,
    duration: 300,
    ease: "power1.in",
    onUpdate: ({ x, y }) => {
      styles(ball, {
        transform: `translate3d(${x}px, ${y}px, 0)`,
      })
    },
    onComplete: (e) => {
      console.log("itp 2 onComplete", e)
    },
  })
}
