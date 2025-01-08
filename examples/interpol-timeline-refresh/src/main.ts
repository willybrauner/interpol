import { styles, Timeline } from "@wbe/interpol"
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
  ease: "power3.in",
  x: [0, 70],
  onUpdate: ({ x }) => {
    EXTERNAL_X = x
    styles(ball, { x: `${x}vw` })
    console.log("1 - x", x)
  },
})
tl.add({
  x: [() => EXTERNAL_X, 20],
  onUpdate: ({ x }) => {
    styles(ball, { x: `${x}vw` })
    EXTERNAL_X = x
    console.log("2 - x", x)
  },
})
tl.add({
  x: [() => EXTERNAL_X, 50],
  onUpdate: ({ x }) => {
    styles(ball, { x: `${x}vw` })
    console.log("3 - x", x)
  },
})

tl.play()
