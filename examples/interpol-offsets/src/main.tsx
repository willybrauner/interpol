import "./index.css"
import { Timeline, styles } from "@wbe/interpol"
import { useRef, useState, useEffect } from "react"
import ReactDOM from "react-dom/client"
import { createTweekpane } from "./utils/createTweakpane"
import { useWindowSize } from "./utils/useWindowSize"

export function App() {
  const refs = useRef([])
  const containerRef = useRef(null)
  const windowSize = useWindowSize()
  const paneRef = useRef(null)

  const [customOffset, setCustomOffset] = useState<number>(0)
  const [typeState, setTypeState] = useState<"relative" | "absolute">("absolute")

  const PARAMS = useRef({ type: typeState, offset: customOffset })

  const tl = useRef<Timeline>(null)

  useEffect(() => {
    if (paneRef.current) {
      PARAMS.current.offset = customOffset
      PARAMS.current.type = typeState
      paneRef.current.dispose()
    }

    tl.current = new Timeline({ debug: false, paused: true })
    for (let i = 0; i < refs.current.length; i++) {
      const curr = refs.current[i]
      tl.current.add(
        {
          duration: 1000,
          immediateRender: true,
          ease: "power1.inOut",
          x: [0, containerRef.current.offsetWidth - curr.offsetWidth],
          onUpdate: ({ x }) => {
            styles(curr, { x })
          },
        },

        // that's the trick
        // in order to test the offset interpolation
        // ball 1 is relative to its position in the timeline
        // other balls are absolute (relative to the beginning of the timeline)
        i === 1 ? (typeState === "relative" ? `${customOffset}` : customOffset) : i * 40,
      )
    }

    const yoyo = async () => {
      await tl.current.play()
      await tl.current.reverse()
      yoyo()
    }

    yoyo()

    // Create Tweakpane
    paneRef.current = createTweekpane(tl.current, null, yoyo)
    const folder = paneRef.current.addFolder({ title: "Offset (yellow ball)", expanded: true })
    folder
      .addBinding(PARAMS.current, "type", {
        options: {
          relative: "relative",
          absolute: "absolute",
        },
      })
      .on("change", (ev) => {
        setTypeState(ev.value)
        PARAMS.current.type = ev.value
        tl.current.stop()
      })

    folder
      .addBinding(PARAMS.current, "offset", {
        min: -1000,
        max: 3000,
        step: 1,
      })
      .on("change", (ev) => {
        const value = ev.value
        if (typeof value === "number" && !isNaN(value)) {
          const n = Math.floor(value)
          setCustomOffset(n)
          PARAMS.current.offset = n
          tl.current.stop()
        }
      })
  }, [windowSize.width, windowSize.height, customOffset, typeState])

  return (
    <div className={"root"}>
      <div className={"container"} ref={containerRef}>
        {new Array(10).fill(null).map((e, i) => (
          <div
            key={i}
            className={"ball"}
            style={{ backgroundColor: i === 1 && "cadetblue" }}
            ref={(r) => (refs.current[i] = r as any)}
          ></div>
        ))}
      </div>
    </div>
  )
}

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(<App />)
