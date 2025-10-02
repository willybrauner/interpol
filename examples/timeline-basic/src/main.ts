import "./index.css"
import { styles, Timeline } from "@wbe/interpol"
import { Pane } from "tweakpane"

const wrapper = document.querySelector<HTMLElement>(".wrapper")!
const elements: HTMLElement[] = []
for (let i = 0; i < 3; i++) {
  const div = document.createElement("div")
  div.className = "element"
  elements.push(div)
  wrapper.appendChild(div)
}

function easeOutBack(x: number): number {
  const c1 = 1.70158
  const c3 = c1 + 1
  return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2)
}
function easeInOutBack(x: number): number {
  const c1 = 1.70158
  const c2 = c1 * 1.525
  return x < 0.5
    ? (Math.pow(2 * x, 2) * ((c2 + 1) * 2 * x - c2)) / 2
    : (Math.pow(2 * x - 2, 2) * ((c2 + 1) * (x * 2 - 2) + c2) + 2) / 2
}

const tl = new Timeline()

const duration = 800
const curringOnUpdate = (el: HTMLElement) => (props: any) => styles(el, props)

for (let i = 0; i < elements.length; i++) {
  const el = elements[i]
  tl.add(
    {
      rotate: [0, (i % 2 === 0 ? 1 : -1) * 360],
      scale: { from: 1, to: 0.8, ease: "power1.out" },
      duration,
      ease: "power2.inOut",
      onUpdate: curringOnUpdate(el),
    },
    `-=${i > 0 ? duration * 0.75 : 0}`,
  )
}

for (let i = 0; i < elements.length; i++) {
  const el = elements[i]
  tl.add(
    {
      x: [0, (i % 2 === 0 ? 1 : -1) * 150],
      duration: duration * 1,
      ease: easeInOutBack,
      onUpdate: curringOnUpdate(el),
    },
    `-=${i > 0 ? duration * 0.75 : 0}`,
  )
  tl.add(
    {
      scale: { from: 0.8, to: 1, ease: "power1.out" },
      duration: duration * 0.75,
      ease: "power2.out",
      onUpdate: curringOnUpdate(el),
    },
    `-=${duration}`,
  )
}

for (let i = 0; i < elements.length; i++) {
  const el = elements[i]
  tl.add(
    {
      x: [() => (i % 2 === 0 ? 1 : -1) * 150, 0],
      duration: duration * 1,
      ease: easeOutBack,
      onUpdate: curringOnUpdate(el),
    },
    `-=${duration * 0.75}`,
  )
}

const loop = async () => {
  await tl.play()
  loop()
}
loop()

const pane = new Pane({
  title: "Controls",
  expanded: true,
})
pane.addButton({ title: "play loop" }).on("click", () => loop())
// pane.addButton({ title: "reverse" }).on("click", () => {
//   tl.refresh()
//   tl.reverse()
// })
pane.addButton({ title: "pause" }).on("click", () => tl.pause())
pane.addButton({ title: "stop" }).on("click", () => tl.stop())
pane.addButton({ title: "resume" }).on("click", () => tl.resume())
pane.addButton({ title: "refresh" }).on("click", () => tl.refresh())
pane.addBinding({ progress: tl.progress() }, "progress", { min: 0, max: 1 }).on("change", (ev) => {
  tl.progress(ev?.value || 0)
})
