import "./styles.css"
import { EaseName, Interpol, styles } from "@wbe/interpol"
import { Pane } from "tweakpane"

const element = document.querySelector<HTMLElement>(".element")!

const PARAMS = {
  ease: "power3.out" as EaseName,
  duration: 2000,
  x: -100,
  scale: 1.4,
}

const itp = new Interpol({
  paused: true,
  x: [0, () => PARAMS.x],
  rotate: [0, 360],
  scale: [1, () => PARAMS.scale],
  duration: () => PARAMS.duration,
  ease: () => PARAMS.ease,
  onUpdate: ({ x, rotate, scale }) => styles(element, { x, rotate, scale }),
})

const pane = new Pane({
  title: "Controls",
  expanded: true,
})
pane.addButton({ title: "play" }).on("click", () => itp.play())
pane.addButton({ title: "reverse" }).on("click", () => itp.reverse())
pane.addButton({ title: "pause" }).on("click", () => itp.pause())
pane.addButton({ title: "stop" }).on("click", () => itp.stop())
pane.addButton({ title: "resume" }).on("click", () => itp.resume())
pane.addButton({ title: "refresh" }).on("click", () => itp.refresh())

pane.addBinding(PARAMS, "x", { min: -200, max: 200, label: "x (to)" }).on("change", () => {
  itp.refresh()
})
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
pane.addBinding({ progress: itp.progress() }, "progress", { min: 0, max: 1 }).on("change", (ev) => {
  itp.progress(ev?.value || 0)
})

pane.addBinding(PARAMS, "duration", { min: 0, max: 10000, step: 100 }).on("change", () => {
  itp.refresh()
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
    itp.refresh()
  })
