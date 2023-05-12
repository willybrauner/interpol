import debug from "@wbe/debug"
import { Ticker, Interpol, IInterpolConstruct } from "@psap/interpol"
import { getUnit } from "./getUnit"
import { convertValueToUnitValue } from "./convertValueToUnitValue"
import { buildTransformChain } from "./buildTransformChain"
import { getCssValue } from "./getCssValue"
import { convertMatrix } from "./convertMatrix"
import { isMatrix } from "./isMatrix"

const log = debug(`psap:psap`)

// prettier-ignore
export const VALID_TRANSFORMS = [
  "x", "y", "z", "translateX", "translateY", "translateZ", "rotate", "rotateX", "rotateY",
  "rotateZ", "scale", "scaleX", "scaleY", "scaleZ", "skew", "skewX", "skewY", "perspective"
] as const

interface CSSProps
  extends Record<keyof CSSStyleDeclaration | (typeof VALID_TRANSFORMS)[number], number | string> {}

interface IAnimOptionsWithoutProps
  extends Omit<IInterpolConstruct, "from" | "to" | "onUpdate" | "onComplete"> {
  onUpdate?: (props: Props) => void
  onComplete?: (props: Props) => void
  proxyWindow?: Window | any
  proxyDocument?: Document | any
}
type Options = Partial<IAnimOptionsWithoutProps & Partial<CSSProps>>

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

type PsapAPI = Readonly<{
  play: () => Promise<any>
  stop: () => void
  refreshComputedValues: () => void
  replay: () => Promise<any>
  reverse: () => Promise<any>
  pause: () => void
}>

type Target = Element | HTMLElement
type To = (target: Target, to: Options) => PsapAPI
type From = (target: Target, from: Partial<CSSProps>) => PsapAPI
type FromTo = (target: Target, from: Partial<CSSProps>, to: Options) => PsapAPI
type Psap = {
  to: To
  fromTo: FromTo
  from: From
}

/**
 * Main anim Function used by "to", "from" and "fromTo" methods
 *
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
    proxyWindow = window,
    proxyDocument = document,
    ...keys
  }: Options
) => {
  // Create a common ticker for all interpolations
  const ticker = new Ticker()

  // Props Map will contain all props to animate, it will be our main reference
  const props: Props = new Map<string, PropOptions>()

  // Before all, merge fromKeys and keys
  // in case "from" object only is set
  keys = { ...fromKeys, ...keys }

  // Get all transform fn from CSS (translate, rotate...)
  const transformValues =
    target?.style["transform"] || proxyWindow.getComputedStyle(target).getPropertyValue("transform")
  const trans = isMatrix(transformValues) ? convertMatrix(transformValues) : transformValues

  // Filter empty values and already defined keys
  // and add them to keys in order to be kept in the loop
  for (const transformFn in trans) {
    if (trans[transformFn] === "" || keys[transformFn]) {
      delete trans[transformFn]
    } else {
      const cssValue: string = getCssValue(
        target,
        { usedKey: "transform", transformFn },
        proxyWindow
      )
      keys = { ...{ [transformFn]: cssValue }, ...keys }
    }
  }

  // Start loop of prop keys \o/
  // ...........................
  const itps = Object.keys(keys).map((key, i) => {
    const isLast = i === Object.keys(keys).length - 1
    const v = keys[key]

    // Set the known information in the main "props" Map
    props.set(key, {
      usedKey: key,
      from: { value: undefined, unit: undefined },
      to: { value: undefined, unit: undefined },
      update: { value: undefined, time: undefined, progress: undefined },
      _hasExplicitFrom: false,
    })

    const prop = props.get(key)

    prop._isTransform = VALID_TRANSFORMS.includes(key as (typeof VALID_TRANSFORMS)[number])
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

    log({ cssValue, cssValueN, cssValueUnit })

    // Case we have two objects: "fromTo"
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
    // Case we have one object: "to" or "from" only
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
      // log({ "parseFloat(v)": parseFloat(v), cssValueN })
      // log("prop.from.value", prop.from.value)
    }
    log("prop", prop)
    log("props", props)

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
        if (prop._hasExplicitFrom || paused) {
          if (isLast) {
            log("beforeStart buildTransformChain(props)", buildTransformChain(props))
            target.style[prop.usedKey] = prop._isTransform
              ? buildTransformChain(props)
              : prop.from.value + prop.from.unit
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

/**
 * Final API
 *
 *
 */
export const psap: Psap = {
  to: (target, to) => anim(target, undefined, to),
  from: (target, from) => anim(target, from, undefined),
  fromTo: (target, from, to) => anim(target, from, to),
}
