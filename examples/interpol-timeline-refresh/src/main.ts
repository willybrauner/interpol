import { Timeline } from "@wbe/interpol"
import "./index.less"

const ball = document.querySelector<HTMLElement>(".ball")
const tl: Timeline = new Timeline({ debug: false, paused: true })

/**
 * The goal of this example is to use an external value, muted on onUpdate callbacks
 * of each interpol instance.
 *
 * This value is used as "from" computed value of the next interpol instance.
 *
 */
let EXTERNAL_X = 0

tl.add({
  el: ball,
  duration: 1000,
  ease: "power3.in",
  props: {
    x: [0, 70, "vw"],
  },
  onUpdate: ({ x }) => {
    EXTERNAL_X = parseFloat(x)
    console.log("1 - x", x)
  },
})
tl.add({
  el: ball,
  duration: 1000,
  props: {
    x: [() => EXTERNAL_X, 20, "vw"],
  },
  onUpdate: ({ x }) => {
    EXTERNAL_X = parseFloat(x)
    console.log("2 - x", x)
  },
})

tl.add({
  el: ball,
  duration: 1000,
  props: {
    x: [() => EXTERNAL_X, 50, "vw"],
  },
  onUpdate: ({ x }) => {
    console.log("3 - x", x)
  },
})

tl.play()
