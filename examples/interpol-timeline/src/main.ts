import { Power1, Timeline, Interpol } from "@wbe/interpol"
import "./index.less"
;["play", "reverse", "pause", "stop", "refresh", "resume"].forEach(
  (name) => (document.querySelector<HTMLButtonElement>(`.${name}`).onclick = () => tl[name]())
)

const inputProgress = document.querySelector<HTMLInputElement>(".progress")
inputProgress.onchange = () => {
  tl.seek(parseFloat(inputProgress.value) / 100)
}
const inputSlider = document.querySelector<HTMLInputElement>(".slider")
inputSlider.oninput = () => {
  tl.seek(parseFloat(inputSlider.value) / 100)
}

document.querySelector<HTMLButtonElement>(`.play`).onclick = () => tl.play()
document.querySelector<HTMLButtonElement>(`.reverse`).onclick = () => tl.reverse()

const ball = document.querySelector<HTMLElement>(".ball")

/**
 * Utils
 *
 *
 *
 */

type Axis = [number, string?] | number
type Axis3d = [Axis, Axis, Axis]
const t3d = (dX: Axis = [0, "px"], dY: Axis = [0, "px"], dZ: Axis = [0, "px"]) => {
  //  const initial: Axis3d = [dX, dY, dZ]
  const current: Axis3d = [dX, dY, dZ]
  const toString = (c: Axis3d) => {
    return `translate3d(${c.reduce(
      (acc, axis, i) => acc + `${axis[0]}${axis[1]}` + (i !== c.length - 1 ? ", " : ""),
      ""
    )})`
  }
  return toString(current)

  // return {
  //   set: ({ x = current[0], y = current[1], z = current[2] }: { x?: Axis; y?: Axis; z?: Axis }) => {
  //     current[0][0] = x?.[0] ?? x ?? 0
  //     current[0][1] = x?.[1] || "px"
  //     current[1][0] = y?.[0] ?? y ?? 0
  //     current[1][1] = y?.[1] || "px"
  //     current[2][0] = z?.[0] ?? z ?? 0
  //     current[2][1] = z?.[1] || "px"
  //     return toString(current)
  //   },
  //   get: () => toString(current),
  //   reset: () => (current = initial),
  // }
}

/**
 *
 * Example
 *
 *
 */
const ballTranslate3d = t3d()

const tl: Timeline = new Timeline({
  debug: true,
  paused: true,
  onComplete: () => console.log(`tl complete reverse ? ${tl.isReversed}`),
})

const itp = new Interpol<"y" | "x">({
  props: {
    x: [0, 200],
    y: [0, 200],
  },
  duration: 500,
  ease: Power1.in,
  onUpdate: ({ props: { x, y } }) => {
    ball.style.transform = `translate3d(${x}px, ${y}px, 0)`
  },

  onComplete: (e) => {
    console.log("itp 1 onComplete", e)
  },
})

tl.add(itp)

tl.add({
  props: {
    x: [200, 100],
    y: [200, 300],
  },
  duration: 500,
  ease: Power1.out,
  onUpdate: ({ props: { x, y } }) => {
    ball.style.transform = `translate3d(${x}px, ${y}px, 0)`
  },
  onComplete: (e) => {
    console.log("itp 2 onComplete", e)
  },
})

tl.add({
  props: {
    x: [100, 0],
    y: [300, 0],
  },
  duration: 500,
  ease: Power1.out,
  onUpdate: ({ props: { x, y } }) => {
    ball.style.transform = `translate3d(${x}px, ${y}px, 0)`
  },
  onComplete: (e) => {
    console.log("itp 3 onComplete", e)
  },
})
