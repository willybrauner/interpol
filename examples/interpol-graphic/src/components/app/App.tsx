import css from "./App.module.css"
import { useEffect, useMemo, useRef, useState } from "react"
import { useWindowSize } from "../../utils/useWindowSize"
import { Graph } from "../graph/Graph"
import { calcCoords } from "../../utils/calcCoords"
import { Timeline } from "@wbe/interpol"
import { randomRange } from "../../utils/randomRange"
import { createTweekpane } from "../../utils/createTweakpane"

export function App() {
  const ball = useRef<HTMLDivElement>(null)
  const { width } = useWindowSize()
  const [pointsNumber, setPointNumber] = useState(10)
  const tl = useRef<Timeline>(null)
  const coords = useMemo(() => calcCoords(pointsNumber), [pointsNumber])

  useEffect(() => {
    console.log("width", width)
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
    const pane = createTweekpane(tl.current as any, {})
    const props = pane.addFolder({ title: "Props", expanded: true })
    props
      .addBinding({ pointsNumber }, "pointsNumber", { min: 3, max: 100, step: 1 })
      .on("change", (ev) => setPointNumber(ev.value as number))

    return () => {
      tl.current.stop()
    }
  }, [width, coords, pointsNumber])

  return (
    <div className={css.root} key={`${width}-${pointsNumber}`}>
      <div className={css.wrapper}>
        <Graph coords={coords} />
        <div className={css.ball} ref={ball} />
      </div>
    </div>
  )
}
