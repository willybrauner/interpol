import "./App.css"
import React, { useEffect, useRef, useState } from "react"
import { Interpol, Ease } from "interpol"
import { Controls } from "./Controls"

export function App() {
  const $ball = useRef<HTMLDivElement>()
  const itp = useRef<Interpol>()
  const [instance, setInstance] = useState()

  useEffect(() => {
    const i = new Interpol({
      from: () => 0,
      to: () => innerHeight,
      duration: () => 2000,
      ease: Ease.inExpo,
      reverseEase: Ease.inQuint,
      paused: true,
      yoyo: true,
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
