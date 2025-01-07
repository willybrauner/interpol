import { Interpol } from "../Interpol"
import { Ticker } from "./Ticker"
import { Ease } from "./ease"

/**
 * Common
 *
 *
 */

// Final Props Object returned by callbacks
export type PropsValueObjectRef<K extends string> = Record<K, number>

// Value can be a number or a function that return a number
export type Value = number | (() => number)
export type Units = "%" | "px" | "em" | "rem" | "vw" | "vh" | "pt" | string

// Props params
export type PropsValues =
  | Value
  | [Value, Value, (Units | null | undefined)?]
  | Partial<{ from: Value; to: Value; ease: Ease; reverseEase: Ease }>
export type Props<K extends string = string> = Record<K, PropsValues>

// Props object formatted in Map
export type FormattedProp = {
  from: Value
  to: Value
  _from: number
  _to: number
  value: number
  ease: Ease
  reverseEase: Ease
}

type ConfigKeys =
  | "props"
  | "duration"
  | "ease"
  | "reverseEase"
  | "paused"
  | "immediateRender"
  | "delay"
  | "debug"
  | "beforeStart"
  | "onUpdate"
  | "onComplete"

/**
 * Interpol
 *
 *
 */
export type CallBack<K extends keyof Props> = (
  props: PropsValueObjectRef<Exclude<K, ConfigKeys>>,
  time: number,
  progress: number,
  instance: Interpol<K>,
) => void

export type El = HTMLElement | HTMLElement[] | Record<any, number> | null

export type InterpolConstruct<K extends keyof Props> = {
  props?: Props<K>
  duration?: Value
  ease?: Ease
  reverseEase?: Ease
  paused?: boolean
  immediateRender?: boolean
  delay?: number
  debug?: boolean
  beforeStart?: CallBack<K>
  onUpdate?: CallBack<K>
  onComplete?: CallBack<K>
  //[key: string]: PropsValues | boolean | Function | undefined | Ease | CallBack<K> | Props<K>
} & {
  [P in K]: PropsValues | boolean | Function | undefined | Ease | CallBack<K> | Props<K>
}

/**
 * Timeline
 *
 */
export type TimelineCallback = (time: number, progress: number) => void

export interface TimelineConstruct {
  paused?: boolean
  debug?: boolean
  onUpdate?: TimelineCallback
  onComplete?: TimelineCallback
  ticker?: Ticker
}
