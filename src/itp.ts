import { Interpol } from "./index"
import { IInterpolConstruct, IUpdateParams } from "./Interpol"
import debug from "@wbe/debug"
import { convertToPx } from "./helpers/convertToPx"
import { getUnit } from "./helpers/getUnit"

const log = debug(`interpol:itp`)

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

/**
 * Interdom
 */
export function itp(
  $target: HTMLElement,
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
  if (!Object.entries(keys).length) {
    console.warn("No properties to animate, return")
    return null
  }

  const values: Record<keyof typeof keys, IUpdateParams>[] = []

  // Map on available keys and return an interpol instance by key
  //  left: [0, 10] need its own interpol
  //  y: [0, 10] need its own interpol two
  const itps = Object.keys(keys).map((key, i) => {
    const isLast = i === Object.keys(keys).length - 1
    const value = keys[key]
    let fromUnit: string
    let toUnit: string
    let hasExplicitFrom = false
    let fFrom: number
    let fTo: number

    // case, value is an array [from, to] or [from, _]
    if (Array.isArray(value)) {
      const [from, to] = value
      const existInArray = (v) => v !== null && v !== undefined

      if (existInArray(from)) {
        hasExplicitFrom = true
        const computedValue = getComputedStyle($target).getPropertyValue(key)
        fromUnit = getUnit(from) || getUnit(computedValue)
        fFrom = parseFloat(from)
      }

      if (existInArray(to)) {
        const computedValue = getComputedStyle($target).getPropertyValue(key)
        toUnit = getUnit(to) || getUnit(computedValue)
        fTo = parseFloat(to)
        // case of [from, null], "from" only, deduce the "to"
      } else {
        const computedValue = getComputedStyle($target).getPropertyValue(key)
        fTo = convertToPx(computedValue, $target)
      }
    }
    // not an array, value is a simple value (number or string)
    else {
      hasExplicitFrom = false
      const computedValue = getComputedStyle($target).getPropertyValue(key)
      fFrom = convertToPx(computedValue, $target)
      fromUnit = getUnit(computedValue)
      toUnit = getUnit(value)
      fTo = convertToPx(value, $target)
    }

    log(key, { fFrom, fromUnit, fTo, toUnit })

    // return interpol instance for current key
    return new Interpol({
      from: fFrom,
      to: fTo,
      duration,
      ease,
      reverseEase,
      paused,
      delay,
      debug,
      beforeStart: () => {
        if (hasExplicitFrom) $target.style[key] = `${fFrom}${fromUnit ?? ""}`
        isLast && beforeStart?.()
      },

      onUpdate: ({ value, time, progress }) => {
        $target.style[key] = `${value}${toUnit ?? ""}`

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
