import debug from "@wbe/debug"
import { Ticker, Interpol, IInterpolConstruct } from "@psap/interpol"
import { getUnit } from "./getUnit"
import { convertValueToUnitValue } from "./convertValueToUnitValue"
import { buildTransformChain } from "./buildTransformChain"
import { getCssValue } from "./getCssValue"
import { convertMatrix } from "./convertMatrix"
import { isMatrix } from "./isMatrix"
import { compute } from "@psap/interpol"
import { easeAdaptor, EaseName } from "../utils/ease"

const log = debug(`psap:psap`)
const isSSR = () => typeof window === "undefined"

// prettier-ignore
export const DEG_UNIT_FN = ["rotate", "rotateX", "rotateY", "rotateZ", "skew", "skewX", "skewY"] as const
export const RAD_UNIT_FN = ["perspective"] as const
export const PX_UNIT_FN = ["translateX", "translateY", "translateZ"] as const
export const NO_UNIT_FN = ["scale", "scaleX", "scaleY", "scaleZ"] as const
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
  extends Record<
    keyof CSSStyleDeclaration | (typeof VALID_TRANSFORMS)[number],
    number | (() => number) | string | (() => string)
  > {}

type AnimType = "to" | "from" | "fromTo" | "set"

interface IAnimOptionsWithoutProps
  extends Omit<
    IInterpolConstruct,
    "reverseEase" | "ease" | "from" | "to" | "onUpdate" | "onComplete"
  > {
  ease?: EaseName | ((t: number) => number)
  reverseEase?: EaseName | ((t: number) => number)
  onUpdate?: (props: Props) => void
  onComplete?: (props: Props) => void
  proxyWindow?: Window | any
  proxyDocument?: Document | any
  _type?: AnimType
  stagger?: number
}

type Options = IAnimOptionsWithoutProps & Partial<CSSProps>
type OptionsParams = Omit<Options, "_type">

export type PropOptions = Partial<{
  usedKey: string
  update: { value: number; time: number; progress: number }
  duration: { value: number; _value: number | (() => number) }
  to: { value: number; _value: number | (() => number); unit: string }
  from: { value: number; _value: number | (() => number); unit: string }
  transformFn: string
  _hasExplicitFrom: boolean
  _isTransform: boolean
  _isObject: boolean
}>

type Props = Map<string, PropOptions>

type API = Readonly<{
  play: () => Promise<any>
  stop: () => void
  replay: () => Promise<any>
  reverse: () => Promise<any>
  pause: () => void
  refresh: () => void
}>

type Target =
  | Element
  | Element[]
  | HTMLElement
  | HTMLElement[]
  | NodeList
  | Node
  | Record<string, number>

type SetOmit =
  | "ease"
  | "reverseEase"
  | "paused"
  | "delay"
  | "duration"
  | "onUpdate"
  | "beforeStart"
  | "onRepeatComplete"

type Set = (target: Target, to: Omit<OptionsParams, SetOmit>) => API
type To = (target: Target, to: OptionsParams) => API
type From = (target: Target, from: OptionsParams) => API
type FromTo = (target: Target, from: Partial<CSSProps>, to: OptionsParams) => API

type Psap = {
  set: Set
  to: To
  fromTo: FromTo
  from: From
}

/**
 * Main anim Function
 *
 *
 *
 */
