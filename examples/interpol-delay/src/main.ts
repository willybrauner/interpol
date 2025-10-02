import "./style.css"
import { Interpol, styles } from "@wbe/interpol"
import { randomRGB, random } from "./utils"

const app = document.getElementById("app")!

for (let i = 0; i < 120; i++) {
  const el = document.createElement("div")
  el.className = "element"
  app.appendChild(el)
  styles(el, { background: randomRGB() })

  const itp = new Interpol({
    duration: () => random(1000, 5000),
    delay: () => random(100, 5000),
    x: [innerWidth / 2, () => random(0, innerWidth)],
    y: [innerHeight / 2, () => random(0, innerHeight)],
    scale: { from: 0, to: 5 },
    opacity: [1, 0],
    ease: "power1.out",
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
