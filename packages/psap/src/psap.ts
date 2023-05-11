import debug from "@wbe/debug"
import { IInterpolConstruct, Ticker, Interpol } from "@psap/interpol"
import { getUnit } from "./getUnit"
import { convertValueToUnitValue } from "./convertValueToUnitValue"
import { buildTransformChain } from "./buildTransformChain"
import { getCssValue } from "./getCssValue"
const log = debug(`psap:psap`)

// ----------------------------------------------------------------------------- TYPES

export const VALID_TRANSFORMS = [
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

export type PropOptions = Partial<{
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

    // Add prop to props
    props.set(key, {
      usedKey: key,
      from: { value: undefined, unit: undefined },
      to: { value: undefined, unit: undefined },
      update: { value: undefined, time: undefined, progress: undefined },
      _hasExplicitFrom: false,
    })

    const prop = props.get(key)

    prop._isTransform = VALID_TRANSFORMS.includes(key)
    if (prop._isTransform) {
      prop.usedKey = "transform"
      if (key === "x") prop.transformFn = "translateX"
      else if (key === "y") prop.transformFn = "translateY"
      else if (key === "z") prop.transformFn = "translateZ"
      else prop.transformFn = key
    }

    // Value from css ex: translateX(10px) -> "10px"
    const cssValue: string = getCssValue(target, prop, proxyWindow)
    // Number value without unit -> 10 (or 0)
    const cssValueN: number = parseFloat(cssValue) || 0
    // Css value Unit -> "px"
    const cssValueUnit: string = getUnit(cssValue)

    // // Case we have two objects: "fromTo"
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
    // Case we have one object: "to"
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
      log({ "parseFloat(v)": parseFloat(v), cssValueN })
      log("prop.from.value", prop.from.value)
    }

    // Return interpol instance for current key
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
          if (isLast) {
            target.style[prop.usedKey] = prop._isTransform ? `${prop.transformFn}(${vu})` : vu
          }
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
          ? buildTransformChain(props, false)
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
