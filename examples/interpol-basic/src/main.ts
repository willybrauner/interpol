import "./index.css"
import { EaseName, Interpol, styles } from "@wbe/interpol"
import { Pane } from "tweakpane"

const element = document.querySelector<HTMLElement>(".element")!

const PARAMS = {
  ease: "power3.out" as EaseName,
  duration: 2000,
  x: 200,
}

const itp = new Interpol({
  debug: true,
  x: [0, () => PARAMS.x],
  rotate: [0, 360],
  paused: true,
  duration: () => PARAMS.duration,
  ease: () => PARAMS.ease,
  onStart: (props, time, progress) => {
    console.log("itp onStart", props, time, progress)
  },
  onUpdate: ({ x, rotate }) => {
    styles(element, { x, rotate })
  },
  onComplete: (props, time, progress, instance) => {
    console.log("itp onComplete", props, time, progress, instance)
  },
})

const pane = new Pane()
pane.addButton({ title: "play" }).on("click", () => itp.play())
pane.addButton({ title: "reverse" }).on("click", () => itp.reverse())
pane.addButton({ title: "pause" }).on("click", () => itp.pause())
pane.addButton({ title: "stop" }).on("click", () => itp.stop())
pane.addButton({ title: "resume" }).on("click", () => itp.resume())
pane.addButton({ title: "refresh" }).on("click", () => itp.refreshComputedValues())

// add x binding
pane.addBinding(PARAMS, "x", { min: -200, max: 200, label: "x (to)" }).on("change", () => {
  itp.refreshComputedValues()
})

pane.addBinding({ progress: itp.progress() }, "progress", { min: 0, max: 1 }).on("change", (ev) => {
  itp.progress(ev?.value || 0)
})

pane.addBinding(PARAMS, "duration", { min: 0, max: 10000, step: 100 }).on("change", () => {
  itp.refreshComputedValues()
})

const eases = [
  "linear",
  "expo.in",
  "expo.out",
  "expo.inOut",
  "power1.in",
  "power1.out",
  "power1.inOut",
  "power2.in",
  "power2.out",
  "power2.inOut",
  "power3.in",
  "power3.out",
  "power3.inOut",
].reduce(
  (acc, cur) => {
    acc[cur] = cur
    return acc
  },
  {} as Record<string, string>,
)

pane
  .addBinding(PARAMS, "ease", {
    options: eases,
  })
  .on("change", () => {
    itp.refreshComputedValues()
  })
