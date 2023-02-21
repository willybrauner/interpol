import "./App.css"
import React, { useEffect, useRef, useState } from "react"
import { Ease, itp } from "@wbe/interpol"
import { Controls } from "./Controls"
import { randomRange } from "../../../test/utils/randomRange"

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
      left: [-100, 300],
      top: [100, 300],
      ease: Ease.outCubic,
      beforeStart: () => {
        //    console.log("itp beforeStart")
      },
      onUpdate: (e) => {
        //      console.log("itp update",e)
      },
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
