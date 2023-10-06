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

  const [customOffset, setCustomOffset] = useState<number | string>("0")
  const [type, setType] = useState<string>("relative")

  useEffect(() => {
    const tl = new Timeline({ debug: true })

    for (let i = 0; i < refs.current.length; i++) {
      const curr = refs.current[i]
      tl.add(
        {
          el: curr,
          duration: 1000,
          initUpdate: true,
          ease: "power1.inOut",
          props: {
            x: [0, () => containerRef.current.offsetWidth - curr.offsetWidth, "px"],
          },
        },

        // that's the trick
        // in order to test the offset interpolation
        // 1 & 8 balls are relative to their position in the timeline
        // other balls are absolute (relative to the beginning of the timeline)
        i === 1 ? customOffset : i * 40
      )
    }

    setInstance(tl)
  }, [windowSize, customOffset])

  const handleValue = (v): void => {
    setCustomOffset(type === "relative" ? `${v}` : parseInt(v))
  }

  useEffect(() => {
    handleValue(customOffset)
  }, [type])

  return (
    <div className={css.root}>
      <Controls className={css.controls} instance={instance} />
      <br />

      <div>
        <div>type</div>
        <select onChange={(e) => setType(e.target.value)}>
          <option value={"relative"}>relative (string)</option>
          <option value={"absolute"}>absolute (number)</option>
        </select>{" "}
      </div>

      <div>
        <div>offset</div>
      <input
        autoFocus={true}
        value={customOffset}
        type={"text"}
        onChange={(e) => handleValue(e.target?.value)}
      />
      </div>
      <div className={css.container} ref={containerRef}>
        {new Array(10).fill(null).map((e, i) => (
          <div
            key={i}
            className={css.ball}
            style={{ backgroundColor: i === 1 && "cadetblue" }}
            ref={(r) => (refs.current[i] = r)}
          ></div>
        ))}
      </div>
    </div>
  )
}
