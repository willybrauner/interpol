import "./App.css"
import React, { useEffect, useRef, useState } from "react"
import { Ease, itp } from "@wbe/interpol"
import { Controls } from "./Controls"

export function App() {
  const $ball = useRef<HTMLDivElement>()
  const [instance, setInstance] = useState(null)
  /**
   itp.from(el, {})
   itp.to(el, {})
   itp.fromTo(el, {})
   */

  useEffect(() => {
    const i = itp($ball.current, {
      duration: 1000,
      left: [-300, '30rem'],
      paused:true,
      opacity: [0.8, 1],
      // top: [-100, 300],
      ease: Ease.outCubic,
      onUpdate:(e) =>
      {
//        console.log(e)
      }
    })
    setInstance(i)
  }, [])

  return (
    <div className={"App"}>
      <Controls instance={instance} />
      <div className={"wrapper"}>
        <div className={"ball"} ref={$ball} />
      </div>
    </div>
  )
}
