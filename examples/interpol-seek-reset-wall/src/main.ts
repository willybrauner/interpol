import { Timeline, Interpol } from "@wbe/interpol"
import "./style.css"

const wall = document.querySelector<HTMLElement>(".wall")
const button = document.querySelector<HTMLElement>(".button")

const tl = new Timeline({ paused: true })

const itp = new Interpol({
  paused: true,
  debug: true,
  el: wall,
  immediateRender: true,
  duration: 1000,
  ease: "linear",
  props: {
    x: [() => -innerWidth * 0.9, 0, "px"],
  },
})

tl.add(itp)
tl.add({
  debug: true,
  el: wall,
  duration: 1000,
  ease: "linear",
  props: {
    x: [0, () => -innerWidth * 0.5, "px"],
  },
})

let isVisible = false

const openClose = () => {
  isVisible = !isVisible
  if (isVisible) tl.play()
  else tl.reverse()
}
openClose()
button?.addEventListener("click", () => {
  openClose()
})

window.addEventListener("resize", () => {
  tl.refreshComputedValues()
  tl.seek(0)

  isVisible = false
})
