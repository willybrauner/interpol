import { Interpol } from "../Interpol"
import { Ticker } from "./Ticker"
import { Ease } from "./ease"

/**
 * Common
 *
 *
 */
// https://www.typescriptlang.org/play/?#code/FAUwHgDg9gTgLgAjgTwiBAFGUIGcBqAhgDYCuIuCAvAgNoB2pAtgEYgwA0Cjr7AuqEixEKNJmx4APAGkE4OCHoATSrjgwAlvQDm1BGs06AfHoBKIAMawlMrlhwES5XEeDBR6AMJR6AMw3a0iDIlDQA5EqkMIRwGj5hCAA+CGE+AKoQSjEgYW7g0PBIqF4kxCyEFgDWMnJgCsqUlcFQvuIOJjQAFBASuABcCG1SAKJgFmRKILYI3n4BQSFGRgCU1CYAblAaSm4eCACS9Aow0MSzBqQWcDXyiioITcgtQy56AN7Ag4OR0bE+Azw2DBPl90plsgNPKVylUZK5BgBfBAAMgQHy+dAwCC0CGkfAG9jwRDIFCS3GYQLJUOIZQq1Wk8IQCLc40IuEoh2OpxudTujWarUJr3RCAAxD8YnF6ACKewQaKwVkFAB+SHQulw+U9Bwgqz0C5XWCdN4Sv70LiK7JcAB0tu1eARA057FO53Ul2uDNWIsGcAAFhpcNbxVFJT49KapQBuEG+gNB0X20IIJOxpDx4OWhR6LMgEHM5nAeggADuByOLqgxGNIMj-wQAEYOCCwANaAAGLgNvjNwbINudxvt9s9kEALwHXAAnKPBrmBsaEGAuMguCwmasqCYPvngAjlkA

// Value can be a number or a function that return a number
export type Value = number | (() => number)

// Props params
export type PropsValues = [Value, Value]
export type Props<K extends string = string> = Record<K, PropsValues>

// Final Props Object returned by callbacks
export type PropsValueObjectRef<K extends string> = Record<K, number>

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
  [P in K]: PropsValues | any
}

// } & {
//   [P in K]: PropsValues | boolean | Function | undefined | Ease | CallBack<K> | Props<K>
// }

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
