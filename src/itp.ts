import { Interpol } from "./index"
import { IInterpolConstruct, IUpdateParams } from "./Interpol"
import debug from "@wbe/debug"
import { convertToPx } from "./helpers/convertToPx"

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
    // prepare unit
    let fromUnit = "px"
    let toUnit = "px"
    const getUnit = (value: string): string =>
      typeof value === "string" ? value.replace(/[0-9]*/g, "") : "px"
    log(key, value)

    // check if "from" and "to" come from array
    const valueIsArray = Array.isArray(value)
    const hasArrayFrom = valueIsArray && value[0] !== null && value[0] !== undefined
    const hasArrayTo = valueIsArray && value[1] !== null && value[1] !== undefined

    // compute "from" and "to" from the DOM element
    const computedStyle = window.getComputedStyle($target, null)
    const computedValue = computedStyle.getPropertyValue(key)

    // Now we have to choose the appropriate value
    const getFrom = () => {
      if (hasArrayFrom) {
        fromUnit = getUnit(value[0])
        return value[0]
      } else return computedValue
    }
    const getTo = () => {
      if (hasArrayTo) {
        toUnit = getUnit(value[1])
        return value[1]
      } else if (!valueIsArray) {
        toUnit = getUnit(value)
        log("toUnit", toUnit)
        return value
      } else return computedValue
    }

    const [from, to] = [convertToPx(getFrom(), $target), convertToPx(getTo(), $target)]
    log(key, { from, to })

    // return interpol instance for current key
    return new Interpol({
      from,
      to,
      duration,
      ease,
      reverseEase,
      paused,
      delay,
      debug,
      beforeStart: () => {
        $target.style[key] = `${from}${fromUnit}`
        isLast && beforeStart?.()
      },

      onUpdate: ({ value, time, progress }) => {
        $target.style[key] = `${value}${toUnit}`

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
        $target.style[key] = `${value}${toUnit}`
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
