import "./App.css"
import React, { useEffect, useRef, useState } from "react"
import { Interpol, Ease, Timeline } from "../../../src"
import { Controls } from "./Controls"

export function App() {
  const $ball = useRef<HTMLDivElement>()
  const $ball2 = useRef<HTMLDivElement>()
  const $ball3 = useRef<HTMLDivElement>()
  const itp = useRef<Interpol>()
  const [instance, setInstance] = useState(null)

  useEffect(() => {
    const tl = new Timeline({
      debug: true,
      onComplete: () => console.log("Timeline One repeat complete"),
    })

    tl.add({
      from: () => 0,
      to: () => innerHeight,
      duration: 1000,
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
        duration: 1000,
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
      -800
    )
    tl.add(
      {
        from: 0,
        to: innerHeight / 2.5,
        duration: 1000,
        ease: Ease.inOutCubic,
        onUpdate: ({ value, time, advancement }) => {
          const x = advancement * (innerWidth / 2) - 20
          const y = -value * 0.8
          $ball3.current.style.transform = `
        translateX(${x}px)
        translateY(${y}px) 
        translateZ(0)
        `
        },
      },
      -500
    )

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
