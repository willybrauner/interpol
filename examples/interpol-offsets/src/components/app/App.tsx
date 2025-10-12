import css from "./App.module.css"
import { useEffect, useRef, useState } from "react"
import { styles, Timeline } from "@wbe/interpol"
import { useWindowSize } from "../../utils/useWindowSize"
import { Pane } from "tweakpane"
import { createTweekpane } from "../../utils/createTweakpane"

export function App() {
  const refs = useRef([])
  const containerRef = useRef(null)
  const [instance, setInstance] = useState(null)
  const windowSize = useWindowSize()
  const paneRef = useRef(null)

  const [customOffset, setCustomOffset] = useState<number | string>("0")
  const [type, setType] = useState<string>("relative")

  const PARAMS = useRef({
    offsetType: "relative",
  })

  useEffect(() => {
    const tl = new Timeline({ debug: false })

    for (let i = 0; i < refs.current.length; i++) {
      const curr = refs.current[i]
      tl.add(
        {
          duration: 1000,
          immediateRender: true,
          ease: "power1.inOut",
          x: [0, containerRef.current.offsetWidth - curr.offsetWidth],
          onUpdate: ({ x }) => {
            styles(curr, { x: x + "px" })
          },
        },

        // that's the trick
        // in order to test the offset interpolation
        // ball 1 is relative to its position in the timeline
        // other balls are absolute (relative to the beginning of the timeline)
        i === 1 ? customOffset : i * 40,
      )
    }

    setInstance(tl)

    if (!paneRef.current) {
      paneRef.current = createTweekpane(tl)

      const folder = paneRef.current.addFolder({ title: "Offset", expanded: true })

      folder
        .addBinding(PARAMS.current, "offsetType", {
          options: {
            relative: "relative",
            absolute: "absolute",
          },
        })
        .on("change", (ev) => {
          setType(ev.value)
          tl.play()
        })

      folder
        .addBinding({ offset: customOffset }, "offset", {
          label: "value",
          min: -1000,
          max: 1000,
        })
        .on("change", (ev) => {
          setCustomOffset(type === "relative" ? `${ev.value}` : parseInt(ev.value))
          tl.play()
        })
    }
  }, [windowSize, customOffset])

  const handleValue = (v): void => {
    setCustomOffset(type === "relative" ? `${v}` : parseInt(v))
  }

  useEffect(() => {
    handleValue(customOffset)
  }, [type])

  return (
    <div className={css.root}>
      <div className={css.typeOffsetContainer}>
        <div className={css.typeContainer}>
          <div>type</div>
          <select onChange={(e) => setType(e.target.value)}>
            <option value={"relative"}>relative (string)</option>
            <option value={"absolute"}>absolute (number)</option>
          </select>{" "}
        </div>
        <div className={css.offsetContainer}>
          <div>
            <div>{type} offset</div>
            <input
              autoFocus={true}
              value={customOffset}
              type={"text"}
              onChange={(e) => handleValue(e.target?.value)}
            />
          </div>
        </div>
      </div>

      <div className={css.container} ref={containerRef}>
        {new Array(10).fill(null).map((e, i) => (
          <div
            key={i}
            className={css.ball}
            style={{ backgroundColor: i === 1 && "cadetblue" }}
            ref={(r) => (refs.current[i] = r as any)}
          ></div>
        ))}
      </div>
    </div>
  )
}
