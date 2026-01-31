import {
  FormattedProp,
  CallBack,
  InterpolConstruct,
  Props,
  Value,
  CallbackProps,
  InterpolConstructBase,
} from "./types"
import { deferredPromise } from "../utils/deferredPromise"
import { clamp } from "../utils/clamp"
import { round } from "../utils/round"
import { compute } from "../utils/compute"
import { noop } from "../utils/noop"
import { Ease, easeAdapter, EaseFn, EaseName } from "./ease"
import { Ticker } from "./Ticker"
import { InterpolOptions } from "./options"
let ID = 0

export type Interpol<K extends string = string> = {
  readonly _isInterpol: true
  readonly ID: number
  readonly duration: number
  readonly delay: number
  readonly ease: EaseFn
  readonly reverseEase: EaseFn
  readonly time: number
  readonly isReversed: boolean
  readonly isPlaying: boolean
  readonly isPaused: boolean
  readonly props: Record<K, FormattedProp>
  ticker: Ticker
  inTl: boolean
  debugEnable: boolean
  meta: Record<string, any>
  refresh(): void
  refreshComputedValues(): void
  play(from?: number, allowReplay?: boolean): Promise<any>
  reverse(from?: number, allowReplay?: boolean): Promise<any>
  pause(): void
  resume(): void
  stop(): void
  progress(value?: number, suppressEvents?: boolean): number | void
}

