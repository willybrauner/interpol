import "./index.css"
import { EaseName, Interpol, styles } from "@wbe/interpol"
import { createTweekpane } from "./utils/createTweakpane"

const element = document.querySelector<HTMLElement>(".element")!

const PARAMS = {
  ease: "power2.out" as EaseName,
  duration: 2200,
  scale: 1.6,
}

const itp = new Interpol({
  paused: true,
  x: [0, -100, 100, -50, 50, -25, 25, 0],
  scale: [1, () => PARAMS.scale, 1],
  duration: () => PARAMS.duration,
  ease: () => PARAMS.ease,
  onUpdate: ({ scale, x }) => styles(element, { scale, x }),
})

const loop = async () => {
  await itp.play()
  loop()
}
loop()

const pane = createTweekpane(itp, PARAMS, loop)

pane
  .addBinding(PARAMS, "scale", {
    min: 0.7,
    max: 2.5,
    step: 0.1,
    label: "scale (to)",
  })
  .on("change", () => {
    itp.refresh()
  })
