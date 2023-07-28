import css from "./App.module.less"
import React, { useEffect, useMemo, useRef, useState } from "react"
import { useWindowSize } from "../../../libs/useWindowSize"
import { Graph } from "../graph/Graph"
import { calcCoords } from "../../utils/calcCoords"
import { Timeline } from "@wbe/interpol"
import { Controls } from "../controls/Controls"
import { Params } from "../params/Params"
import { randomRange } from "../../utils/randomRange"

export function App() {
  const ball = useRef<HTMLDivElement>(null)
  const { width } = useWindowSize()

  const [counterRefresh, setCounterRefresh] = useState(0)
  const [instance, setInstance] = useState<Timeline>(null)
  const [params, setParams] = useState<{ time: number; progress: number }>({
    time: 0,
    progress: 0,
  })
  const [pointsNumber, setPointNumber] = useState(10)
  const tl = useRef<Timeline>(null)

  // calc coords
  const coords = useMemo(() => calcCoords(pointsNumber), [counterRefresh, pointsNumber])

  const firstMount = useRef(true)
  useEffect(() => {
    tl.current = new Timeline({
      onUpdate: (time: number, progress: number) => setParams({ time, progress }),
    })

    const eases = [
      "power1.in",
      "power1.out",
      "power1.inOut",
      "power3.in",
      "power3.out",
      "power3.inOut",
    ]

    for (let props of coords) {
      tl.current.add({
        props,
        delay: 100,
        duration: () => randomRange(100, 600),
        //ease: eases[randomRange(0, eases.length - 1)] as any,
        ease: "power1.out",
        onUpdate: ({ x, y }) => {
          ball.current.style.transform = `translate3d(${x}px, ${y}px, 0)`
        },
      })
    }

    setInstance(tl.current)
    if (firstMount.current) {
      firstMount.current = false
      return
    } else {
      tl.current.stop()
      //itp.play()
    }
  }, [width, coords, counterRefresh, pointsNumber])

  return (
    <div className={css.root} key={`${counterRefresh}-${width}-${pointsNumber}`}>
      <Controls
        className={css.controls}
        instance={instance}
        pointsNumber={pointsNumber}
        onRefreshClick={() => {
          setCounterRefresh((prevState) => prevState + 1)
        }}
        onPointNumberChange={(v) => setPointNumber(v)}
      />
      <div className={css.wrapper}>
        <Graph coords={coords} />
        <div className={css.ball} ref={ball} />
        <Params className={css.params} params={params} />
      </div>
    </div>
  )
}