const _anim = (
  target: HTMLElement,
  index: number,
  isLastAnim: boolean,
  fromKeys: Options,
  toKeys: Options
) => {
  // Create a common ticker for all interpolations
  const ticker = new Ticker()

  // Props Map will contain all props to animate, it will be our main reference
  const props: Props = new Map<string, PropOptions>()

  // Before all, merge fromKeys and keys in case "from" object only is set
  let keys = { ...(fromKeys || {}), ...(toKeys || {}) }

  const o: IAnimOptionsWithoutProps = {
    duration: 1,
    ease: (t) => t,
    reverseEase: null,
    paused: false,
    delay: 0,
    debug: false,
    beforeStart: () => {},
    onUpdate: (props) => {},
    onComplete: (props) => {},
    proxyWindow: !isSSR() && window,
    proxyDocument: !isSSR() && document,
    stagger: 0,
    _type: null,
  }

  // Merge options
  for (let i = 0; i < Object.keys(o).length; i++) {
    const option = Object.keys(o)[i]
    if (keys[option]) {
      o[option] = keys[option]
      delete keys[option]
    }
  }

  // Prepare transform props
  // .......................
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
    const isLastProp = i === Object.keys(keys).length - 1
    const isLast = isLastAnim && isLastProp

    // Set the known information in the main "props" Map
    props.set(key, {
      usedKey: key,
      duration: { value: undefined, _value: o.duration },
      from: { value: undefined, _value: fromKeys?.[key], unit: undefined },
      to: { value: undefined, _value: keys?.[key], unit: undefined },
      update: { value: undefined, time: undefined, progress: undefined },
      _hasExplicitFrom: false,
      _isObject: !(target instanceof o.proxyWindow.HTMLElement),
    })

    const vTo = compute(keys?.[key])
    const vFrom = compute(fromKeys?.[key])
    o.duration = compute(o.duration)

    const prop = props.get(key)
    prop.duration.value = o.duration as number

    prop._isTransform = VALID_TRANSFORMS.includes(key as (typeof VALID_TRANSFORMS)[number])
    if (prop._isTransform) {
      prop.usedKey = "transform"
      if (key === "x") prop.transformFn = "translateX"
      else if (key === "y") prop.transformFn = "translateY"
      else if (key === "z") prop.transformFn = "translateZ"
      else prop.transformFn = key
    }

    log("---------------------------------------------------------------------------------")

    // Value from css ex: transform: translateX(10px) -> "10px" | marginLeft: "1px" -> "1px"
    let cssValue: string = prop._isObject ? null : getCssValue(target, prop, o.proxyWindow)
    // Number value without unit -> 10 (or 0)
    const cssValueN: number = parseFloat(cssValue) || 0
    // Css value Unit -> "px"
    const cssValueUnit: string = prop._isObject ? null : getUnit(cssValue, prop)
    log({ cssValue, cssValueN, cssValueUnit })

    // Case we have one object: "from"
    if (o._type === "from") {
      prop._hasExplicitFrom = true
      prop.from.unit = getUnit(vTo, prop) || cssValueUnit
      prop.from.value = parseFloat(vTo) && !isNaN(parseFloat(vTo)) ? parseFloat(vTo) : cssValueN
      prop.to.unit = cssValueUnit
      prop.to.value = cssValueN
    }

    // Case we have two objects: "fromTo"
    else if (o._type === "fromTo") {
      prop._hasExplicitFrom = true
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
    // Case we have one object: "to" or "set"
    else {
      prop.to.unit = getUnit(vTo, prop) || cssValueUnit
      prop.to.value = parseFloat(vTo) && !isNaN(parseFloat(vTo)) ? parseFloat(vTo) : cssValueN
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

    // prepare interpol ease
    const chooseEase = (ease) => (typeof ease === "string" ? easeAdaptor(ease as EaseName) : ease)

    // prepare interpol setValueOn: where we have to set the value
    let setValueOn = (v: number | string): void => {
      prop._isObject ? (target[prop.usedKey] = v) : (target.style[prop.usedKey] = v)
    }

    // Return interpol instance for current key

    // prettier-ignore
    const itp = new Interpol({
      from: prop.from.value,
      to: prop.to.value,
      duration:
        // case "set" we don't want to animate
        // else animate 1s by default if no duration is specified
        o._type === "set" ? 0 : o.duration !== undefined ? (o.duration as number) * 1000 : 1000,
      ease: chooseEase(o.ease),
      reverseEase: chooseEase(o.reverseEase),
      paused: o.paused,
      delay: (o.delay + index * o.stagger) * 1000,
      ticker,
      debug: o.debug,
      beforeStart: () => {
        if (prop._hasExplicitFrom || o.paused) {
          setValueOn(prop._isTransform ? buildTransformChain(props, "from") : prop.from.value + prop.from.unit)
        }
        if (isLast) o.beforeStart?.()
      },
      onUpdate: ({ value, time, progress }) => {
        prop.update.value = value
        prop.update.time = time
        prop.update.progress = progress
        setValueOn(prop._isTransform ? buildTransformChain(props, "update") : value + prop.to.unit)
        if (isLast) o.onUpdate?.(props)
      },
      onComplete: () => {
        const dir = itp.isReversed ? "from" : "to"
        setValueOn(prop._isTransform ? buildTransformChain(props, dir) : prop[dir].value + prop[dir].unit)
        if (isLast) o.onComplete?.(props)
      },
    })
    // assign refresh method to interpol instance
    itp.refresh = () => {
      for (let el of ["to", "from", "duration"]) {
        prop[el].value = compute(prop[el]._value) ?? 0
        itp[el] = prop[el].value * (el === "duration" ? 1000 : 1)
      }
    }

    return itp
  })

  // _anim return (multiple itps)
  return returnAPI(itps)
}

/**
 * return
 */
const returnAPI = (anims: any[]): API => {
  return Object.freeze({
    play: () => Promise.all(anims.map((e) => e.play())),
    replay: () => Promise.all(anims.map((e) => e.replay())),
    reverse: () => Promise.all(anims.map((e) => e.reverse())),
    stop: () => anims.forEach((e) => e.stop()),
    pause: () => anims.forEach((e) => e.pause()),
    refresh: () => anims.forEach((e) => e.refresh()),
  })
}

const isNodeList = ($el): boolean => {
  return isSSR()
    ? Array.isArray($el)
    : NodeList.prototype.isPrototypeOf($el) || $el.constructor === NodeList
}

/**
 * Final
 */
// Abstracted commons anims function
const fTarget = (t): any[] => (isNodeList(t) ? Array.from(t) : [t])
const isLast = (i, t) => i === t.length - 1
const anims = (target, from, to) =>
  fTarget(target).map((trg, index) => _anim(trg, index, isLast(index, fTarget(target)), from, to))

const psap: Psap = {
  set: (target, to) => {
    const from = undefined
    to = { ...to, _type: "set" } as Options
    return returnAPI(anims(target, from, to))
  },

  to: (target, to) => {
    const from = undefined
    to = { ...to, _type: "to" } as Options
    return returnAPI(anims(target, from, to))
  },

  from: (target, from) => {
    from = { ...from, _type: "from" } as Options
    const to = undefined
    return returnAPI(anims(target, from, to))
  },

  fromTo: (target, from, to) => {
    from = { ...from, _type: "fromTo" } as Options
    return returnAPI(anims(target, from, to))
  },
}

export { psap }
