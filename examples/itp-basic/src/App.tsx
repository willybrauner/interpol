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
        // delay: 1000,
        //paused:true,
        x: 100,
        rotate: 360,
        // y: 30,
        // opacity: 0.2,
        //y: [-20, 50],
        //  scaleX: 2,
        //      z:0,
        left: "4rem",
        //left: ["50%", "10px"],
        //left: ["1rem","250px"],
        //left: ["1rem", "50%"],
        // top: [-100, 300],
        // opacity: [0.1, 0.6],
        ease: Ease.inOutCubic,
        onUpdate: (e) => {},
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
