import "./style.css"
import { Interpol, styles } from "@wbe/interpol"
import { randomRGB, random } from "./utils"

const app = document.getElementById("app")!
const appRect = app.getBoundingClientRect()

let mousePos = { x: 0, y: 0 }
let lastMousePos = { x: 0, y: 0 }
let mouseVelocity = { x: 0, y: 0 }
document.addEventListener("mousemove", (e) => {
  lastMousePos = { ...mousePos }
  mousePos = { x: e.clientX, y: e.clientY }
  mouseVelocity = {
    x: mousePos.x - lastMousePos.x,
    y: mousePos.y - lastMousePos.y,
  }
})

const num = Math.pow(6, 4)
for (let i = 0; i < num; i++) {
  const el = document.createElement("div")
  el.className = "element"
  app.appendChild(el)

  const margin: number = 3
  const colNumber = Math.sqrt(num)
  const ballSize = appRect.width / colNumber - margin
  const col = i % colNumber
  const initial = {
    x: (col / (colNumber - 1)) * (appRect.width - ballSize),
    y: Math.floor(i / colNumber) * ((appRect.height - ballSize) / (colNumber - 1)),
  }
  const kickForce = 50

  styles(el, {
    background: randomRGB(),
    width: ballSize + "px",
    height: ballSize + "px",
  })

  const itp = new Interpol({
    paused: true,
    immediateRender: true,
    duration: () => 1000,
    x: [initial.x, () => initial.x + mouseVelocity.x * kickForce],
    y: [initial.y, () => initial.y + mouseVelocity.y * kickForce],
    rotate: { from: 0, to: random(-720, 720) },
    scale: { from: 1, to: () => random(1, 3) },
    opacity: { from: 1, to: 1, ease: "expo.out" },
    ease: "power2.out",
    //reverseEase: "power3.inOut",
    onUpdate: ({ x, y, rotate, scale, opacity }) => {
      styles(el, { x, y, scale, rotate, pointerEvent: "none" })
    },
    onComplete: () => {
      styles(el, { pointerEvent: null })
    },
  })

  el.addEventListener("mousemove", async () => {
    if (itp.isPlaying) return
    itp.refreshComputedValues()
    await itp.play()
    await itp.reverse()
  })
}
