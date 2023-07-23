import { Ticker } from "./Ticker"
import { EaseName } from "./ease"

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
// List of props formatted
export type FormattedProps<K extends keyof Props = string> = Record<K, FormattedProp>

// Props value pass by param to handlers
export type ParamPropsValue<K extends keyof Props = string> = Record<K, number>

// cb params
export interface IUpdateParams<K extends keyof Props> {
  props?: ParamPropsValue<K>
  time?: number
  progress?: number
}

export interface IInterpolConstruct<K extends keyof Props> {
  props: Record<K, [Value, Value]>
  duration?: number | (() => number)
  ease?: EaseName | ((t: number) => number)
  reverseEase?: EaseName | ((t: number) => number)
  paused?: boolean
  delay?: number
  debug?: boolean
  beforeStart?: () => void
  onUpdate?: (params: IUpdateParams<K>) => void
  onComplete?: (params: IUpdateParams<K>) => void
  ticker?: Ticker
}
