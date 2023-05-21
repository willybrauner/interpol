import debug from "@wbe/debug"
import { Ticker, Interpol, IInterpolConstruct } from "@psap/interpol"
import { getUnit } from "./getUnit"
import { convertValueToUnitValue } from "./convertValueToUnitValue"
import { buildTransformChain } from "./buildTransformChain"
import { getCssValue } from "./getCssValue"
import { convertMatrix } from "./convertMatrix"
import { isMatrix } from "./isMatrix"
import { w } from "vitest/dist/types-b7007192"

const log = debug(`psap:psap`)

// prettier-ignore
export const DEG_UNIT_FN = ["rotate", "rotateX", "rotateY", "rotateZ", "skew", "skewX", "skewY"] as const
export const RAD_UNIT_FN = ["perspective"] as const
export const PX_UNIT_FN = ["translateX", "translateY", "translateZ"] as const
const NO_UNIT_FN = ["scale", "scaleX", "scaleY", "scaleZ"] as const
export const VALID_TRANSFORMS = [
  "x",
  "y",
  "z",
  ...PX_UNIT_FN,
  ...DEG_UNIT_FN,
  ...RAD_UNIT_FN,
  ...NO_UNIT_FN,
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
type Options = IAnimOptionsWithoutProps & Partial<CSSProps>

export type PropOptions = Partial<{
  usedKey: string
  update: { value: number; time: number; progress: number }
  to: { value: number; unit: string }
  from: { value: number; unit: string }
  transformFn: string
  _hasExplicitFrom: boolean
  _hasExplicitTo: boolean
  _isTransform: boolean
}>

type Props = Map<string, PropOptions>

type API = Readonly<{
  play: () => Promise<any>
  stop: () => void
  refreshComputedValues: () => void
  replay: () => Promise<any>
  reverse: () => Promise<any>
  pause: () => void
}>

type Target = Element | HTMLElement
type To = (target: Target, to: Options) => API
type From = (target: Target, from: Options) => API
type FromTo = (target: Target, from: Partial<CSSProps>, to: Options) => API

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
const _anim = (target, fromKeys: Options, toKeys: Options) => {
  // Create a common ticker for all interpolations
  const ticker = new Ticker()

  // Props Map will contain all props to animate, it will be our main reference
  const props: Props = new Map<string, PropOptions>()

  // Before all, merge fromKeys and keys
  // in case "from" object only is set
  let keys = { ...(fromKeys || {}), ...(toKeys || {}) }

  const o: IAnimOptionsWithoutProps = {
    duration: 1,
    ease: (t) => t,
    reverseEase: (t) => t,
    paused: false,
    delay: 0,
    debug: false,
    beforeStart: () => {},
    onUpdate: (props) => {},
    onComplete: (props) => {},
    proxyWindow: typeof window !== "undefined" && window,
    proxyDocument: typeof window !== "undefined" && document,
  }
  // same with classic for loop
  for (let i = 0; i < Object.keys(o).length; i++) {
    const option = Object.keys(o)[i]
    if (keys[option]) {
      o[option] = keys[option]
      delete keys[option]
    }
  }

  // .......................
  // Prepare transform props
  // If keys contains valid transform keys
  if (Object.keys(keys).some((key) => VALID_TRANSFORMS.includes(key as any))) {
    // Get all transform fn from CSS (translate, rotate...)
    const transformFn =
      target?.style.transform ??
      o.proxyWindow.getComputedStyle(target).getPropertyValue("transform")

    if (transformFn && transformFn !== "none") {
      const trans = isMatrix(transformFn) ? convertMatrix(transformFn) : transformFn
      // Filter empty values and already defined keys
      // and add them to keys in order to be kept in the loop
      for (const transformFn in trans) {
        if (trans[transformFn] === "" || keys[transformFn]) {
          delete trans[transformFn]
        } else {
          const cssValue: string = getCssValue(
            target,
            { usedKey: "transform", transformFn },
            o.proxyWindow
          )
          keys = { ...{ [transformFn]: cssValue }, ...keys }
        }
      }
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
      _hasExplicitTo: false,
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

    log("-----------------------------------------------------------------------")

    // Value from css ex: transform: translateX(10px) -> "10px" | marginLeft: "1px" -> "1px"
    let cssValue: string = getCssValue(target, prop, o.proxyWindow)
    //    cssValue = Number.isNaN(cssValue) || cssValue === "" ? "0px" : cssValue
    // Number value without unit -> 10 (or 0)
    const cssValueN: number = parseFloat(cssValue) || 0
    // Css value Unit -> "px"
    const cssValueUnit: string = getUnit(cssValue, prop)
    log("before specific cases", { cssValue, cssValueN, cssValueUnit })

    // Case we have one object: "from"
    if (fromKeys && !toKeys) {
      log("is from")
      prop._hasExplicitFrom = true
      prop.from.unit = getUnit(v, prop) || cssValueUnit
      prop.from.value = parseFloat(v) && !isNaN(parseFloat(v)) ? parseFloat(v) : cssValueN
      prop.to.unit = cssValueUnit
      prop.to.value = cssValueN
    }

    // Case we have two objects: "fromTo"
    else if (fromKeys && toKeys) {
      log("is fromTo")
      const [vFrom, vTo] = [fromKeys[key], keys[key]]
      prop._hasExplicitFrom = vFrom !== null && vFrom !== undefined

      prop.to.unit = getUnit(vTo, prop) || cssValueUnit
      prop.to.value = parseFloat(vTo) && !isNaN(parseFloat(vTo)) ? parseFloat(vTo) : cssValueN
      prop.from.unit = prop.to.unit
      prop.from.value = convertValueToUnitValue(
        target,
        parseFloat(vFrom) && !isNaN(parseFloat(vFrom)) ? parseFloat(vFrom) : cssValueN,
        getUnit(vFrom, prop) || cssValueUnit,
        prop.to.unit,
        o.proxyWindow,
        o.proxyDocument
      )
    }
    // Case we have one object: "to"
    else {
      log("is to")
      prop.to.unit = getUnit(v, prop) || cssValueUnit
      prop.to.value = parseFloat(v) && !isNaN(parseFloat(v)) ? parseFloat(v) : cssValueN
      prop.from.unit = cssValueUnit
      prop.from.value = convertValueToUnitValue(
        target,
        cssValueN,
        prop.from.unit,
        prop.to.unit,
        o.proxyWindow,
        o.proxyDocument
      )
    }
    log("prop", prop)
    log("props", props)

    // Return interpol instance for current key
    const itp = new Interpol({
      from: prop.from.value,
      to: prop.to.value,
      duration: o.duration !== undefined ? (o.duration as number) * 1000 : 1000,
      ease: o.ease,
      reverseEase: o.reverseEase,
      paused: o.paused,
      delay: o.delay,
      ticker,
      debug: o.debug,
      beforeStart: () => {
        if (prop._hasExplicitFrom || o.paused) {
          target.style[prop.usedKey] = prop._isTransform
            ? buildTransformChain(props, "from")
            : prop.from.value + prop.from.unit
        }
        if (isLast) o.beforeStart?.()
      },
      onUpdate: ({ value, time, progress }) => {
        prop.update.value = value
        prop.update.time = time
        prop.update.progress = progress
        target.style[prop.usedKey] = prop._isTransform
          ? buildTransformChain(props, "update")
          : value + prop.to.unit
        if (isLast) o.onUpdate?.(props)
      },
      onComplete: () => {
        const dir = itp.isReversed ? "from" : "to"
        target.style[prop.usedKey] = prop._isTransform
          ? buildTransformChain(props, dir)
          : prop[dir].value + prop[dir].unit
        if (isLast) o.onComplete?.(props)
      },
    })

    return itp
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
const psap: Psap = {
  to: (target, to) => _anim(target, undefined, to),
  from: (target, from) => _anim(target, from, undefined),
  fromTo: (target, from, to) => _anim(target, from, to),
}

export { psap }
