import "./index.css"
import { EaseName, interpol, styles } from "@wbe/interpol"
import { createTweekpane } from "./utils/createTweakpane"

const element = document.querySelector<HTMLElement>(".element")!

const PARAMS = {
  ease: "power2.out" as EaseName,
  duration: 1200,
  scale: 1.6,
}

const itp = interpol({
  paused: true,
  rotate: [0, 360],
  scale: [1, () => PARAMS.scale],
  duration: () => PARAMS.duration,
  ease: () => PARAMS.ease,
  onUpdate: ({ rotate, scale }) => styles(element, { rotate, scale }),
})

const loop = async () => {
  await itp.play()
  await itp.reverse()
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
