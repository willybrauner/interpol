export interface IUpdateParams {
  value: number
  time: number
  progress: number
}

export interface IInterpolConstruct {
  from?: number | (() => number)
  to?: number | (() => number)
  duration?: number | (() => number)
  ease?: (t: number) => number
  reverseEase?: (t: number) => number
  paused?: boolean
  delay?: number
  debug?: boolean
  beforeStart?: () => void
  onUpdate?: ({ value, time, progress }: IUpdateParams) => void
  onComplete?: ({ value, time, progress }: IUpdateParams) => void
  onRepeatComplete?: ({ value, time, progress }: IUpdateParams) => void
}
