import "./index.css"
import { Interpol, styles } from "@wbe/interpol"

/**
 * Query
 */
const element = document.querySelector<HTMLElement>(".ball")
const play = document.querySelector<HTMLButtonElement>(".play")
const progress0 = document.querySelector<HTMLButtonElement>(".progress-0")
const progress05 = document.querySelector<HTMLButtonElement>(".progress-05")
const progress1 = document.querySelector<HTMLButtonElement>(".progress-1")
const inputProgress = document.querySelector<HTMLInputElement>(".progress")
const inputSlider = document.querySelector<HTMLInputElement>(".slider")

/**
 * Events
 */
;["reverse", "pause", "stop", "resume"].forEach(
  (name: any) =>
    // @ts-ignore
    (document.querySelector<HTMLButtonElement>(`.${name}`)!.onclick = () => itp[name]()),
)

play!.onclick = () => itp.play(0)
progress0!.onclick = () => itp.progress(0, false)
progress05!.onclick = () => itp.progress(0.5, false)
progress1!.onclick = () => itp.progress(1, false)
inputProgress!.onchange = () => itp.progress(parseFloat(inputProgress!.value) / 100, false)
inputSlider!.oninput = () => itp.progress(parseFloat(inputSlider!.value) / 100, false)

const itp = new Interpol({
  x: 100,
  y: { from: 0, to: 300 },
  opacity: [0.5, 1],
  z: [100, 0],
  // delay: 500,
  //debug: true,
  paused: true,

  onStart: (props, time, progress) => {
    console.log("itp onStart", props, time, progress)
  },
  onUpdate: ({ x, y, opacity, z }) => {
    //console.log("itp onUpdate", { x, y, opacity, z })
    styles(element!, { x, y, opacity })
  },
  onComplete: (props) => {
    console.log("itp onComplete", props)
  },
})

//itp.play()
