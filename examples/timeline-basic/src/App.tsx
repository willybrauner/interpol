import "./App.css"
import React, { useEffect, useRef, useState } from "react"
import { Interpol, Ease, Timeline } from "interpol"
import { Controls } from "./Controls"

export function App() {
  const $ball = useRef<HTMLDivElement>()
  const $ball2 = useRef<HTMLDivElement>()
  const itp = useRef<Interpol>()
  const [instance, setInstance] = useState()

  useEffect(() => {
    const tl = new Timeline()

    tl.add({
      from: () => 0,
      to: () => innerHeight,
      duration: 2000,
      ease: Ease.inOutQuart,
      onUpdate: ({ value, time, advancement }) => {
        const x = advancement * (innerWidth / 2) - 20
        const y = -value * 0.8
        $ball.current.style.transform = `
        translateX(${x}px)
        translateY(${y}px) 
        translateZ(0)
        `
      },
    })
    tl.add(
      {
        from: 0,
        to: innerHeight / 2,
        duration: 2000,
        ease: Ease.inOutQuart,
        onUpdate: ({ value, time, advancement }) => {
          const x = advancement * (innerWidth / 2) - 20
          const y = -value * 0.8
          $ball2.current.style.transform = `
        translateX(${x}px)
        translateY(${y}px) 
        translateZ(0)
        `
        },
      },
      -1500
    )

    setInstance(tl)
  }, [])

  return (
    <div className={"App"}>
      <Controls instance={instance} />
      <div className={"ball"} ref={$ball} />
      <div className={"ball ball-2"} ref={$ball2} />
    </div>
  )
}
