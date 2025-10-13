import "./index.css"
import ReactDOM from "react-dom/client"
import { useEffect, useMemo, useRef, useState } from "react"
import { Timeline } from "@wbe/interpol"
import { Graph } from "./components/graph/Graph"
import { calcCoords } from "./utils/calcCoords"
import { createTweekpane } from "./utils/createTweakpane"
import { randomRange } from "./utils/randomRange"
import { useWindowSize } from "./utils/useWindowSize"
import { Pane } from "tweakpane"

export function App() {
  const ball = useRef<HTMLDivElement>(null)
  const { width } = useWindowSize()
  const [pointsNumber, setPointNumber] = useState(10)
  const tl = useRef<Timeline>(null)
  const coords = useMemo(() => calcCoords(pointsNumber), [pointsNumber])

  const paneRef = useRef<any>(null)
  useEffect(() => {
    tl.current = new Timeline()
    for (let props of coords) {
      tl.current.add({
        ...props,
        delay: 100,
        duration: randomRange(100, 600),
        ease: "power1.out",
        onUpdate: ({ x, y }: { x: number; y: number }) => {
          ball.current.style.transform = `translate3d(${x}px, ${y}px, 0)`
        },
      })
    }

    if (paneRef.current) {
      paneRef.current?.refresh()
    }
    paneRef.current = createTweekpane(tl.current as any, {})
    const props = paneRef.current.addFolder({ title: "Props", expanded: true })
    props
      .addBinding({ pointsNumber }, "pointsNumber", { min: 3, max: 100, step: 1 })
      .on("change", (ev) => setPointNumber(ev.value as number))

    return () => {
      tl.current.stop()
    }
  }, [width, coords, pointsNumber])

  useEffect(() => {
    console.log("pointsNumber", pointsNumber)
  }, [pointsNumber])

  return (
    <div key={`${width}-${pointsNumber}`}>
      <div className={"wrapper"}>
        <Graph coords={coords} />
        <div className={"ball"} ref={ball} />
      </div>
    </div>
  )
}

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(<App />)
