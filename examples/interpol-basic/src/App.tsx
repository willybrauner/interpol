import css from "./App.module.less"
import React, { useEffect, useMemo, useRef, useState } from "react"
import { Interpol, Ease } from "@wbe/interpol"
import { Controls } from "./Controls"
import { Params } from "./Params"
import { useWindowSize } from "../libs/useWindowSize"

export function App() {
  const $ball = useRef<HTMLDivElement>()
  const { width } = useWindowSize()

  const [instance, setInstance] = useState<Interpol>(null)
  const [ease, setEase] = useState(null)
  const [params, setParams] = useState<{ value; time; progress }>({
    value: 0,
    time: 0,
    progress: 0,
  })

  const firstMount = useRef(true)
  useEffect(() => {
    if (!$ball.current) return
    const ballSize = $ball.current?.offsetWidth
    const itp = new Interpol({
      from: 0,
      to: () => window.innerHeight - ballSize,
      duration: 1000,
      ease: Ease[ease],
      paused: true,
      onUpdate: ({ value, time, progress }) => {
        setParams({ value, time, progress })
        const x = progress * (window.innerWidth - ballSize)
        const y = -value
        $ball.current.style.transform = `
        translateX(${x}px)
        translateY(${y}px) 
        translateZ(0)
        `
      },
    })
    setInstance(itp)

    if (firstMount.current) {
      firstMount.current = false
      return
    } else {
      itp.play()
    }
  }, [ease, width])

  return (
    <div className={css.root}>
      <div className={css.wrapper}>
        <Controls
          className={css.controls}
          instance={instance}
          dispatchEase={(ease) => setEase(ease)}
        />
        <Params className={css.params} params={params} />
      </div>
      <div className={css.ball} ref={$ball} />
    </div>
  )
}
