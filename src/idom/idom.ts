import { Interpol } from "../index"
import { IInterpolConstruct, IUpdateParams } from "../interpol/Interpol"
import debug from "@wbe/debug"
import { extractValueAndUnit } from "./extractValueAndUnit"
const log = debug(`interpol:idom`)

// ----------------------------------------------------------------------------- TYPES

type ValueType = number | string
interface AdditionalProperties<V = ValueType> {
  x: V
  y: V
  z: V
  translateX: V
  translateY: V
  translateZ: V
  rotate: V
  rotateX: V
  rotateY: V
  rotateZ: V
  scale: V
  scaleX: V
  scaleY: V
  scaleZ: V
  skew: V
  skewX: V
  skewY: V
  perspective: V
  matrix: V
  matrix3d: V
}

type CallbackParams = Record<string, IUpdateParams>[]

interface ITPOptions<KEYS = any>
  extends Omit<IInterpolConstruct, "from" | "to" | "onUpdate" | "onComplete"> {
  onUpdate?: (e: CallbackParams) => void
  onComplete?: (e: CallbackParams) => void
}

type Styles = Record<keyof CSSStyleDeclaration, ValueType> & AdditionalProperties
type Options = ITPOptions & Styles

type ValueUnit = [number, string]

type MapTransforms = Map<string, { toValue: number; toUnit: string; currentValue: number }>

// ----------------------------------------------------------------------------- IDOM

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
const buildTransformChain = (transforms: MapTransforms): string => {
  let chain = ""
  for (const [key, { toUnit, currentValue }] of transforms) {
    // if (key === "scale" || "scaleX" || "scaleY" || "scaleZ") u = ""
    chain += `${key}(${currentValue}${toUnit ?? ""}) `
  }
  return chain
}

export const getCptValue = (target: HTMLElement, key: string, proxyWindow = window): string => {
  let cptValue = proxyWindow.getComputedStyle(target).getPropertyValue(key)
  if (cptValue === "none") cptValue = "0px"
  return cptValue
}

/**
 * IDOM
 *
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

  // keep values
  const values: Record<keyof typeof keys, IUpdateParams>[] = []

  // keep transforms
  const transforms = new Map<string, { toValue: number; toUnit: string; currentValue: number }>()

  // Map on available keys and return an interpol instance by key
  //  left: [0, 10] need its own interpol
  //  top: [-10, 10] need its own interpol too
  const itps = Object.keys(keys).map((key, i) => {
    const isLast = i === Object.keys(keys).length - 1
    let value = keys[key]
    let hasExplicitFrom = false
    let fromValue: number
    let fromUnit: string
    let toValue: number
    let toUnit: string

    // transform
    let initialKey = key
    const keyIsTransform = validTransforms.includes(key)
    if (keyIsTransform) key = "transform"

    // case, value is an array [from, to] or [from, null]
    if (Array.isArray(value)) {
      const [vFrom, vTo] = value
      hasExplicitFrom = vFrom !== null && vFrom !== undefined
      ;[toValue, toUnit] = extractValueAndUnit(target, key, vTo)
      ;[fromValue, fromUnit] = extractValueAndUnit(target, key, vFrom, toUnit)
    }
    // value is a number or a string, not an array
    else {
      ;[toValue, toUnit] = extractValueAndUnit(target, key, value)
      ;[fromValue, fromUnit] = extractValueAndUnit(target, key, getCptValue(target, key), toUnit)
    }

    if (keyIsTransform) {
      if (initialKey === "x") initialKey = "translateX"
      if (initialKey === "y") initialKey = "translateY"
      if (initialKey === "z") initialKey = "translateZ"
      transforms.set(initialKey, { toValue, toUnit, currentValue: null })
    }

    // return interpol instance for current key
    return new Interpol({
      from: fromValue,
      to: toValue,
      duration,
      ease,
      reverseEase,
      paused,
      delay,
      debug,
      beforeStart: () => {
        if (hasExplicitFrom) {
          const vu = `${fromValue}${fromUnit}`
          if (keyIsTransform) {
            // FIXME adapter
            target.style[key] = `${initialKey}(${vu})`
          } else {
            target.style[key] = vu
          }
        }
        isLast && beforeStart?.()
      },
      onUpdate: ({ value, time, progress }) => {
        if (keyIsTransform) {
          transforms.get(initialKey).currentValue = value
          target.style[key] = buildTransformChain(transforms)
        } else {
          target.style[key] = `${value}${toUnit}`
        }

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
