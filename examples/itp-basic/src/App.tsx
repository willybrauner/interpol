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
    //   delay:2,
    //   top: "100%",
    // })

    const i = itp($ball.current, {
      duration: 1000,
      //left: ["0%", '30%'],
      left: [-10, '30%'],
      delay: 1000,
//      paused:true,
//      opacity: [0.8, 1],
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
