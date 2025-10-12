import "./index.css"
import { EaseName, Interpol, styles } from "@wbe/interpol"
import { createTweekpane } from "./createTweakpane"

const element = document.querySelector<HTMLElement>(".ball")!

const PARAMS = {
  ease: "power3.out" as EaseName,
  duration: 1500,
}

/**
 * Interpol
 */
const itp = new Interpol({
  paused: true,
  x: [0, () => window.innerWidth - element.offsetWidth],
  y: [0, () => window.innerHeight - element.offsetHeight],
  duration: () => PARAMS.duration,
  ease: () => PARAMS.ease,
  onUpdate: ({ x, y }) => {
    styles(element, { x: x, y: y })
  },
})

const yoyo = async () => {
  await itp.play()
  await itp.reverse()
  yoyo()
}

yoyo()
window.addEventListener("resize", () => itp.refresh())

/**
 * Tweakpane
 */
const pane = createTweekpane(itp, PARAMS, yoyo)
