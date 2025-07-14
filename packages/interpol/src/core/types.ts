import { Interpol } from "../Interpol"
import { Ticker } from "./Ticker"
import { Ease } from "./ease"

/**
 * Common
 *
 *
 */
export type El = HTMLElement | HTMLElement[] | Record<any, number> | null

// Value can be a number or a function that return a number
export type Value = number | (() => number)

// Props params
export type PropsValues =
  | Value
  | [Value, Value]
  | Partial<{ from: Value; to: Value; ease: Ease; reverseEase: Ease }>

// props
export type Props<K extends string = string> = Record<K, PropsValues>
export type PropKeys<T extends string> = keyof InterpolConstructBase<T> | (string & {})
export type ExtraProps<T extends string> = Record<
  Exclude<T, keyof InterpolConstructBase<T>>,
  PropsValues
>

// Final Props Object returned by callbacks
export type CallbackProps<K extends string, V = number> = Record<K, V>

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
export type CallBack<K extends string = string> = (
  props: CallbackProps<Exclude<K, keyof InterpolConstructBase<K>>>,
  time: number,
  progress: number,
  instance: Interpol<K>,
) => void

export type InterpolConstructBase<K extends string = string> = {
  duration?: Value
  ease?: Ease
  reverseEase?: Ease
  paused?: boolean
  immediateRender?: boolean
  delay?: number
  debug?: boolean
  beforeStart?: CallBack<K>
  onStart?: CallBack<K>
  onUpdate?: CallBack<K>
  onComplete?: CallBack<K>
}

// @credit Philippe Elsass
export type InterpolConstruct<T extends PropKeys<T>> = InterpolConstructBase<T> & {
  [key in T]: key extends keyof InterpolConstructBase<T>
    ? InterpolConstructBase<T>[key]
    : PropsValues
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
