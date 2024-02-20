import { Interpol } from "@wbe/interpol"
import "./index.less"
import { InterpolOptions } from "@wbe/interpol"
;["play", "reverse", "pause", "stop", "refresh", "resume"].forEach(
  (name: any) =>
    (document.querySelector<HTMLButtonElement>(`.${name}`)!.onclick = () => {
      // @ts-ignore
      itp[name]()
    })
)

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
  ease: "power3.out",
  onUpdate: ({ x, y }) => {
    $el!.style.transform = `translate3d(${x}px, ${y}px, 0px)`
  },
})
InterpolOptions.ticker.disableRaf()

const tick = (e: number) => {
  InterpolOptions.ticker.raf(e)
  requestAnimationFrame(tick)
}
requestAnimationFrame(tick)
