import "./App.css"
import React, { useEffect, useRef, useState } from "react"
import { Interpol, Ease, Timeline } from "../../../src"
import { Controls } from "./Controls"

export function App() {
  const $ball = useRef<HTMLDivElement>()
  const $ball2 = useRef<HTMLDivElement>()
  const $ball3 = useRef<HTMLDivElement>()
  const [instance, setInstance] = useState(null)

  useEffect(() => {
    const tl = new Timeline({
      debug: true,
      onComplete: () => console.log("Timeline One repeat complete"),
    })

    const itp = (el, to) => ({
      from: () => 0,
      to: () => to,
      duration: 800,
      ease: Ease.inOutQuart,
      onUpdate: ({ value, time, progress }) => {
        const x = progress * innerWidth - 50
        const y = -value * 0.8
        el.style.transform = `
        translateX(${x}px)
        translateY(${y}px) 
        translateZ(0)
        `
      },
    })

    tl.add(itp($ball.current, innerHeight), 0)
    tl.add(itp($ball2.current, innerHeight / 2), -400)
    tl.add(itp($ball3.current, innerHeight / 2.5), -500)

    setInstance(tl)
  }, [])

  return (
    <div className={"App"}>
      <Controls instance={instance} />
      <div className={"balls"}>
        <div className={"ball"} ref={$ball} />
        <div className={"ball"} ref={$ball2} />
        <div className={"ball"} ref={$ball3} />
      </div>
    </div>
  )
}
