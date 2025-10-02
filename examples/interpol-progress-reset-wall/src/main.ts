import { Timeline, Interpol, styles } from "@wbe/interpol"
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
    duration: 1000,
    ease: "linear",
    x: [() => -innerWidth * 0.9, 0],
    onUpdate: ({ x }) => {
      styles(wall, { x })
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
    itp.refresh()
    itp.progress(0)
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
    duration: 1000,
    ease: "linear",
    x: [() => -innerWidth * 0.9, 0],
    onUpdate: ({ x }) => {
      styles(wall, { x })
    },
  })
  tl.add({
    debug: true,
    duration: 1000,
    ease: "linear",
    x: [0, () => -innerWidth * 0.5],
    onUpdate: ({ x }) => {
      styles(wall, { x })
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
    tl.refresh()
    tl.progress(0)
    isVisible = false
  })
}

// testWithTimeline()
