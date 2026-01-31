import "./style.css"
import { interpol, styles } from "@wbe/interpol"
import { randomRGB, random, randomEase } from "./utils"

const app = document.getElementById("app")!

for (let i = 0; i < 120; i++) {
  const el = document.createElement("div")
  el.className = "element"
  app.appendChild(el)
  styles(el, { background: randomRGB() })

  const itp = interpol({
    duration: () => random(2000, 5000),
    delay: () => random(100, 10000),
    x: [innerWidth / 2, () => random(0, innerWidth)],
    y: [innerHeight / 2, () => random(0, innerHeight)],
    scale: { from: 0, to: 5 },
    opacity: [1, 0],
    ease: randomEase(),
    onUpdate: ({ x, y, scale, opacity }) => {
      styles(el, { x, y, scale, opacity })
    },
  })

  const yoyo = async () => {
    await itp.play()
    itp.refresh()
    yoyo()
  }
  yoyo()
}
