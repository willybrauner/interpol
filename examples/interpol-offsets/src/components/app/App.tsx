import css from "./App.module.less"
import React, { useEffect, useRef } from "react"
import { Timeline } from "@wbe/interpol"

export function App() {
  const refs = useRef([])

  useEffect(() => {
    const tl = new Timeline()

    for (let i = 0; i < refs.current.length; i++) {
      tl.add(
        {
          el: refs.current[i],
          duration: 1000,
          ease: "power2.out",
          props: {
            x: [0, 100, "%"],
            y: [0, 100, "%"],
          },
        },

        // should start all add from tl start 
        0
      )
    }
  }, [])

  return (
    <div className={css.root}>
      {new Array(10).fill(null).map((e, i) => (
        <div key={i} className={css.ball} ref={(r) => (refs.current[i] = r)}></div>
      ))}
    </div>
  )
}
