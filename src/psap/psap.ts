import Ticker from "~/core/Ticker"
import { IInterpolConstruct } from "~/types"
import { convertMatrix } from "~/psap/convertMatrix"
import debug from "@wbe/debug"
import { getUnit } from "~/psap/getUnit"
import { convertValueToUnitValue } from "~/psap/convertValueToUnitValue"
import { Interpol } from "~/interpol/Interpol"
const log = debug(`interpol:psap`)

// ----------------------------------------------------------------------------- TYPES

type Value = number | string
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
}

interface IAnimOptionsWithoutProps
  extends Omit<IInterpolConstruct, "from" | "to" | "onUpdate" | "onComplete"> {
  onUpdate?: (props: Props) => void
  onComplete?: (props: Props) => void
  proxyWindow?
  proxyDocument?
}

type Options = IAnimOptionsWithoutProps & Partial<CSSProps>

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

type Return = Readonly<{
  play: () => Promise<Awaited<any>[]>
  stop: () => void
  refreshComputedValues: () => void
  replay: () => Promise<Awaited<any>[]>
  reverse: () => Promise<Awaited<unknown>[]>
  pause: () => void
}>
type To = (target: Element | HTMLElement, to: Options) => Return
type FromTo = (target: Element | HTMLElement, from: Partial<CSSProps>, to: Options) => Return
type Psap = {
  to: To
  fromTo: FromTo
}

// ----------------------------------------------------------------------------- UTILS

export const validTransforms = [
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
]

/**
 * Chain transforms properties
 */
const buildTransformChain = (props: Map<string, PropOptions>): string => {
  let chain = ""
  for (const [k, { to, transformFn, update, _isTransform }] of props)
    if (_isTransform) chain += `${transformFn}(${update.value}${to.unit}) `
  return chain.trim()
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

/**
 *
 *
 */
const anim = (
  target,
  fromKeys: Options,
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
    proxyWindow,
    proxyDocument,
    ...keys
  }: Options
) => {
  const props: Props = new Map<string, PropOptions>()

  const ticker = new Ticker()

  const keysEntries = Object.keys(keys)
  const itps = keysEntries.map((key, i) => {
    const isLast = i === keysEntries.length - 1
    const v = keys[key]

    props.set(key, {
      usedKey: key,
      from: { value: undefined, unit: undefined },
      to: { value: undefined, unit: undefined },
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

    const cssValue: string = getCssValue(target, prop, proxyWindow)
    const cssValueN: number = parseFloat(cssValue) || 0
    const cssValueUnit: string = getUnit(cssValue)

    // // case, we have two objects, from To
    if (fromKeys) {
      const [vFrom, vTo] = [fromKeys[key], keys[key]]
      prop._hasExplicitFrom = vFrom !== null && vFrom !== undefined
      prop.to.unit = getUnit(vTo) || cssValueUnit
      prop.to.value = parseFloat(vTo) || cssValueN
      prop.from.unit = prop.to.unit
      prop.from.value = convertValueToUnitValue(
        target,
        parseFloat(vFrom) || cssValueN,
        getUnit(vFrom) || cssValueUnit,
        prop.to.unit,
        proxyWindow,
        proxyDocument
      )
    }
    // case, we have one object to
    else {
      prop.to.unit = getUnit(v) || cssValueUnit
      prop.to.value = parseFloat(v) || cssValueN
      prop.from.unit = cssValueUnit
      prop.from.value = convertValueToUnitValue(
        target,
        cssValueN,
        prop.from.unit,
        prop.to.unit,
        proxyWindow,
        proxyDocument
      )
    }

    // return interpol instance for current key
    return new Interpol({
      from: prop.from.value,
      to: prop.to.value,
      duration: duration ? (duration as number) * 1000 : 1000,
      ease,
      reverseEase,
      paused,
      delay,
      ticker,
      debug,
      beforeStart: () => {
        if (prop._hasExplicitFrom) {
          const vu = prop.from.value + prop.from.unit
          target.style[prop.usedKey] = prop._isTransform ? `${prop.transformFn}(${vu})` : vu
        }
        if (isLast) beforeStart?.()
      },
      onUpdate: ({ value, time, progress }) => {
        prop.update.value = value
        prop.update.time = time
        prop.update.progress = progress
        target.style[prop.usedKey] = prop._isTransform
          ? buildTransformChain(props)
          : value + prop.to.unit
        if (isLast) onUpdate?.(props)
      },
      onComplete: ({ value }) => {
        target.style[prop.usedKey] = prop._isTransform
          ? buildTransformChain(props)
          : value + prop.to.unit
        if (isLast) onComplete?.(props)
      },
    })
  })

  return Object.freeze({
    play: () => Promise.all(itps.map((e) => e.play())),
    replay: () => Promise.all(itps.map((e) => e.replay())),
    reverse: () => Promise.all(itps.map((e) => e.reverse())),
    stop: () => itps.forEach((e) => e.stop()),
    pause: () => itps.forEach((e) => e.pause()),
    refreshComputedValues: () => itps.forEach((e) => e.refreshComputedValues()),
  })
}

// Final API
export const psap: Psap = {
  to: (target: Element | HTMLElement, to: Options) => anim(target, undefined, to),
  fromTo: (target: Element | HTMLElement, from: Partial<CSSProps>, to: Options) =>
    anim(target, from, to),
}
