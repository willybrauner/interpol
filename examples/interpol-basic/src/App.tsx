import "./App.css"
import React, { useEffect, useRef, useState } from "react"
import { Interpol, Ease } from "../../../src"
import { Controls } from "./Controls"

export function App() {
  const $ball = useRef<HTMLDivElement>()
  const itp = useRef<Interpol>()
  const [instance, setInstance] = useState(null)

  useEffect(() => {
    const i = new Interpol({
      from: () => 0,
      to: () => innerHeight,
      duration: 1000,
      ease: Ease.linear,
      paused: true,
      debug:true,
      onUpdate: ({ value, time, advancement }) => {
        const x = advancement * innerWidth - 20
        const y = -value
        $ball.current.style.transform = `
        translateX(${x}px)
        translateY(${y}px) 
        translateZ(0)
        `
      },
    })
    setInstance(i)
  }, [])

  return (
    <div className={"App"}>
      <Controls instance={instance} />
      <div className={"ball"} ref={$ball} />
    </div>
  )
}
