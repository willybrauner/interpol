import "./App.css"
import React, { useEffect, useRef, useState } from "react"
import { Ease, itp } from "@wbe/interpol"
import { Controls } from "./Controls"
import gsap from "gsap"

export function App() {
  const $ball = useRef<HTMLDivElement>()
  const [instance, setInstance] = useState(null)
  /**
   itp.from(el, {})
   itp.to(el, {})
   itp.fromTo(el, {})
   */

  useEffect(() => {
    // gsap.to($ball.current,{
    //   delay:1,
    //   left: "100%",
    //   ease:"none",
    //   duration: 1
    // })

    const i = itp($ball.current, {
      duration: 1000,
      // delay: 1000,
      // paused:true,
      left: "300px",
      top: [-100, 300],
      opacity: [0.1, 0.6],
      ease: Ease.inOutCubic,
      onUpdate: (e) => {
        //        console.log(e)
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
