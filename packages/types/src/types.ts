export interface TickerUpdateParams {
  value: number
  time: number
  progress: number
}

export interface InterpolConstruct<T = any> {
  from?: number | (() => number)
  to?: number | (() => number)
  duration?: number | (() => number)
  ease?: (t: number) => number
  reverseEase?: (t: number) => number
  paused?: boolean
  delay?: number
  debug?: boolean
  beforeStart?: () => void
  onUpdate?: ({ value, time, progress }: TickerUpdateParams) => void
  onComplete?: ({ value, time, progress }: TickerUpdateParams) => void
  onRepeatComplete?: ({ value, time, progress }: TickerUpdateParams) => void
  ticker?: T
}
