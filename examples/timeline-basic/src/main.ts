import "./index.css"
import { styles, Timeline } from "@wbe/interpol"
import { createTweekpane } from "./utils/createTweakpane"

const wrapper = document.querySelector<HTMLElement>(".wrapper")!
const elements: HTMLElement[] = []
for (let i = 0; i < 3; i++) {
  const div = document.createElement("div")
  div.className = "element"
  elements.push(div)
  wrapper.appendChild(div)
}

const main = new Timeline()

const duration = 800

for (let i = 0; i < elements.length; i++) {
  const el = elements[i]
  const tl = new Timeline({ meta: { element: el, index: i } })
  tl.add({
    rotate: [0, (i % 2 === 0 ? 1 : -1) * 360],
    scale: { from: 1, to: 0.8, ease: "power1.out" },
    duration,
    ease: "power2.inOut",
    onUpdate: ({ rotate, scale }) => {
      styles(el, { rotate, scale })
    },
  })

  const fromX = (i % 2 === 0 ? 1 : -1) * 150
  const fromX2 = (i % 2 === 0 ? -1 : +1) * 100
  tl.add({
    x: [0, fromX, fromX2, 0],
    duration: duration * 1.8,
    ease: "power3.inOut",
    onUpdate: ({ x }) => {
      styles(el, { x })
    },
  })

  tl.add(
    {
      scale: { from: 0.8, to: 1, ease: "power1.out" },
      duration: duration * 0.75,
      ease: "expo.out",
      onUpdate: ({ scale }) => {
        styles(el, { scale })
      },
    },
    `-=${duration}`,
  )

  main.add(tl, i * 200)
}

const yoyo = async () => {
  await main.play()
  yoyo()
}
yoyo()

createTweekpane(main, {}, yoyo)
