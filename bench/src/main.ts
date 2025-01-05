import gsap from "gsap"
import "./style.css"
import { Interpol, styles } from "@wbe/interpol"

const ball = document.querySelectorAll<HTMLElement>(".ball")

const gsapTest = () => {
  return gsap.to(ball, {
    x: 500,
    y: 500,
    scale: 1.2,
    rotate: 45,
    duration: 2,
    ease: "power1.inOut",
    stagger: 0.01,
  })
}

const interpolTest = () => {
  for (let i = 0; i < ball.length; i++) {
    const el = ball[i]
    new Interpol({
      immediateRender: true,
      x: 500,
      y: 500,
      scale: [1, 1.2],
      rotate: 45,
      duration: 2000,
      delay: 10 * i,
      ease: "power1.inOut",
      onUpdate: ({ x, y, scale, rotate }) => {
        styles(el, {
          x: x + "px",
          y: y + "px",
          scale: scale,
          rotate: rotate + "deg",
        })
      },
    })
  }
}

function measurePerformance(label: string, testFn: () => void) {
  const start = performance.now()
  testFn()
  requestAnimationFrame(() => {
    const end = performance.now()
    console.log(label, `- execution time: ${(end - start).toFixed(2)}ms`)
  })
}

function measureFPS(label: string, testFn: () => void) {
  let frameCount = 0
  const startTime = performance.now()

  const animationLoop = () => {
    frameCount++
    const elapsed = performance.now() - startTime
    if (elapsed < 3000) {
      requestAnimationFrame(animationLoop)
    } else {
      console.log(label, `- fps: ${(frameCount / (elapsed / 1000)).toFixed(2)}`)
    }
  }

  testFn()
  animationLoop()
}

// Run Benchmarks
// measurePerformance("interpol", interpolTest)
// measureFPS("interpol", interpolTest)

measurePerformance("gsap", gsapTest)
measureFPS("gsap", gsapTest)

