import css from "./App.module.less"
import React, { useEffect, useRef, useState } from "react"
import { Timeline } from "@wbe/interpol"
import { Controls } from "../controls/Controls"
import { useWindowSize } from "../../utils/useWindowSize"

export function App() {
  const refs = useRef([])
  const containerRef = useRef(null)
  const [instance, setInstance] = useState(null)
  const windowSize = useWindowSize()

  useEffect(() => {
    const tl = new Timeline({ debug: true })

    for (let i = 0; i < refs.current.length; i++) {
      const curr = refs.current[i]
      tl.add(
        {
          el: curr,
          duration: 1000,
          ease: "power3.inOut",
          // prettier-ignore
          props: {
            x: [
              0,
              containerRef.current.offsetWidth - curr.offsetWidth,
              "px",
            ],
          },
        },

        // that's the trick
        // in order to test the offset interpolation
        // 1 & 8 balls are relative to their position in the timeline
        // other balls are absolute (relative to the beginning of the timeline)
        i === 1 || i === 8 ? "-=700" : i * 40
      )
    }

    setInstance(tl)
  }, [windowSize])

  return (
    <div className={css.root}>
      <Controls className={css.controls} instance={instance} />
      <div className={css.container} ref={containerRef}>
        {new Array(15).fill(null).map((e, i) => (
          <div
            key={i}
            className={css.ball}
            style={{ backgroundColor: (i === 1 || i === 8) && "cadetblue" }}
            ref={(r) => (refs.current[i] = r)}
          ></div>
        ))}
      </div>
    </div>
  )
}
