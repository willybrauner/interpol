import { Interpol } from "@wbe/interpol"
import "./index.less"
import { InterpolOptions } from "@wbe/interpol"
;["play", "reverse", "pause", "stop", "refresh", "resume"].forEach(
  (name: any) =>
    (document.querySelector<HTMLButtonElement>(`.${name}`)!.onclick = () => {
      // @ts-ignore
      itp[name]()
    }),
)
document.querySelector<HTMLButtonElement>(`.seek-0`)!.onclick = () => itp.seek(0, false)
document.querySelector<HTMLButtonElement>(`.seek-05`)!.onclick = () => itp.seek(0.5, false)
document.querySelector<HTMLButtonElement>(`.seek-1`)!.onclick = () => itp.seek(1, false)

const inputProgress = document.querySelector<HTMLInputElement>(".progress")

if (inputProgress) {
  inputProgress.onchange = () => {
    console.log("e", parseFloat(inputProgress.value) / 100)
    itp.seek(parseFloat(inputProgress.value) / 100)
  }
}

const $el = document.querySelector<HTMLElement>(".ball")

const itp = new Interpol({
  debug: true,
  props: {
    x: [0, 300],
    y: [0, 300],
  },
  duration: 1000,
  ease: "linear",
  onUpdate: ({ x, y }) => {
    $el!.style.transform = `translate3d(${x}px, ${y}px, 0px)`
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
