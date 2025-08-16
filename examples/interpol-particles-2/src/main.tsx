import ReactDOM from "react-dom/client"
import "./main.less"
import { useEffect, useRef, useState } from "react"
import { styles, Timeline } from "@wbe/interpol"
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
  const [pointsNumber, setPointsNumber] = useState(2)
  const windowSize = useWindowSize()

  /**
   * Animate each particle
   */
  useEffect(() => {
    const timeline = new Timeline({
      onComplete: () => {
        //console.log("Timeline completed, restarting...")
      },
    })
    for (let i = 0; i < pointsNumber; i++) {
      const el = els.current[i]
      timeline.add(
        {
          immediateRender: true,
          paused: true,
          //debug: true,
          duration: 1000,
          ease: randomEase,
          x: [innerWidth / 2, () => random(0, innerWidth)],
          y: [innerHeight / 2, () => random(0, innerHeight)],
          // x: [random(innerWidth / 3, innerWidth / 6), () => random(0, innerWidth)],
          // y: [random(0, innerHeight), () => random(0, innerHeight)],
          scale: { from: 0, to: 16 },
          opacity: [1, 0],

          onUpdate: ({ x, y, scale, opacity }) => {
            styles(el, { x, y, scale, opacity })
          },
        },
        random(0, 100),
      )
    }

    const yoyo = () => {
      console.log("Yoyoing...")
      timeline.play().then(() => {
        console.log("EXAMPLE END Timeline completed, restarting...")
        yoyo()
      })
    }

    yoyo()
  }, [pointsNumber, windowSize])

  return (
    <div>
      <input
        autoFocus={true}
        value={pointsNumber}
        type={"number"}
        onChange={(e) => setPointsNumber(parseInt(e.target.value))}
      />
      {pointsNumber > 0 &&
        new Array(pointsNumber)
          .fill(0)
          .map((_, i) => (
            <div
              key={i}
              className={"particle"}
              style={{ backgroundColor: randomRGB() }}
              ref={(r) => (els.current[i] = r) as any}
            />
          ))}
    </div>
  )
}

/**
 * Render
 */
ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(<App />)
