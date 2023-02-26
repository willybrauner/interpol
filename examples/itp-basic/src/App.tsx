import "./App.css"
import React, { useEffect, useRef, useState } from "react"
import { Controls } from "./Controls"
import { Ease, idom } from "@wbe/interpol"
import anime from "animejs/lib/anime.es.js"
import gsap from "gsap"

export function App() {
  const $ball = useRef<HTMLDivElement>()
  const [instance, setInstance] = useState(null)
  /**
   idom.from(el, {})
   idom.to(el, {})
   idom.fromTo(el, {})
   */

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
    //   left: ["60%", "3rem"],
    //   duration: 1000,
    //   easing: "linear"
    // });

    const i = idom($ball.current, {
      duration: 1000,
      delay: 1000,
      //paused:true,
      //x: 10,
      //left: ["50%", "10px"],
      //left: ["1rem","250px"],
      // left: ["1rem","250px"],
      //left: ["50%","1rem"],
      //left: ["1rem", "50%"],
      left: "3rem",
      //top: [-100, 300],

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
