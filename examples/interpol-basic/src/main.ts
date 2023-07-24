import { Interpol } from "@wbe/interpol"
import "./index.less"
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
  props: {
    x: [-10, 200],
    y: [0, 50],
  },
  duration: 1000,
  ease: "power3.out",
  onUpdate: ({ x, y }, time, progress) => {
    $el!.style.transform = `translate3d(${x}px, ${y}px, 0px)`
  },
})
