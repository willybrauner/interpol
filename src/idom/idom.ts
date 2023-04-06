import { Interpol } from "../index"
import { IInterpolConstruct } from "../interpol/Interpol"
import debug from "@wbe/debug"
import { getUnit } from "./getUnit"
import { convertValueToUnitValue } from "./convertValueToUnitValue"
import { convertMatrix } from "./convertMatrix"
const log = debug(`interpol:idom`)

// ----------------------------------------------------------------------------- TYPES

type V = number | string
type Value = V | [V, V]
interface CSSProps extends Record<keyof CSSStyleDeclaration, Value> {
  x: Value
  y: Value
  z: Value
  translateX: Value
  translateY: Value
  translateZ: Value
  rotate: Value
  rotateX: Value
  rotateY: Value
  rotateZ: Value
  scale: Value
  scaleX: Value
  scaleY: Value
  scaleZ: Value
  skew: Value
  skewX: Value
  skewY: Value
  perspective: Value
  matrix: Value
  matrix3d: Value
}

interface IdomOptions extends Omit<IInterpolConstruct, "from" | "to" | "onUpdate" | "onComplete"> {
  onUpdate?: (props: Props) => void
  onComplete?: (props: Props) => void
}

type Options = IdomOptions & Partial<CSSProps>

type PropOptions = Partial<{
  usedKey: string
  update: { value: number; time: number; progress: number }
  to: { value: number; unit: string }
  from: { value: number; unit: string }
  transformFn: string
  _hasExplicitFrom: boolean
  _isTransform: boolean
}>

type Props = Map<string, PropOptions>

// ----------------------------------------------------------------------------- UTILS

const validTransforms = [
  "x",
  "y",
  "z",
  "translateX",
  "translateY",
  "translateZ",
  "rotate",
  "rotateX",
  "rotateY",
  "rotateZ",
  "scale",
  "scaleX",
  "scaleY",
  "scaleZ",
  "skew",
  "skewX",
  "skewY",
  "perspective",
  "matrix",
  "matrix3d",
]

/**
 * Chain transforms properties
 */
const buildTransformChain = (props: Map<string, PropOptions>): string => {
  let chain = ""
  for (const [k, { to, transformFn, update }] of props)
    chain += `${transformFn}(${update.value}${to.unit}) `
  return chain
}

/**
 * Get css value from target
 */
export const getCssValue = (
  target: HTMLElement,
  prop: PropOptions,
  proxyWindow = window
): string => {
  // get value from style or computed style
  let cptValue =
    target.style[prop.usedKey] ||
    proxyWindow.getComputedStyle(target).getPropertyValue(prop.usedKey)
  if (cptValue === "none") cptValue = "0px"

  // get trans fn call from matrix of transform property, ex: translateX(10px)
  // parse trans (translateX(10px)) and return "10px"
  if (prop._isTransform) {
    const trans = cptValue.includes("matrix(")
      ? convertMatrix(cptValue)?.[prop.transformFn]
      : cptValue
    return trans.match(/-?\d+(?:\.\d+)?[a-zA-Z%]+/)?.[0]
  }

  // if not transform, return value
  return cptValue
}

// ----------------------------------------------------------------------------- IDOM

/**
 * IDOM
 *
 *
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
    return null
  }
  if (!Object.entries(keys).length) {
    console.warn("No properties to animate, return")
    return null
  }

  const props: Props = new Map<string, PropOptions>()

  // Map on available keys and return an interpol instance by key
  //  left: [0, 10] need its own interpol
  //  top: [-10, 10] need its own interpol too
  const keysEntries = Object.keys(keys)
  const itps = keysEntries.map((key, i) => {
    const isLast = i === keysEntries.length - 1
    let v = keys[key]

    props.set(key, {
      usedKey: key,
      to: { value: undefined, unit: undefined },
      from: { value: undefined, unit: undefined },
      update: { value: undefined, time: undefined, progress: undefined },
      _hasExplicitFrom: false,
    })

    const prop = props.get(key)

    prop._isTransform = validTransforms.includes(key)
    if (prop._isTransform) {
      prop.usedKey = "transform"
      if (key === "x") prop.transformFn = "translateX"
      else if (key === "y") prop.transformFn = "translateY"
      else if (key === "z") prop.transformFn = "translateZ"
      else prop.transformFn = key
    }

    const cssValue: string = getCssValue(target, prop)
    const cssValueN: number = parseFloat(cssValue) || 0
    const cssValueUnit: string = getUnit(cssValue)

    // // case, value is an array [from, to] or [from, null]
    if (Array.isArray(v)) {
      const [vFrom, vTo] = v
      prop._hasExplicitFrom = vFrom !== null && vFrom !== undefined
      prop.to.unit = getUnit(vTo) || cssValueUnit
      prop.to.value = parseFloat(vTo) || cssValueN
      prop.from.unit = prop.to.unit
      prop.from.value = convertValueToUnitValue(
        target,
        parseFloat(vFrom) || cssValueN,
        getUnit(vFrom) || cssValueUnit,
        prop.to.unit
      )
    }
    // value is a number or a string, not an array
    else {
      prop.to.unit = getUnit(v) || cssValueUnit
      prop.to.value = parseFloat(v) || cssValueN
      prop.from.unit = cssValueUnit
      prop.from.value = convertValueToUnitValue(target, cssValueN, prop.from.unit, prop.to.unit)
    }

    log(props)

    // return interpol instance for current key
    return new Interpol({
      from: prop.from.value,
      to: prop.to.value,
      duration,
      ease,
      reverseEase,
      paused,
      delay,
      debug,
      beforeStart: () => {
        isLast && beforeStart?.()
        if (!prop._hasExplicitFrom) return
        const vu = prop.from.value + prop.from.unit
        target.style[prop.usedKey] = prop._isTransform ? `${prop.transformFn}(${vu})` : vu
      },
      onUpdate: ({ value, time, progress }) => {
        prop.update.value = value
        prop.update.time = time
        prop.update.progress = progress
        isLast && onUpdate?.(props)
        target.style[prop.usedKey] = prop._isTransform
          ? buildTransformChain(props)
          : value + prop.to.unit
      },
      onComplete: ({ value, time, progress }) => {
        prop.update.value = value
        prop.update.time = time
        prop.update.progress = progress
        isLast && onComplete?.(props)
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
