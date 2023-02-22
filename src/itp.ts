import { Interpol, Timeline } from "./index"
import { IInterpolConstruct } from "./Interpol"
import debug from "@wbe/debug"

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

interface ITPOptions extends Omit<IInterpolConstruct, "from" | "to"> {
  // same than interpol fn without "value" param
  onUpdate?: ({ time, progress }) => void
  onComplete?: ({ time, progress }) => void
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
  const toKeys = { ...keys }
  log("toKeys", toKeys)
  if (!Object.entries(toKeys).length) {
    console.warn("No properties to animate, return")
    return null
  }

  const ks = Object.keys(toKeys)

  // Map on available keys and return an interpol instance by key
  // ex:
  //  left: [0, 10] need its own interpol
  //  y: [0, 10] need its own interpol two
  const itps = ks.map((key, i) => {
    const isLast = i === ks.length - 1
    const value = toKeys[key]
    log("value", value)

    const valueIsArray = Array.isArray(value)
    const hasArrayFrom = valueIsArray && value[0] !== null && value[0] !== undefined
    const hasArrayTo = valueIsArray && value[1] !== null && value[1] !== undefined

    const computedStyle = window.getComputedStyle($target, null)
    const computedValue = computedStyle.getPropertyValue(key)
    const unit = computedValue.replace(/[0-9]*/g, "")

    const getFrom = () => (hasArrayFrom ? value[0] : parseInt(computedValue))
    const getTo = () => {
      if (hasArrayTo) return value[1]
      else if (!valueIsArray) return value
      else return parseInt(computedValue)
    }

    const [from, to] = [getFrom(), getTo()]
    log({ from, to })

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
        isLast && beforeStart?.()
      },
      onUpdate: ({ value, time, progress }) => {
        isLast && onUpdate?.({ time, progress })
        // improve si ce n'est pas une key direct sur l'element
        $target.style[key] = value + unit
      },
      onComplete: ({ value, time, progress }) => {
        isLast && onComplete?.({ time, progress })
        $target[key] = value
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
