import "./App.css"
import React, { useEffect, useRef, useState } from "react"
import { Controls } from "./Controls"
import { Ease, idom } from "../../../src"
import anime from "animejs/lib/anime.es.js"
import gsap from "gsap"

export function App() {
  const $ball = useRef<HTMLDivElement>()
  const [instance, setInstance] = useState(null)

  useEffect(() => {
    // gsap.fromTo($ball.current,{
    //   left: "60%",
    // },{
    //   delay:1,
    //   left: "3rem",
    //   ease:"none",
    //   duration: 1
    // })

    // anime({
    //   targets: $ball.current,
    //   translateX: ["0", "3rem"],
    //   translateZ: ["0", "3rem"],
    //   duration: 1000,
    //   easing: "linear"
    // });

    setInstance(
      idom($ball.current, {
        duration: 1000,
        opacity: 0.2,
        x: 400,
        y: [-20, 330],
        ease: Ease.inOutCubic,
      })
    )
  }, [])

  return (
    <div className={"App"}>
      <Controls instance={instance} />
      <div className={"wrapper"}>
        <div
          className={"ball"}
          ref={$ball}
          //style={{ transform: "translateZ(-23px)" }}
        />
      </div>
    </div>
  )
}
