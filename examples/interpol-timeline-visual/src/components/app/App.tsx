import css from "./App.module.less"
import { useEffect, useRef, useState } from "react"
import { styles, Timeline } from "@wbe/interpol"
import { useWindowSize } from "../../utils/useWindowSize"
import { Visual } from "../visual/Visual"

export const tlOnUpdateEvent = new Event("tlOnUpdate")

export function App() {
  const ref1 = useRef(null)
  const ref2 = useRef(null)
  const ref3 = useRef(null)
  const ref4 = useRef(null)

  const containerRef = useRef(null)
  const [instance, setInstance] = useState(null)
  const windowSize = useWindowSize()

  useEffect(() => {
    const tl = new Timeline({
      debug: false,
      onUpdate: (t, p) => {
        document.dispatchEvent(tlOnUpdateEvent)
      },
      onComplete: (t, p) => {
        console.log(t, p)
      },
    })

    tl.add({
      duration: 1800,
      ease: "power4.out",
      immediateRender: true,
      x: [0, containerRef.current.offsetWidth - ref1.current.offsetWidth],
      onUpdate: ({ x }) => {
        styles(ref1.current, { x })
      },
      meta: {
        type: "first ball",
      },
    })
    tl.add(
      {
        duration: 1800,
        ease: "power4.out",
        immediateRender: true,
        x: [0, containerRef.current.offsetWidth - ref2.current.offsetWidth],
        rotate: [0, 360],
        onUpdate: ({ x, rotate }) => {
          styles(ref2.current, { x, rotate })
        },
        meta: {
          type: "carre",
        },
      },
      `-=${1800 / 1.5}`,
    )
    tl.add(
      {
        duration: 1800,
        ease: "power2.inOut",
        immediateRender: true,
        x: [0, containerRef.current.offsetWidth - ref3.current.offsetWidth],
        onUpdate: ({ x }) => {
          styles(ref3.current, { x })
        },
        meta: {
          type: "3",
        },
      },
      `-=${1800 / 1.5}`,
    )
    tl.add(
      {
        duration: 1800,
        ease: "power2.inOut",
        immediateRender: true,
        x: [0, containerRef.current.offsetWidth - ref4.current.offsetWidth],
        onUpdate: ({ x }) => {
          styles(ref4.current, { x })
        },
        meta: {
          type: "4",
        },
      },
      `-=${1800 / 1.5}`,
    )

    const refs = [ref1, ref2, ref3, ref4]
    refs.forEach((ref, index) => {
      tl.add(
        {
          duration: 500,
          ease: "power2.inOut",
          immediateRender: true,
          opacity: [1, 0.2],
          onUpdate: ({ opacity }) => {
            styles(ref.current, { opacity })
          },
        },
        `-=${index == 0 ? 200 : 300 * 1 - index}`,
      )
    })

    setInstance(tl)

    return () => {
      tl.stop()
    }
  }, [windowSize])

  return (
    <div className={css.root}>
      {/* <Controls className={css.controls} instance={instance} /> */}
      <div className={css.container} ref={containerRef}>
        <div className={css.ball} ref={ref1} />
        <div className={css.ball} ref={ref2} />
        <div className={css.ball} ref={ref3} />
        <div className={css.ball} ref={ref4} />
      </div>

      {instance && <Visual timeline={instance} />}
    </div>
  )
}
