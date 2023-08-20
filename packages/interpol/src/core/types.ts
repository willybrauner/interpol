import { Ticker } from "./Ticker"
import { EaseName } from "./ease"
import { b } from "vitest/dist/types-b7007192"

/**
 * Common
 *
 *
 */

// Value can be a number or a function that return a number
export type Value = number | (() => number)

// Props params
export type Props = Record<string, [Value, Value]>

// Props object formatted in Map
export type FormattedProp = {
  from: Value
  to: Value
  _from: number
  _to: number
  value: number
}

/**
 * Interpol
 *
 *
 */

export type CallBack<K extends keyof Props> = (
  props: Record<K, number>,
  time: number,
  progress: number
) => void

export interface InterpolConstruct<K extends keyof Props> {
  props: Record<K, [Value, Value]>
  duration?: number | (() => number)
  ease?: EaseName | ((t: number) => number)
  reverseEase?: EaseName | ((t: number) => number)
  paused?: boolean
  initUpdate?: boolean
  delay?: number
  debug?: boolean
  beforeStart?: CallBack<K>
  onUpdate?: CallBack<K>
  onComplete?: CallBack<K>
  ticker?: Ticker
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
