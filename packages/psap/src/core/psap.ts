import debug from "@wbe/debug"
import { Ticker, Interpol, IInterpolConstruct } from "@psap/interpol"
import { getUnit } from "./getUnit"
import { convertValueToUnitValue } from "./convertValueToUnitValue"
import { buildTransformChain } from "./buildTransformChain"
import { getCssValue } from "./getCssValue"
import { convertMatrix } from "./convertMatrix"
import { isMatrix } from "./isMatrix"
import { isSSR, compute } from "@psap/utils"
import { easeAdaptor, EaseName } from "../utils/ease"
import { PsapTimeline } from "./PsapTimeline"

const log = debug(`psap:psap`)

/**
 * Constants
 *
 *
 */
// prettier-ignore
export const DEG_UNIT_FN = ["rotate", "rotateX", "rotateY", "rotateZ", "skew", "skewX", "skewY"] as const
export const RAD_UNIT_FN = ["perspective"] as const
export const PX_UNIT_FN = ["translateX", "translateY", "translateZ"] as const
export const NO_UNIT_FN = ["scale", "scaleX", "scaleY", "scaleZ"] as const
// prettier-ignore
export const VALID_TRANSFORMS = ["x", "y", "z", ...PX_UNIT_FN, ...DEG_UNIT_FN, ...RAD_UNIT_FN, ...NO_UNIT_FN] as const

/**
 * Types
 *
 *
 */
type CSSProps = Record<
  keyof CSSStyleDeclaration | (typeof VALID_TRANSFORMS)[number],
  number | (() => number) | string | (() => string)
>

type AnimType = "to" | "from" | "fromTo" | "set"

interface OptionsWithoutProps
  extends Omit<
    IInterpolConstruct,
    "reverseEase" | "ease" | "from" | "to" | "onUpdate" | "onComplete"
  > {
  ease: EaseName | ((t: number) => number)
  reverseEase: EaseName | ((t: number) => number)
  onUpdate: (props: Props) => void
  onComplete: (props: Props) => void
  proxyWindow: Window | any
  proxyDocument: Document | any
  stagger: number
  _type: AnimType
}

type Options<T> = (Partial<OptionsWithoutProps> & Partial<CSSProps>) | T

export type PropOptions = Partial<{
  target
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
  replay: () => Promise<any>
  reverse: () => Promise<any>
  stop: () => void
  pause: () => void
  refresh: () => void
}>

type Target =
  | Element
  | HTMLElement
  | Node
  | Element[]
  | HTMLElement[]
  | NodeList
  | Record<string, number>

// Omit OmitPsapSet make loose the Options<T> type
type OmitPsapSet =
  | "ease"
  | "reverseEase"
  | "paused"
  | "delay"
  | "duration"
  | "onUpdate"
  | "beforeStart"
  | "onRepeatComplete"

type Psap = {
  set: <T extends Target>(target: T, to: Options<T>) => API
  to: <T extends Target>(target: T, to: Options<T>) => API
  from: <T extends Target>(target: T, from: Options<T>) => API
  fromTo: <T extends Target>(target: T, from: Partial<CSSProps>, to: Options<T>) => API
  timeline: (e?) => PsapTimeline
}

/**
 * Main _anim function
 *
 *
 */
const _anim = <T>(
  target: T,
  index: number,
  isLastAnim: boolean,
  inTl: boolean,
  fromKeys: Options<T>,
  toKeys: Options<T>
) => {
  // Create a common ticker for all interpolations
  const ticker = new Ticker()

  // Props Map will contain all props to animate, it will be our main reference
  const props: Props = new Map<string, PropOptions>()

  // Before all, merge fromKeys and keys in case "from" object only is set
  let keys = { ...(fromKeys || {}), ...(toKeys || {}) }

  const o: OptionsWithoutProps = {
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
      (target as HTMLElement)?.style.transform ??
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
            target as HTMLElement,
            { usedKey: "transform", transformFn },
            o.proxyWindow
          )
          keys = { ...{ [transformFn]: cssValue }, ...keys }
        }
      }
    }
  }

  // Start loop of prop keys \o\
  // ...........................

  const itps = Object.keys(keys).map((key, i) => {
    const isLastProp = i === Object.keys(keys).length - 1
    const isLast = isLastAnim && isLastProp

    // Set the known information in the main "props" Map
    props.set(key, {
      target,
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

    log("-----------------------------------------------------------------------")

    // Value from css ex: transform: translateX(10px) -> "10px" | marginLeft: "1px" -> "1px"
    let cssValue: string = prop._isObject
      ? null
      : getCssValue(target as HTMLElement, prop, o.proxyWindow)
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
        target as HTMLElement,
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
        target as HTMLElement,
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
      prop._isObject
        ? (target[prop.usedKey] = v)
        : ((target as HTMLElement).style[prop.usedKey] = v)
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
      }
    })
    // assign refresh method to interpol instance
    itp.refresh = () => {
      for (let el of ["to", "from", "duration"]) {
        prop[el].value = compute(prop[el]._value) ?? 0
        itp[el] = prop[el].value * (el === "duration" ? 1000 : 1)
      }
    }

    itp.prop = prop
    return itp
  })

  // _anim return (multiple itps)
  return returnAPI(itps)
}

/**
 * Final
 *
 *
 */
const returnAPI = (anims): API => {
  return Object.freeze({
    play: () => Promise.all(anims.map((e) => e.play())),
    replay: () => Promise.all(anims.map((e) => e.replay())),
    reverse: () => Promise.all(anims.map((e) => e.reverse())),
    stop: () => anims.forEach((e) => e.stop()),
    pause: () => anims.forEach((e) => e.pause()),
    refresh: () => anims.forEach((e) => e.refresh()),
    _props: anims.map((e) => e.prop),
  })
}

const fTarget = <T extends Target>(t: T): T[] => {
  if (typeof t === "string") return Array.from(document.querySelectorAll(t))
  else if (isNodeList(t)) return Array.from(t as T[])
  else return [t]
}
// return one anim per target
export const computeAnims = <T extends Target>(target: T, from, to, inTl = false) =>
  fTarget<T>(target).map((trg, index) =>
    _anim<T>(trg, index, isLast(index, fTarget(target)), inTl, from, to)
  )

const isNodeList = ($el): boolean =>
  isSSR()
    ? Array.isArray($el)
    : NodeList.prototype.isPrototypeOf($el) || $el.constructor === NodeList

const isLast = (i: number, t: any[]): boolean => i === t.length - 1

const psap: Psap = {
  set: (target, to) => {
    to = { ...to, _type: "set" }
    return returnAPI(computeAnims(target, undefined, to))
  },
  to: (target, to) => {
    to = { ...to, _type: "to" }
    return returnAPI(computeAnims(target, undefined, to))
  },
  from: (target, from) => {
    from = { ...from, _type: "from" }
    return returnAPI(computeAnims(target, from, undefined))
  },
  fromTo: (target, from, to) => {
    to = { ...to, _type: "fromTo" }
    return returnAPI(computeAnims(target, from, to))
  },
  // TODO pass params to timeline
  timeline: (): PsapTimeline => {
    return new PsapTimeline()
  },
}

export { psap }
