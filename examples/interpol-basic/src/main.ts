import { Interpol } from "@wbe/interpol"
import "./index.less"
import { InterpolOptions } from "@wbe/interpol"

/**
 * Query
 */
const ball = document.querySelector<HTMLElement>(".ball")

const seek0 = document.querySelector<HTMLButtonElement>(".seek-0")
const seek05 = document.querySelector<HTMLButtonElement>(".seek-05")
const seek1 = document.querySelector<HTMLButtonElement>(".seek-1")

const inputProgress = document.querySelector<HTMLInputElement>(".progress")
const inputSlider = document.querySelector<HTMLInputElement>(".slider")

/**
 * Events
 */
;["play", "reverse", "pause", "stop", "refresh", "resume"].forEach(
  (name: any) =>
    (document.querySelector<HTMLButtonElement>(`.${name}`)!.onclick = () => {
      // @ts-ignore
      itp[name]()
    }),
)

seek0!.onclick = () => itp.seek(0, false)
seek05!.onclick = () => itp.seek(0.5, false)
seek1!.onclick = () => itp.seek(1, false)

inputProgress!.onchange = () => itp.seek(parseFloat(inputProgress!.value) / 100, false)
inputSlider!.oninput = () => itp.seek(parseFloat(inputSlider!.value) / 100, false)

const itp = new Interpol({
  // debug: true,
  props: {
    x: { from: 0, to: 100, ease: "power3.out" },
    y: { from: 0, to: 500, ease: "power1.in" },
    opacity: [0.5, 1],
  },
  onUpdate: ({ x, y, opacity }) => {
    ball!.style.transform = `translate3d(${x}px, ${y}px, 0px)`
    ball!.style.opacity = opacity
  },
  onComplete: () => {
    console.log("itp onComplete")
  },
})

console.log("itp", itp)
console.log("InterpolOptions.ticker", InterpolOptions.ticker)
InterpolOptions.ticker.disable()

const tick = (e: number) => {
  InterpolOptions.ticker.raf(e)
  requestAnimationFrame(tick)
}
requestAnimationFrame(tick)
