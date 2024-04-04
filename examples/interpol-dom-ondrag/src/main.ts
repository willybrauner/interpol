import "./index.less"
import { Interpol, InterpolOptions, styles } from "@wbe/interpol"
import { DragGesture } from "@use-gesture/vanilla"
import gsap from "gsap"

const ball = document.querySelector<HTMLElement>(".ball")

let state = {
  current: {
    x: 0,
    y: 0
  },
  target: {
    x: 0,
    y: 0
  }
}

// -------------------------------------------------------------------------------------------------

/**
 * Using interpol
 *
 * Not really perf, because we have to recreate an object on each dragging pixel
 */
new DragGesture(ball, ({ active, delta: [dx, dy] }) => {
  // set the new target
  state.target.x += dx
  state.target.y += dy

  new Interpol({
    ease: "expo.out",
    duration: 2000,
    props: {
      x: { from: state.current.x, to: state.target.x },
      y: { from: state.current.y, to: state.target.y }
    },
    onUpdate: ({ x, y }) => {
      // anim
      styles(ball, { x: x + "px", y: y + "px" })

      // update the current values
      state.current.x = x
      state.current.y = y
    },
  })

})


// -------------------------------------------------------------------------------------------------

/**
 * Using simple lerp & raf

const lerp = (a: number, b: number, t: number) => a + (b - a) * t

new DragGesture(ball, ({ delta: [dx, dy] }) => {
  state.target.x += dx
  state.target.y += dy
})

InterpolOptions.ticker.add(()=> {
  state.current.x  = lerp(state.current.x, state.target.x, 0.04)
  state.current.y  = lerp(state.current.y, state.target.y, 0.04)
  ball.style.transform = `translate3d(${state.current.x}px, ${state.current.y}px, ${0}px)`
})

*/

// -------------------------------------------------------------------------------------------------

/**
 * Using GSAP

new DragGesture(ball, ({ delta: [dx, dy] }) => {
  state.current.x += dx
  state.current.y += dy
  gsap.to(ball, {
    duration: 2,
    x: state.current.x,
    y: state.current.y,
    ease: "expo.out"
  })
})

 */

