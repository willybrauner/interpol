import css from "./App.module.less"
import React, { useEffect, useRef, useState } from "react"
import { Timeline } from "@wbe/interpol"
import { Controls } from "../controls/Controls"

export function App() {
  const refs = useRef([])

  const [instance, setInstance] = useState(null)

  useEffect(() => {
    const tl = new Timeline()

    for (let i = 0; i < refs.current.length; i++) {
      tl.add(
        {
          el: refs.current[i],
          duration: 1000,
          ease: "power2.inOut",
          props: {
            x: [0, innerWidth - refs.current[i].getBoundingClientRect().width, "px"],
          },
        },
        // should start all add from tl start
        i * 40
      )
    }

    setInstance(tl)
  }, [])

  return (
    <div className={css.root}>
      <Controls className={css.controls} instance={instance} />
      {new Array(15).fill(null).map((e, i) => (
        <div key={i} className={css.ball} ref={(r) => (refs.current[i] = r)}></div>
      ))}
    </div>
  )
}
