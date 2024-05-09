import { Timeline, Interpol } from "@wbe/interpol"
import "./style.css"

const wall = document.querySelector<HTMLElement>(".wall")
const button = document.querySelector<HTMLElement>(".button")

/**
 * Test wall seek played on click & seeked on resize
 * Goal: the wall should seek properly and computedValues refreshed when the window is resized
 */

/**
 * Test with Interpol
 */
const testWithInterpol = () => {
  const itp = new Interpol({
    immediateRender: true,
    paused: true,
    debug: true,
    el: wall,
    duration: 1000,
    ease: "linear",
    props: {
      x: [() => -innerWidth * 0.9, 0, "px"],
    },
  })

  let isVisible = false
  const openClose = () => {
    isVisible = !isVisible
    if (isVisible) itp.play()
    else itp.reverse()
  }
  openClose()
  button?.addEventListener("click", () => {
    openClose()
  })

  window.addEventListener("resize", () => {
    itp.refreshComputedValues()
    itp.seek(0)
    isVisible = false
  })
}

testWithInterpol()

/**
 * Test with Timeline
 */
const testWithTimeline = () => {
  const tl = new Timeline({ paused: true })
  tl.add({
    immediateRender: true,
    paused: true,
    debug: true,
    el: wall,
    duration: 1000,
    ease: "linear",
    props: {
      x: [() => -innerWidth * 0.9, 0, "px"],
    },
  })
  tl.add({
    debug: true,
    el: wall,
    duration: 1000,
    ease: "linear",
    props: {
      x: [0, () => -innerWidth * 0.5, "px"],
    },
  })

  let isVisible = false
  const openClose = () => {
    isVisible = !isVisible
    if (isVisible) tl.play()
    else tl.reverse()
  }
  openClose()
  button?.addEventListener("click", () => {
    openClose()
  })
  window.addEventListener("resize", () => {
    tl.refreshComputedValues()
    tl.seek(0)
    isVisible = false
  })
}

// testWithTimeline()
