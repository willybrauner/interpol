import "./index.css"
import { Interpol, styles } from "@wbe/interpol"

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
    // @ts-ignore
    (document.querySelector<HTMLButtonElement>(`.${name}`)!.onclick = () => tween[name]()),
)

seek0!.onclick = () => tween.seek(0, false)
seek05!.onclick = () => tween.seek(0.5, false)
seek1!.onclick = () => tween.seek(1, false)
inputProgress!.onchange = () => tween.seek(parseFloat(inputProgress!.value) / 100, false)
inputSlider!.oninput = () => tween.seek(parseFloat(inputSlider!.value) / 100, false)

/**
 * Tween
 */
const tween = new Interpol({
  x: "200px",
  y: ["-20px", "200px"],
  opacity: [() => 0.1, 1],
  onUpdate: ({ x, y, opacity }) => {
    styles(ball!, { x, y, opacity })
  },
})
