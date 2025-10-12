import "./main.css"
import ReactDOM from "react-dom/client"
import { useEffect, useRef, useState } from "react"
import { Interpol, styles } from "@wbe/interpol"
import { useWindowSize } from "./utils/useWindowSize"

/**
 * Prepare
 */
function random(min: number, max: number, decimal = 0): number {
  let rand
  do rand = Math.random() * (max - min + 1) + min
  while (rand === 0)
  const power = Math.pow(10, decimal)
  return Math.floor(rand * power) / power
}
const randomRGB = () => `rgb(${random(0, 255)}, ${random(0, 255)}, ${random(0, 255)})`

const getEases = () =>
  ["power1", "power2", "power3", "expo"].reduce(
    (a, b) => [...a, ...["in", "out", "inOut"].map((d) => `${b}.${d}`)],
    [],
  )

const eases = getEases()
const randomEase = eases[random(0, eases.length - 1)]

/**
 * App
 */
export function App() {
  const els = useRef([])
  const [pointsNumber, setPointsNumber] = useState(150)
  const windowSize = useWindowSize()

  /**
   * Animate each particle
   */
  useEffect(() => {
    let itps = []
    for (let el of els.current) {
      const itp = new Interpol({
        paused: true,
        duration: () => random(1000, 3000),
        ease: randomEase,
        x: [random(0, innerWidth), () => random(0, innerWidth)],
        y: [random(0, innerHeight), () => random(0, innerHeight)],
        onUpdate: ({ x, y }) => {
          styles(el, { x, y })
        },
      })
      itps.push(itp)
      const yoyo = () => {
        itp.refresh()
        itp.play().then(() => itp.reverse().then(yoyo))
      }
      yoyo()
    }
    return () => {
      itps.forEach((e) => e.stop())
    }
  }, [pointsNumber, windowSize])

  return (
    <div className="app">
      <input
        className="input"
        name="particles number"
        autoFocus={true}
        value={pointsNumber}
        type={"number"}
        onChange={(e) => setPointsNumber(parseInt(e.target.value))}
      />
      <div className="wrapper">
        {pointsNumber > 0 &&
          new Array(pointsNumber)
            .fill(0)
            .map((_, i) => (
              <div
                key={i}
                className={"particle"}
                style={{ backgroundColor: randomRGB() }}
                ref={(r) => (els.current[i] = r as any)}
              />
            ))}
      </div>
    </div>
  )
}

/**
 * Render
 */
ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(<App />)
