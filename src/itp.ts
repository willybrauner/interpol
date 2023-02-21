import { Interpol, Timeline } from "./index"
import { IInterpolConstruct } from "./Interpol"

export type Styles = Record<keyof CSSStyleDeclaration, number | string> & {
  x: number | string
  y: number | string
  scale: number
  scaleX: number
  scaleY: number
  skewX: number
  skewY: number
  skew: number
  rotate: number
}

// type Style = Partial<CSSStyleDeclaration>
interface IOptions extends Omit<IInterpolConstruct, "from" | "to"> {
  // same than interpol fn without "value" param
  onUpdate?: ({ time, progress }) => void
  onComplete?: ({ time, progress }) => void
}

type Options = IOptions & Styles

/**
 * Interdom
 */
export function itp(
  target: HTMLElement,
  {
    duration,
    ease,
    reverseEase,
    paused,
    delay,
    debug,
    beforeStart,
    onUpdate,
    onComplete,
    ...keys
  }: Options
) {
  console.log(keys)
  const toKeys = { ...keys }
  console.log("toKeys", toKeys)
  if (!Object.entries(toKeys).length) {
    console.warn("No properties to animate, return")
    return null
  }

  const ks = Object.keys(toKeys)
  const itps = ks.map((key, i) => {
    const currKey = toKeys[key]
    const last = i === ks.length - 1

    console.log("ks", ks)
    return new Interpol({
      from: currKey?.[0] ?? 0,
      to: currKey?.[1] ?? toKeys[key],
      duration,
      ease,
      reverseEase,
      paused,
      delay,
      debug,
      beforeStart: () => {
        last && beforeStart?.()
      },
      onUpdate: ({ value, time, progress }) => {
        last && onUpdate?.({ time, progress })
        // console.log("value", value)

        // TODO parse property value to apply
        target.style[key] = value + "px"
      },
      onComplete: ({ value, time, progress }) => {
        last && onComplete?.({ time, progress })
        target[key] = value
      },
    })
  })

  const play = () => Promise.all(itps.map((e) => e.play()))
  const replay = () => Promise.all(itps.map((e) => e.replay()))
  const reverse = () => Promise.all(itps.map((e) => e.reverse()))
  const stop = () => itps.forEach((e) => e.stop())
  const pause = () => itps.forEach((e) => e.pause())
  const refreshComputedValues = () => itps.forEach((e) => e.refreshComputedValues())

  return Object.freeze({
    play,
    replay,
    stop,
    pause,
    reverse,
    refreshComputedValues,
  })
}
