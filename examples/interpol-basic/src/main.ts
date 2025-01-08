import "./index.css"
import { Interpol, styles } from "@wbe/interpol"

/**
 * Query
 */
const element = document.querySelector<HTMLElement>(".ball")
const seek0 = document.querySelector<HTMLButtonElement>(".seek-0")
const seek05 = document.querySelector<HTMLButtonElement>(".seek-05")
const seek1 = document.querySelector<HTMLButtonElement>(".seek-1")
const inputProgress = document.querySelector<HTMLInputElement>(".progress")
const inputSlider = document.querySelector<HTMLInputElement>(".slider")

/**
 * Events
 */
;["play", "reverse", "pause", "stop", "resume"].forEach(
  (name: any) =>
    // @ts-ignore
    (document.querySelector<HTMLButtonElement>(`.${name}`)!.onclick = () => itp[name]()),
)

seek0!.onclick = () => itp.seek(0, false)
seek05!.onclick = () => itp.seek(0.5, false)
seek1!.onclick = () => itp.seek(1, false)
inputProgress!.onchange = () => itp.seek(parseFloat(inputProgress!.value) / 100, false)
inputSlider!.oninput = () => itp.seek(parseFloat(inputSlider!.value) / 100, false)

const itp = new Interpol({
  x: 100,
  y: { from: 0, to: 300 },
  opacity: [0.5, 1],
  z: [100, 0],
  b: "dldl",
  
  onUpdate: ({ x, y, opacity, z, b, s }) => {
    styles(element!, { x, y, opacity })
  },
  onComplete: (props) => {
    console.log("itp onComplete", props)
  },
})
