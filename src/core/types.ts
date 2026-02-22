import { Interpol } from "./Interpol"
import { Ticker } from "./Ticker"
import { Ease, EaseFn } from "./ease"

/**
 * Common
 *
 *
 */
export type El = HTMLElement | HTMLElement[] | Record<any, number> | null

// Value can be a type T or a function that return a type T
export type Value<T = number> = T | (() => T)

// Props params
export type PropsValues =
  | Value
  | Value[]
  | Partial<{ from: Value; to: Value; ease: Value<Ease>; reverseEase: Value<Ease> }>

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
  ease: EaseFn
  reverseEase: EaseFn
  _computeEaseFn: (defaultEase: EaseFn) => EaseFn
  _computeReverseEaseFn: (defaultEase: EaseFn) => EaseFn
  keyframes?: Value[]
  _keyframes?: number[]
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
  ease?: Value<Ease>
  reverseEase?: Value<Ease>
  paused?: boolean
  immediateRender?: boolean
  delay?: Value
  debug?: boolean
  onStart?: CallBack<K>
  onUpdate?: CallBack<K>
  onComplete?: CallBack<K>
  meta?: Record<string, any>
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
