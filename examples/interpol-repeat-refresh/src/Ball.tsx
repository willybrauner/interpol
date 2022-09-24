import "./Ball.css"
import React, { useEffect, useRef } from "react"
import { Interpol, Ease } from "interpol"
import { randomRange } from "./randomRange"

export const Ball = () => {
  useEffect(() => {
    const itp = new Interpol({
      from: () => randomRange(-1000, 1000),
      to: () => randomRange(-1000, 1000),
      duration: () => randomRange(0, 6000),
      ease: Ease.inExpo,
      yoyo: true,
      repeatRefresh: true,
      onUpdate: ({ value, time, advancement }) => {
        const x = advancement * innerWidth
        const y = value
//        $root.current.style.opacity = `${1 - Math.abs(advancement - 0.5)}`
        $root.current.style.transform = `
        translateX(${x}px) 
        translateY(${y}px) 
        translateZ(0)
        `
      },
    })
  }, [])

  const $root = useRef<HTMLDivElement>()
  return <div className={"Ball"} ref={$root} />
}
