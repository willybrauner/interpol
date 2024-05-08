import { Interpol } from "@wbe/interpol"
import "./style.css"

const wall = document.querySelector<HTMLElement>(".wall")
const button = document.querySelector<HTMLElement>(".button")

const itp = new Interpol({
  paused: true,
  debug: true,
  el: wall,
  immediateRender: true,
  duration: 1000,
  ease: "linear",
  props: {
    x: [-100, 0, "vw"],
  },
})

let isVisible = false

const openClose = () => {
  isVisible = !isVisible
  if (isVisible) itp.play()
  else itp.reverse()
}
openClose()
button?.addEventListener("click", () => {
  openClose()
})

window.addEventListener("resize", () => {
  itp.seek(0.2)
  isVisible = false
})
