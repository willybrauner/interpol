import { Timeline } from "@wbe/interpol"
import "./index.less"

/**
 * Query
 */
const ball = document.querySelector<HTMLElement>(".ball")


/**
 * Timeline
 */
const tl: Timeline = new Timeline({ debug: false, paused: true})

/**
 * The goal of this example is to use an external value, muted on onUpdate callbacks
 * of each interpol instance.
 *
 * This value is used as "from" computed value of the next interpol instance.
 *
 */
let EXTERNAL_X = 0

tl.add(
  {
    el: ball,
    duration: 1000,
    ease: "power3.in",
    props: {
      x: [0, 200, "px"],
    },
    onUpdate: ({ x, y }) => {
      // register the external value
      EXTERNAL_X = parseFloat(x)
      console.log(EXTERNAL_X)
    }
  }
)
tl.add({
  el: ball,
  duration: 1000,
  props: {
    x: [ ()=> EXTERNAL_X, 50, "px"],
  },
  onUpdate: ({ x, y }) => {
    // register the external value
    EXTERNAL_X = parseFloat(x)
    console.log("2 - x", x)
  }
})

tl.add({
  el: ball,
  duration: 1000,
  props: {
    x: [ ()=> EXTERNAL_X, 100, "px"],
  },
  onUpdate: ({ x, y }) => {
    console.log("3 - x", x)
  }
})

tl.play()
//   .then(() => {
//   tl.reverse()
// })

