import "./index.css"
import { EaseName, Interpol, styles } from "@wbe/interpol"
import { Pane } from "tweakpane"

const element = document.querySelector<HTMLElement>(".element")!

const PARAMS = { ease: "power3.out" as EaseName }

const itp = new Interpol({
  debug: true,
  x: 100,
  y: { from: 0, to: 300 },
  rotate: [0, 360],
  paused: true,
  ease: () => PARAMS.ease,
  onStart: (props, time, progress) => {
    console.log("itp onStart", props, time, progress)
  },
  onUpdate: ({ x, y, rotate }) => {
    styles(element, { x, y, rotate })
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
pane.addBinding({ progress: itp.progress() }, "progress", { min: 0, max: 1 }).on("change", (ev) => {
  itp.progress(ev?.value || 0)
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

// const gui = new GUI({})
// gui.add({ play: () => itp.play() }, "play")
// gui.add({ reverse: () => itp.reverse() }, "reverse")
// gui.add({ pause: () => itp.pause() }, "pause")
// gui.add({ resume: () => itp.resume() }, "resume")
// gui.add({ stop: () => itp.stop() }, "stop")
// // progress
// gui.add({ progress: 0 }, "progress", 0, 1).onChange((value) => itp.progress(value as number))
