import "./App.css"
import React, { useEffect, useRef, useState } from "react"
import { Interpol, Ease, Interdom } from "../../../src"
import { Controls } from "./Controls"
import { randomRange } from "../../../test/utils/randomRange"

export function App() {
  const $ball = useRef<HTMLDivElement>()
  const [instance, setInstance] = useState(null)
  useEffect(() => {
    const i = Interdom($ball.current, {
      duration: 1000,
      left: () => randomRange(0, innerWidth / 2),
      top: () => randomRange(0, innerHeight / 2),
      ease: Ease.outCubic,

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
