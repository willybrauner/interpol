import { Interpol } from "../index"
import { IInterpolConstruct, IUpdateParams } from "../interpol/Interpol"
import debug from "@wbe/debug"
import { extractValueAndUnit } from "./extractValueAndUnit"
const log = debug(`interpol:idom`)

// ----------------------------------------------------------------------------- TYPES

type AdditionalProperties = {
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

type CallbackParams = Record<string, IUpdateParams>[]

interface ITPOptions<KEYS = any>
  extends Omit<IInterpolConstruct, "from" | "to" | "onUpdate" | "onComplete"> {
  onUpdate?: (e: CallbackParams) => void
  onComplete?: (e: CallbackParams) => void
}

type Styles = Record<keyof CSSStyleDeclaration, number | string> & AdditionalProperties
type Options = ITPOptions & Styles

// ----------------------------------------------------------------------------- IDOM

/**
 * Interdom
 */
export function idom(
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
  if (!(target instanceof HTMLElement)) {
    console.warn("target param is not HTMLElement, return.", target)
    // console.warn()
    return null
  }
  if (!Object.entries(keys).length) {
    console.warn("No properties to animate, return")
    return null
  }

  const values: Record<keyof typeof keys, IUpdateParams>[] = []

  // Map on available keys and return an interpol instance by key
  //  left: [0, 10] need its own interpol
  //  top: [-10, 10] need its own interpol too
  const itps = Object.keys(keys).map((key, i) => {
    const isLast = i === Object.keys(keys).length - 1
    let value = keys[key]
    let hasExplicitFrom = false
    let from: [number, string]
    let to: [number, string]

    // if (key === "x") {
    //   key = "transform"
    //   value = `translateX(${value})`
    // }
    log({ key, value })

    // case, value is an array [from, to] or [from, null]
    if (Array.isArray(value)) {
      const [vFrom, vTo] = value
      hasExplicitFrom = vFrom !== null && vFrom !== undefined
      to = extractValueAndUnit(target, key, vTo)
      from = extractValueAndUnit(target, key, vFrom, to[1])
    }
    // value is a number or a string, not an array
    else {
      const cptValue = window.getComputedStyle(target).getPropertyValue(key)
      to = extractValueAndUnit(target, key, value)
      from = extractValueAndUnit(target, key, cptValue, to[1])
    }
    log(key, { from, to })

    // return interpol instance for current key
    return new Interpol({
      from: from[0],
      to: to[0],
      duration,
      ease,
      reverseEase,
      paused,
      delay,
      debug,
      beforeStart: () => {
        if (hasExplicitFrom) target.style[key] = `${from[0]}${from[1] ?? ""}`
        isLast && beforeStart?.()
      },

      onUpdate: ({ value, time, progress }) => {
        target.style[key] = `${value}${to[1] ?? ""}`

        // Do not create a new object reference on each frame
        if (values[key]) {
          values[key].value = value
          values[key].time = time
          values[key].progress = progress
        } else {
          values[key] = { value, time, progress }
        }
        isLast && onUpdate?.(values)
      },
      onComplete: ({ value, time, progress }) => {
        values[key] = { value, time, progress }
        isLast && onComplete?.(values)
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
