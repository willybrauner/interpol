import { Interpol } from "../index"
import { IInterpolConstruct, IUpdateParams } from "../interpol/Interpol"
import debug from "@wbe/debug"
import { extractValueAndUnit } from "./extractValueAndUnit"
import { getUnit } from "./getUnit"
import { convertValueToUnitValue } from "./convertValueToUnitValue"
import * as stream from "stream"
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

type PropsOptions = Partial<{
  usedKey: string
  update: { value: number; time: number; progress: number }
  to: { value: number; unit: string }
  from: { value: number; unit: string }
  transformFn: string
  _hasExplicitFrom: boolean
  _isTransform: boolean
}>

type Props = Map<string, PropsOptions>

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

export function convertMatrix(matrixString: string): {
  translateX?: string
  translateY?: string
  translateZ?: string
  scale?: string
  rotate?: string
  skew?: string
} {
  const matrixValues = matrixString
    .match(/matrix\((.+)\)/i)?.[1]
    .split(",")
    .map((val) => parseFloat(val.trim()))

  const a = matrixValues[0]
  const b = matrixValues[1]
  const c = matrixValues[2]
  const d = matrixValues[3]
  const tx = matrixValues[4]
  const ty = matrixValues[5]
  const tz = matrixValues[14] || 0
  const transformedValues: {
    translateX?: string
    translateY?: string
    translateZ?: string
    scale?: string
    rotate?: string
    skew?: string
  } = {}

  if (tx !== 0) {
    transformedValues.translateX = `translateX(${tx}px)`
  }
  if (ty !== 0) {
    transformedValues.translateY = `translateY(${ty}px)`
  }
  if (tz !== 0) {
    transformedValues.translateZ = `translateZ(${tz}px)`
  }
  if (a !== 1 || d !== 1) {
    transformedValues.scale = `scale(${a}, ${d})`
  }
  if (b !== 0 || c !== 0) {
    transformedValues.skew = `skew(${Math.atan2(c, d)}rad, ${Math.atan2(b, a)}rad)`
  }
  if (b !== 0 || c !== 0 || a !== 1 || d !== 1) {
    transformedValues.rotate = `rotate(${Math.atan2(b, a)}rad)`
  }
  return transformedValues
}

/**
 * Chain transforms properties
 */
const buildTransformChain = (props: Map<string, PropsOptions>): string => {
  let chain = ""
  for (const [k, { to, transformFn, update }] of props) {
    chain += `${transformFn}(${update.value}${to.unit}) `
  }
  return chain
}

export const getCssValue = (target: HTMLElement, key: string, proxyWindow = window): string => {
  let cptValue = target.style[key] || proxyWindow.getComputedStyle(target).getPropertyValue(key)
  if (cptValue === "none") cptValue = "0px"
  return cptValue
}

/**
 * IDOM
 *
 *
 *
 *
 *
 *
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

  const props: Props = new Map<string, PropsOptions>()

  // Map on available keys and return an interpol instance by key
  //  left: [0, 10] need its own interpol
  //  top: [-10, 10] need its own interpol too
  const itps = Object.keys(keys).map((key, i) => {
    const isLast = i === Object.keys(keys).length - 1
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

    // // case, value is an array [from, to] or [from, null]
    // if (Array.isArray(value)) {
    //   const [vFrom, vTo] = value
    //   hasExplicitFrom = vFrom !== null && vFrom !== undefined
    //   ;[toValue, toUnit] = extractValueAndUnit(target, key, vTo)
    //   ;[fromValue, fromUnit] = extractValueAndUnit(target, key, vFrom, toUnit)
    // }
    // // value is a number or a string, not an array
    // else {

    const cssValue: string = getCssValue(target, prop.usedKey)
    const cssValueN: number = parseFloat(cssValue) || 0
    const cssValueUnit: string = getUnit(cssValue)
    prop.to.unit = getUnit(v) || cssValueUnit
    prop.to.value = parseFloat(v) || cssValueN
    prop.from.unit = cssValueUnit
    prop.from.value = convertValueToUnitValue(target, cssValueN, prop.from.unit, prop.to.unit)

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
        isLast && onUpdate?.(values)
        target.style[prop.usedKey] = prop._isTransform
          ? buildTransformChain(props)
          : value + prop.to.unit
      },
      onComplete: ({ value, time, progress }) => {
        prop.update.value = value
        prop.update.time = time
        prop.update.progress = progress
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
