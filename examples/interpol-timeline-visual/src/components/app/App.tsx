import css from "./App.module.less"
import { useEffect, useRef, useState } from "react"
import { Interpol, styles, Timeline } from "@wbe/interpol"
import { Controls } from "../controls/Controls"
import { useWindowSize } from "../../utils/useWindowSize"
import { Visual } from "../visual/Visual"

export function App() {
  const ref1 = useRef(null)
  const ref2 = useRef(null)
  const ref3 = useRef(null)
  const ref4 = useRef(null)

  const containerRef = useRef(null)
  const [instance, setInstance] = useState(null)
  const windowSize = useWindowSize()

  useEffect(() => {
    const duration = 1800
    const ease = "power2.inOut"
    const tl = new Timeline({ debug: false })

    // tl.add(() => {}, duration * 0.2)
    // tl.add(() => {}, duration * 0.6)

    tl.add({
      duration,
      ease: "power2.in",
      immediateRender: true,
      x: [0, containerRef.current.offsetWidth - ref1.current.offsetWidth],
      onUpdate: ({ x }) => {
        styles(ref1.current, { x })
      },
    })
    tl.add(
      {
        duration,
        ease: "power4.out",
        immediateRender: true,
        x: [0, containerRef.current.offsetWidth - ref2.current.offsetWidth],
        rotate: [0, 360],
        onUpdate: ({ x, rotate }) => {
          styles(ref2.current, { x, rotate })
        },
      },
      `-=${duration / 1.5}`,
    )
    tl.add(
      {
        duration,
        ease,
        immediateRender: true,
        x: [0, containerRef.current.offsetWidth - ref3.current.offsetWidth],
        onUpdate: ({ x }) => {
          styles(ref3.current, { x })
        },
      },
      `-=${duration / 1.5}`,
    )
    tl.add(
      {
        duration: 600,
        ease,
        immediateRender: true,
        x: [0, containerRef.current.offsetWidth - ref4.current.offsetWidth],
        onUpdate: ({ x }) => {
          styles(ref4.current, { x })
        },
      },
      2000,
    )

    // stagger all ref if for loop, opacity 1 -> 0.5
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
