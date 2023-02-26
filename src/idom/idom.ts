import { Interpol } from "../index"
import { IInterpolConstruct, IUpdateParams } from "../interpol/Interpol"
import debug from "@wbe/debug"
import { getUnit } from "./getUnit"

const log = debug(`interpol:idom`)

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
 *
 * UTILS
 * - forceUnit
 * - or unit from brut value
 * - or unit from computed value
 *
 * - value from brute value
 * - or value from computed
 */
export const geValueAndUnit = (
  $target: HTMLElement,
  key: string,
  brutValue: number | string,
  pUnit?: string,
  proxyWindow = window
): [value: number, unit: string] => {
  const computedValue = proxyWindow.getComputedStyle($target).getPropertyValue(key)
  const currUnit = getUnit(brutValue) || getUnit(computedValue)
  const unit = pUnit || currUnit
  let value =
    (typeof brutValue === "string" ? parseFloat(brutValue) : brutValue) ?? parseFloat(computedValue)
  if (pUnit) value = convertValueToUnitValue($target, value, currUnit, pUnit)
  return [value, unit]
}

/**
 * Convert a value from unit value to another unit value
 * ex:
 *  [2rem, 50%]
 *  -> [0.5%, 50%]
 *
 * return a value
 */
function convertValueToUnitValue(
  el: HTMLElement,
  value,
  fromUnit: string,
  toUnit: string,
  pWindow = window,
  pDocument = document
): number {
  if (fromUnit === toUnit) {
    log("unit are the same, return value", value)
    return value
  }

  // log({ fromUnit, toUnit, value })
  // create a temp node element in order to get his width
  const tempEl = pDocument.createElement(el.tagName)
  const parentEl = el.parentNode && el.parentNode !== pDocument ? el.parentNode : pDocument.body
  tempEl.style.position = "absolute"
  tempEl.style.width = 100 + "%"
  parentEl.appendChild(tempEl)
  const tempWidthPx = tempEl.offsetWidth
  parentEl.removeChild(tempEl)

  // get font-sizes
  const parentFontSize = parseFloat(pWindow.getComputedStyle(el.parentElement).fontSize)
  const baseFontSize = parseFloat(pWindow.getComputedStyle(pDocument.documentElement).fontSize)

  // need some tests...
  const units = {
    rem: baseFontSize,
    em: parentFontSize,
    "%": tempWidthPx / 100,
    px: 1,
    pt: 4 / 3,
    in: 96,
    cm: 96 / 2.54,
    mm: 96 / 25.4,
    ex: parentFontSize / 2,
    ch: parentFontSize * 8.8984375,
    pc: 16,
    vw: pWindow.innerWidth / 100,
    vh: pWindow.innerHeight / 100,
    vmin: Math.min(pWindow.innerWidth, pWindow.innerHeight) / 100,
    vmax: Math.max(pWindow.innerWidth, pWindow.innerHeight) / 100,
    deg: Math.PI / 180,
    rad: 1,
    turn: 360,
  }

  const pixelValue = value * units[fromUnit]
  return pixelValue / units[toUnit]
}

// -----------------------------------------------------------------------------

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
      to = geValueAndUnit(target, key, vTo)
      from = geValueAndUnit(target, key, vFrom, to[1])
    }
    // value is a number or a string, not an array
    else {
      const cptValue = window.getComputedStyle(target).getPropertyValue(key)
      to = geValueAndUnit(target, key, value)
      from = geValueAndUnit(target, key, cptValue, to[1])
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