export function interpol<K extends string = string>({
  duration = InterpolOptions.duration,
  ease = InterpolOptions.ease,
  reverseEase = ease,
  paused = false,
  delay = 0,
  immediateRender = false,
  beforeStart = noop,
  onStart = noop,
  onUpdate = noop,
  onComplete = noop,
  debug = false,
  meta = {},
  ...inlineProps
}: InterpolConstruct<K>): Interpol<K> {
  const id = ++ID

  let _duration: number
  let _delay: number
  let _ease: EaseFn
  let _reverseEase: EaseFn
  let time = 0
  let lastProgress = 0
  let progress_ = 0
  let isReversed = false
  let isPlaying = false
  let isPaused = paused

  let props: Record<K, FormattedProp>
  const durationVal: Value = duration
  const delayVal: Value = delay
  const easeVal: Value<Ease> = ease
  const reverseEaseVal: Value<Ease> = reverseEase
  const originalProps = inlineProps

  let callbackProps: CallbackProps<K>
  let timeout: ReturnType<typeof setTimeout>
  let onCompleteDeferred = deferredPromise()
  let hasProgressOnStart = false
  let hasProgressCompleted = false

  // --- private helpers ---

  function chooseEase(e: Value<Ease>): EaseFn {
    if (e == null) return (t) => t
    const computedEase = compute(e)
    if (typeof computedEase === "string") {
      return easeAdapter(computedEase as EaseName) as EaseFn
    } else if (typeof (e as (t: number) => number)?.(0) === "number") {
      return e as EaseFn
    } else {
      return computedEase as EaseFn
    }
  }

  function prepareProps<K extends keyof Props>(p: any): Record<K, FormattedProp> {
    return Object.keys(p).reduce(
      (acc, key: K) => {
        let prop = p[key as K]
        acc[key as K] = {
          from: prop?.[0] ?? prop?.["from"] ?? 0,
          _from: null,
          to: prop?.[1] ?? prop?.["to"] ?? prop ?? 0,
          _to: null,
          value: null,
          _computeEaseFn: (globalEase) => {
            const propEase = prop?.["ease"]
            return propEase ? chooseEase(propEase) : globalEase
          },
          _computeReverseEaseFn: (globalEase) => {
            const rev = prop?.["reverseEase"]
            const propEase = prop?.["ease"]
            return rev
              ? chooseEase(rev)
              : propEase
                ? chooseEase(propEase)
                : globalEase
          },
          ease: null,
          reverseEase: null,
        }
        return acc
      },
      {} as Record<K, FormattedProp>,
    )
  }

  function onEachProps(fn: (prop: FormattedProp) => void): void {
    for (const key of Object.keys(props)) fn(props[key])
  }

  function interpolate(prog: number): void {
    onEachProps((prop) => {
      const selectedEase = isReversed && prop.reverseEase ? prop.reverseEase : prop.ease
      prop.value = round(prop._from + (prop._to - prop._from) * selectedEase(prog), 1000)
    })
  }

  function createPropsParamObjRef<K extends keyof Props>(
    p: Record<K, FormattedProp>,
  ): CallbackProps<K> {
    return Object.keys(p).reduce((acc, key: K) => {
      acc[key as K] = p[key]._from
      return acc
    }, {} as any)
  }

  function assignPropsValue<P extends K>(
    propsValue: CallbackProps<K>,
    p: Record<P, FormattedProp>,
  ): CallbackProps<P> {
    for (const key of Object.keys(propsValue)) {
      propsValue[key as P] = p[key].value
    }
    return propsValue
  }

  function log(...rest: any[]): void {
    self.debugEnable && console.log(`%cinterpol`, `color: rgb(53,158,182)`, id || "", ...rest)
  }

  // --- public methods ---

  function refresh(): void {
    props = prepareProps<K>(originalProps)
    _duration = compute(durationVal) * InterpolOptions.durationFactor
    _delay = compute(delayVal) * InterpolOptions.durationFactor
    _ease = chooseEase(easeVal)
    _reverseEase = chooseEase(reverseEaseVal)
    for (const key of Object.keys(props)) {
      const prop = props[key]
      prop._from = compute(prop.from)
      prop._to = compute(prop.to)
      prop.ease = prop._computeEaseFn(_ease)
      prop.reverseEase = prop._computeReverseEaseFn(_reverseEase)
    }
  }

  function refreshComputedValues(): void {
    console.warn(`Interpol.refreshComputedValues() is deprecated. Use Interpol.refresh() instead.`)
    refresh()
  }

  async function play(from: number = 0, allowReplay = true): Promise<any> {
    if (isPlaying && !allowReplay) return
    if (isPlaying && isReversed) {
      isReversed = false
      return
    }
    if (isPlaying) {
      stop()
      return await play(from)
    }

    onEachProps((prop) => (prop.value = prop._to * from))
    time = _duration * from
    progress_ = from
    isReversed = false
    isPlaying = true
    isPaused = false
    const fromStart = progress_ === 0

    callbackProps = fromStart
      ? createPropsParamObjRef<K>(props)
      : assignPropsValue<K>(callbackProps, props)

    timeout = setTimeout(
      () => {
        if (fromStart) onStart(callbackProps, time, progress_, self)
        self.ticker.add(handleTick)
      },
      time > 0 ? 0 : _delay,
    )
    onCompleteDeferred = deferredPromise()
    return onCompleteDeferred.promise
  }

  async function reverse(from: number = 1, allowReplay = true): Promise<any> {
    if (isPlaying && !allowReplay) return
    if (isPlaying && !isReversed) {
      isReversed = true
      onCompleteDeferred = deferredPromise()
      return onCompleteDeferred.promise
    }
    if (isPlaying && isReversed) {
      stop()
      return await reverse(from)
    }

    onEachProps((p) => (p.value = p._to * from))
    time = _duration * from
    progress_ = from
    isReversed = true
    isPlaying = true
    isPaused = false

    self.ticker.add(handleTick)
    onCompleteDeferred = deferredPromise()
    return onCompleteDeferred.promise
  }

  function pause(): void {
    isPaused = true
    isPlaying = false
    if (!self.inTl) {
      self.ticker.remove(handleTick)
    }
  }

  function resume(): void {
    if (!isPaused) return
    isPaused = false
    isPlaying = true
    if (!self.inTl) {
      self.ticker.add(handleTick)
    }
  }

  function stop(): void {
    if (!self.inTl || (self.inTl && isReversed)) {
      onEachProps((prop) => (prop.value = prop._from))
      time = 0
      lastProgress = progress_
      progress_ = 0
    }

    isPlaying = false
    isPaused = false
    clearTimeout(timeout)

    if (!self.inTl) {
      isReversed = false
      self.ticker.remove(handleTick)
    }
  }

  function progressFn(value?: number, suppressEvents = true): number | void {
    if (value === undefined) {
      return progress_
    }
    if (isPlaying) pause()

    lastProgress = progress_
    progress_ = clamp(0, value, 1)

    if (
      (progress_ !== 0 && lastProgress === 0) ||
      (progress_ !== 1 && lastProgress === 1)
    ) {
      refresh()
    }

    time = clamp(0, _duration * progress_, _duration)
    interpolate(progress_)
    callbackProps = assignPropsValue<K>(callbackProps, props)

    if (lastProgress !== progress_ || value === progress_) {
      if (lastProgress !== progress_) {
        hasProgressOnStart = false
        hasProgressCompleted = false
      }
      onUpdate(callbackProps, time, progress_, self)
      log(`progress onUpdate`, {
        props: callbackProps,
        time: time,
        progress: progress_,
      })
    }

    if (
      // prettier-ignore
      (lastProgress === 0 && progress_ > 0) &&
      !hasProgressCompleted &&
      !suppressEvents
    ) {
      callbackProps = createPropsParamObjRef<K>(props)
      onStart(callbackProps, time, progress_, self)
      hasProgressOnStart = true
      log(`progress onStart`, {
        props: callbackProps,
        time: time,
        progress: progress_,
      })
    }

    if (progress_ === 1 && !suppressEvents) {
      const shouldExecute =
        _duration <= 0
          ? lastProgress < 1
          : !hasProgressCompleted

      if (shouldExecute) {
        onComplete(callbackProps, time, progress_, self)
        lastProgress = progress_
        hasProgressCompleted = true
        log(`progress onComplete`, {
          props: callbackProps,
          time: time,
          progress: progress_,
        })
      }
    }

    if (progress_ === 0) {
      lastProgress = progress_
      hasProgressOnStart = false
      hasProgressCompleted = false
    }
  }

  const handleTick = async ({ delta }): Promise<any> => {
    if (_duration <= 0) {
      onEachProps((p) => (p.value = p._to))
      const obj = {
        props: assignPropsValue<K>(callbackProps, props),
        time: _duration,
        progress: 1,
      }
      onUpdate(obj.props, obj.time, obj.progress, self)
      onComplete(obj.props, obj.time, obj.progress, self)
      onCompleteDeferred.resolve()
      stop()
      return
    }

    time = clamp(0, _duration, time + (isReversed ? -delta : delta))
    progress_ = clamp(0, round(time / _duration), 1)
    interpolate(progress_)
    callbackProps = assignPropsValue<K>(callbackProps, props)

    onUpdate(callbackProps, time, progress_, self)
    log("handleTick onUpdate", {
      props: callbackProps,
      t: time,
      p: progress_,
    })

    if (!isReversed && progress_ === 1) {
      log(`handleTick onComplete!`)
      onComplete(callbackProps, time, progress_, self)
      onCompleteDeferred.resolve()
      stop()
    }
    if (isReversed && progress_ === 0) {
      onCompleteDeferred.resolve()
      stop()
    }
  }

  // --- init ---
  refresh()
  callbackProps = createPropsParamObjRef<K>(props)

  // Build self object - mutable properties are directly on the object
  const self: Interpol<K> = {
    _isInterpol: true as const,
    get ID() { return id },
    get duration() { return _duration },
    get delay() { return _delay },
    get ease() { return _ease },
    get reverseEase() { return _reverseEase },
    get time() { return time },
    get isReversed() { return isReversed },
    get isPlaying() { return isPlaying },
    get isPaused() { return isPaused },
    get props() { return props },
    ticker: InterpolOptions.ticker,
    inTl: false,
    debugEnable: debug,
    meta,
    refresh,
    refreshComputedValues,
    play,
    reverse,
    pause,
    resume,
    stop,
    progress: progressFn,
  }

  // Initial callbacks
  beforeStart(callbackProps, time, progress_, self)
  if (immediateRender) {
    onUpdate(callbackProps, time, progress_, self)
  }
  if (!isPaused) play()

  return self
}
