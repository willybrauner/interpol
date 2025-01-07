import { Interpol } from "../Interpol"
import { Ticker } from "./Ticker"
import { Ease } from "./ease"

/**
 * Common
 *
 *
 */

// Value can be a number or a function that return a number
export type Value = number | (() => number)

// Props params
export type PropsValues =
  | Value
  | [Value, Value]
  | Partial<{ from: Value; to: Value; ease: Ease; reverseEase: Ease }>

export type Props<K extends string = string> = Record<K, PropsValues>

// Final Props Object returned by callbacks
export type PropsValueObjectRef<K extends string, V = number> = Record<K, V>

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

/**
 * Interpol
 *
 *
 */
export type CallBack<K extends keyof Props> = (
  props: PropsValueObjectRef<Exclude<K, keyof InterpolConstructBase<K>>>,
  time: number,
  progress: number,
  instance: Interpol<K>,
) => void

export type El = HTMLElement | HTMLElement[] | Record<any, number> | null

export type InterpolConstructBase<K extends keyof Props> = {
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
}

export type InterpolConstruct<K extends keyof Props> = InterpolConstructBase<K> & {
  [P in K]: PropsValues | any // TODO better typing
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
