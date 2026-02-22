import "./index.css"
import { styles, Timeline } from "@wbe/interpol"

// ---------------------------------------------------------------------------------------

const apply = (el: HTMLElement) => (props: any) => styles(el, props)

const makeBoxes = (wrapperSelector: string, count = 3): HTMLElement[] =>
  Array.from({ length: count }, () => {
    const el = document.createElement("div")
    el.className = "element"
    document.querySelector<HTMLElement>(wrapperSelector)!.appendChild(el)
    return el
  })

const boxesA = makeBoxes(".wrapper-a")
const boxesB = makeBoxes(".wrapper-b")

// ---------------------------------------------------------------------------------------
//  Group A

const tlA_in = new Timeline({ paused: true })
boxesA.forEach((el, i) =>
  tlA_in.add(
    {
      x: [-280, 0],
      opacity: [0, 1],
      duration: 600,
      ease: "power3.out",
      onUpdate: apply(el),
    },
    i === 0 ? "0" : `+=${80}`,
  ),
)

const tlA_bounce = new Timeline({ paused: true })
boxesA.forEach((el, i) =>
  tlA_bounce.add(
    {
      scale: [1, 1.3],
      duration: 300,
      ease: "power1.out",
      onUpdate: apply(el),
    },
    i === 0 ? "0" : `+=${60}`,
  ),
)

const tlA_out = new Timeline({ paused: true })
boxesA.forEach((el, i) =>
  tlA_out.add(
    {
      rotate: [0, 180],
      y: [0, -200],
      opacity: [1, 0],
      duration: 500,
      ease: "power2.in",
      onUpdate: apply(el),
    },
    i === 0 ? "0" : `+=${80}`,
  ),
)

const tlGroupA = new Timeline({ paused: true })
tlGroupA.add(tlA_in)
tlGroupA.add(tlA_bounce)
tlGroupA.add(tlA_out)

// ---------------------------------------------------------------------------------------
//  Group B

const tlB_in = new Timeline({ paused: true })
boxesB.forEach((el, i) =>
  tlB_in.add(
    {
      scale: [0, 1],
      opacity: [0, 1],
      duration: 500,
      ease: "expo.out",
      onUpdate: apply(el),
    },
    i === 0 ? "0" : `+=${100}`,
  ),
)

const tlB_shuffle = new Timeline({ paused: true })
boxesB.forEach((el, i) => {
  const dir = i % 2 === 0 ? 1 : -1
  tlB_shuffle.add(
    {
      x: [0, dir * 50],
      duration: 350,
      ease: "power1.inOut",
      onUpdate: apply(el),
    },
    i === 0 ? "0" : `-=${50}`,
  )
})

const tlB_out = new Timeline({ paused: true })
boxesB.forEach((el, i) =>
  tlB_out.add(
    {
      scale: [1, 0],
      y: [0, 120],
      opacity: [1, 0],
      duration: 500,
      ease: "power3.in",
      onUpdate: apply(el),
    },
    i === 0 ? "0" : `+=${80}`,
  ),
)

const tlGroupB = new Timeline({ paused: true })
tlGroupB.add(tlB_in)
tlGroupB.add(tlB_shuffle)
tlGroupB.add(tlB_out)

//  main timeline: both groups run in parallel
const tl = new Timeline({ paused: true })
tl.add(tlGroupA, 0)
tl.add(tlGroupB, 100)

const loop = async () => {
  await tl.play()
  await tl.reverse()
  loop()
}
loop()
