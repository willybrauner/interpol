import { Ticker } from "./Ticker"

export type Value = number | (() => number)

// Props params
export type Props = Record<string, [Value, Value]>

// Props object formatted in Map
export type FormattedProp = {
  from: Value
  _from: number
  to: Value
  _to: number
  value: number
}
export type FormattedProps = Record<string, FormattedProp>


// CB params
export interface IUpdateParams<K extends keyof Props> {
  props: Record<K, [number, number]>
  time: number
  progress: number
}

export interface IInterpolConstruct {
  props?: Props
  duration?: number | (() => number)
  ease?: (t: number) => number
  reverseEase?: (t: number) => number
  paused?: boolean
  delay?: number
  debug?: boolean
  beforeStart?: () => void
  onUpdate?: ({ props, time, progress }: IUpdateParams<keyof Props>) => void
  onComplete?: ({ props, time, progress }: IUpdateParams<keyof Props>) => void
  ticker?: Ticker
}
