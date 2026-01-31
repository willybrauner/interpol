import "./index.css"
import { EaseName, interpol } from "@wbe/interpol"
import { createTweekpane } from "./utils/createTweakpane"
import { interpolateColor } from "./utils/interpolateColor"

const PARAMS = {
  ease: "power3.out" as EaseName,
  duration: 2000,
  colorFrom: "rgb(0, 10, 0)",
  colorTo: "#4bafcf",
}

/**
 * interpol
 */
const itp = interpol({
  paused: true,
  v: [0, 1],
  duration: 2000,
  onUpdate: ({ v }) => {
    document.body.style.background = interpolateColor(PARAMS.colorFrom, PARAMS.colorTo, v)
  },
})

const loop = async () => {
  await itp.play()
  await itp.reverse()
  loop()
}

loop()

const pane = createTweekpane(itp, PARAMS, loop)
const props = pane.addFolder({ title: "Props", expanded: true })
props.addBinding(PARAMS, "colorFrom", { label: "color (from)" }).on("change", () => {
  itp.refresh()
})
props.addBinding(PARAMS, "colorTo", { label: "color (to)" }).on("change", () => {
  itp.refresh()
})
