import css from "./App.module.less"
import React, { useEffect, useRef, useState } from "react"
import { Interpol } from "@psap/interpol"
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


// prettier-ignore
export const Ease = {
  linear: t => t,

  inQuad: t => t*t,
  outQuad: t => t*(2-t),
  inOutQuad: t => t<.5 ? 2*t*t : -1+(4-2*t)*t,

  inCubic: t => t*t*t,
  outCubic: t => (--t)*t*t+1,
  inOutCubic: t => t<.5 ? 4*t*t*t : (t-1)*(2*t-2)*(2*t-2)+1,

  inQuart: t => t*t*t*t,
  outQuart: t => 1-(--t)*t*t*t,
  inOutQuart: t => t<.5 ? 8*t*t*t*t : 1-8*(--t)*t*t*t,

  inQuint: t => t*t*t*t*t,
  outQuint: t => 1+(--t)*t*t*t*t,
  inOutQuint: t => t<.5 ? 16*t*t*t*t*t : 1+16*(--t)*t*t*t*t,

  inSine:t => -Math.cos(t * (Math.PI/2)) + 1,
  outSine:t => Math.sin(t * (Math.PI/2)),
  inOutSine:t => (-0.5 * (Math.cos(Math.PI*t) -1)),

  inExpo:t => (t===0) ? 0 : Math.pow(2, 10 * (t - 1)),
  outExpo:t => (t===1) ? 1 : -Math.pow(2, -10 * t) + 1,
  inOutExpo: t => {
    if (t===0) return 0;
    if (t===1) return 1;
    if ((t/=0.5) < 1) return 0.5 * Math.pow(2,10 * (t-1));
    return 0.5 * (-Math.pow(2, -10 * --t) + 2);
  },

}
