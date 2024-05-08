import { Interpol } from "../Interpol"
import { Ticker } from "./Ticker"
import { Ease } from "./ease"

/**
 * Common
 *
 *
 */

// Final Props Object returned by callbacks
export type PropsValueObjectRef<K extends string> = Record<K, number | `${number}${Units}` | any>

// Value can be a number or a function that return a number
export type Value = number | (() => number)
export type Units = "%" | "px" | "em" | "rem" | "vw" | "vh" | "pt" | string

// Props params
export type PropsValues =
  | Value
  | [Value, Value, (Units | null | undefined)?]
  | Partial<{ from: Value; to: Value; unit: Units; ease: Ease; reverseEase: Ease }>
export type Props<K = string> = Record<string, PropsValues>

// Props object formatted in Map
export type FormattedProp = {
  from: Value
  to: Value
  _from: number
  _to: number
  value: number
  unit: Units
  ease: Ease
  reverseEase: Ease
}

/**
 * Interpol
 *
 *
 */
export type CallBack<K extends keyof Props> = (
  props: PropsValueObjectRef<K>,
  time: number,
  progress: number,
  instance: Interpol<K>
) => void

export type El = HTMLElement | HTMLElement[] | Record<any, number> | null

export interface InterpolConstruct<K extends keyof Props> {
  props: Props<K>
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
  el?: El
}

/**
 * Timeline
 *
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
