import {
  FormattedProp,
  CallBack,
  InterpolConstruct,
  Props,
  Value,
  CallbackProps,
  InterpolConstructBase,
} from "./core/types"
import { deferredPromise } from "./core/deferredPromise"
import { clamp } from "./core/clamp"
import { round } from "./core/round"
import { compute } from "./core/compute"
import { noop } from "./core/noop"
import { Ease, easeAdapter, EaseFn, EaseName } from "./core/ease"
import { InterpolOptions } from "./options"
import { Ticker } from "./core/Ticker"

let ID = 0

export class Interpol<K extends string = string> {
  public readonly ID = ++ID
  public ticker: Ticker
  public inTl = false
  public debugEnable: boolean

  #_duration: number
  public get duration() {
    return this.#_duration
  }
  #time = 0
  public get time() {
    return this.#time
  }
  #lastProgress = 0
  #progress = 0
  #isReversed = false
  public get isReversed() {
    return this.#isReversed
  }
  #isPlaying = false
  public get isPlaying() {
    return this.#isPlaying
  }
  #isPaused = false
  public get isPaused() {
    return this.#isPaused
  }
  #props: Record<K, FormattedProp>
  public get props() {
    return this.#props
  }

  #duration: Value
  #callbackProps: CallbackProps<K>
  #immediateRender: boolean
  #delay: number
  #ease: Ease
  #reverseEase: Ease
  #beforeStart: CallBack<K>
  #onStart: CallBack<K>
  #onUpdate: CallBack<K>
  #onComplete: CallBack<K>
  #timeout: ReturnType<typeof setTimeout>
  #onCompleteDeferred = deferredPromise()
  #hasProgressOnStart = false
  #hasProgressCompleted = false

  constructor({
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
    ...inlineProps
  }: InterpolConstruct<K>) {
    this.ticker = InterpolOptions.ticker
    this.#duration = duration
    this.#isPaused = paused
    this.#delay = delay * InterpolOptions.durationFactor
    this.#immediateRender = immediateRender
    this.#beforeStart = beforeStart
    this.#onStart = onStart
    this.#onUpdate = onUpdate
    this.#onComplete = onComplete
    this.debugEnable = debug
    this.#ease = ease
    this.#reverseEase = reverseEase

    // Prepare & compute props
    this.#props = this.#prepareProps<K>(
      inlineProps as Omit<InterpolConstruct<K>, keyof InterpolConstructBase<K>>,
    )
    this.refreshComputedValues()
    this.#callbackProps = this.#createPropsParamObjRef<K>(this.#props)

    this.#beforeStart(this.#callbackProps, this.#time, this.#progress, this)

    if (this.#immediateRender) {
      this.#onUpdate(this.#callbackProps, this.#time, this.#progress, this)
    }

    if (!this.#isPaused) this.play()
  }

  // Compute if values were functions
  public refreshComputedValues(): void {
    this.#_duration = compute(this.#duration) * InterpolOptions.durationFactor
    this.#onEachProps((prop) => {
      prop._from = compute(prop.from)
      prop._to = compute(prop.to)
    })
  }

  public async play(from: number = 0, allowReplay = true): Promise<any> {
    if (this.#isPlaying && !allowReplay) return
    if (this.#isPlaying && this.#isReversed) {
      this.#isReversed = false
      return
    }
    if (this.#isPlaying) {
      this.stop()
      return await this.play(from)
    }

    this.#onEachProps((prop) => (prop.value = prop._to * from))
    this.#time = this.#_duration * from
    this.#progress = from
    this.#isReversed = false
    this.#isPlaying = true
    this.#isPaused = false
    const fromStart = this.#progress === 0

    // before onStart, check if we start from 0 or not
    // on the first case, force reset callbackProps
    // else, assign the value to callbackProps
    this.#callbackProps = fromStart
      ? this.#createPropsParamObjRef<K>(this.#props)
      : this.#assignPropsValue<K>(this.#callbackProps, this.#props)

    // Delay is set only on first play
    // If this play is trigger before onComplete, we don't wait again
    // start ticker only if is single Interpol, not TL
    this.#timeout = setTimeout(
      () => {
        if (fromStart) this.#onStart(this.#callbackProps, this.#time, this.#progress, this)
        this.ticker.add(this.#handleTick)
      },
      this.#time > 0 ? 0 : this.#delay,
    )
    this.#onCompleteDeferred = deferredPromise()
    return this.#onCompleteDeferred.promise
  }

  public async reverse(from: number = 1, allowReplay = true): Promise<any> {
    if (this.#isPlaying && !allowReplay) return
    // If is playing normal direction, change to reverse and return a new promise
    if (this.#isPlaying && !this.#isReversed) {
      this.#isReversed = true
      this.#onCompleteDeferred = deferredPromise()
      return this.#onCompleteDeferred.promise
    }
    // If is playing reverse, restart reverse
    if (this.#isPlaying && this.#isReversed) {
      this.stop()
      return await this.reverse(from)
    }

    this.#onEachProps((p) => (p.value = p._to * from))
    this.#time = this.#_duration * from
    this.#progress = from
    this.#isReversed = true
    this.#isPlaying = true
    this.#isPaused = false

    // start ticker only if is single Interpol, not TL
    this.ticker.add(this.#handleTick)
    // create new onComplete deferred Promise and return it
    this.#onCompleteDeferred = deferredPromise()
    return this.#onCompleteDeferred.promise
  }

  public pause(): void {
    this.#isPaused = true
    this.#isPlaying = false
    if (!this.inTl) {
      this.ticker.remove(this.#handleTick)
    }
  }

  public resume(): void {
    if (!this.#isPaused) return
    this.#isPaused = false
    this.#isPlaying = true
    if (!this.inTl) {
      this.ticker.add(this.#handleTick)
    }
  }

  public stop(): void {
    if (!this.inTl || (this.inTl && this.#isReversed)) {
      this.#onEachProps((prop) => (prop.value = prop._from))
      this.#time = 0
      this.#lastProgress = this.#progress
      this.#progress = 0
    }

    this.#isPlaying = false
    this.#isPaused = false
    clearTimeout(this.#timeout)

    if (!this.inTl) {
      this.#isReversed = false
      this.ticker.remove(this.#handleTick)
    }
  }

  /**
   * Set progress to a specific value (between 0 and 1)
   */
  public progress(value?: number, suppressEvents = true): number | void {
    if (value === undefined) {
      return this.#progress
    }
    if (this.#isPlaying) this.pause()

    // keep previous progress before update it
    this.#lastProgress = this.#progress
    this.#progress = clamp(0, value, 1)

    // if this is the first progress in range (between 0 & 1), refresh computed values
    if (
      (this.#progress !== 0 && this.#lastProgress === 0) ||
      (this.#progress !== 1 && this.#lastProgress === 1)
    ) {
      this.refreshComputedValues()
    }

    // Update time, interpolate and assign props value
    this.#time = clamp(0, this.#_duration * this.#progress, this.#_duration)
    this.#interpolate(this.#progress)
    this.#callbackProps = this.#assignPropsValue<K>(this.#callbackProps, this.#props)

    // if last & current progress are differents,
    // Or if progress param is the same this.progress, execute onUpdate
    if (this.#lastProgress !== this.#progress || value === this.#progress) {
      if (this.#lastProgress !== this.#progress) {
        this.#hasProgressOnStart = false
        this.#hasProgressCompleted = false
      }
      this.#onUpdate(this.#callbackProps, this.#time, this.#progress, this)
      this.#log(`progress onUpdate`, {
        props: this.#callbackProps,
        time: this.#time,
        progress: this.#progress,
      })
    }

    // onStart
    // - if we go from 0 to 1 and never play
    // - if it hasn't been called before
    // need to reset callbackProps
    if (
      // prettier-ignore
      (this.#lastProgress === 0 && this.#progress > 0) && 
      !this.#hasProgressCompleted && 
      !suppressEvents
    ) {
      this.#callbackProps = this.#createPropsParamObjRef<K>(this.#props)
      this.#onStart(this.#callbackProps, this.#time, this.#progress, this)
      this.#hasProgressOnStart = true
      this.#log(`progress onStart`, {
        props: this.#callbackProps,
        time: this.#time,
        progress: this.#progress,
      })
    }

    // onComplete
    // if progress 1, execute onComplete only if it hasn't been called before
    // Special case for duration 0: execute onComplete every time progress goes from < 1 to 1
    if (this.#progress === 1 && !suppressEvents) {
      const shouldExecute =
        this.#_duration <= 0
          ? // For duration 0, execute when transitioning from < 1 to 1
            this.#lastProgress < 1
          : // For normal duration, execute only once
            !this.#hasProgressCompleted

      if (shouldExecute) {
        this.#onComplete(this.#callbackProps, this.#time, this.#progress, this)
        this.#lastProgress = this.#progress
        this.#hasProgressCompleted = true
        this.#log(`progress onComplete`, {
          props: this.#callbackProps,
          time: this.#time,
          progress: this.#progress,
        })
      }
    }

    // if progress 0, reset completed flag and allow onComplete to be called again
    if (this.#progress === 0) {
      this.#lastProgress = this.#progress
      this.#hasProgressOnStart = false
      this.#hasProgressCompleted = false
    }
  }

  #handleTick = async ({ delta }): Promise<any> => {
    // Specific case if duration is 0, execute onComplete and return
    if (this.#_duration <= 0) {
      this.#onEachProps((p) => (p.value = p._to))
      const obj = {
        props: this.#assignPropsValue<K>(this.#callbackProps, this.#props),
        time: this.#_duration,
        progress: 1,
      }
      this.#onUpdate(obj.props, obj.time, obj.progress, this)
      this.#onComplete(obj.props, obj.time, obj.progress, this)
      this.#onCompleteDeferred.resolve()
      this.stop()
      return
    }

    // calc time (time spend from the start)
    // calc progress (between 0 and 1)
    // calc value (between "from" and "to")
    this.#time = clamp(0, this.#_duration, this.#time + (this.#isReversed ? -delta : delta))
    this.#progress = clamp(0, round(this.#time / this.#_duration), 1)
    this.#interpolate(this.#progress)
    this.#callbackProps = this.#assignPropsValue<K>(this.#callbackProps, this.#props)

    // Pass value, time and progress
    this.#onUpdate(this.#callbackProps, this.#time, this.#progress, this)
    this.#log("handleTick onUpdate", {
      props: this.#callbackProps,
      t: this.#time,
      p: this.#progress,
    })

    // on play complete
    if (!this.#isReversed && this.#progress === 1) {
      this.#log(`handleTick onComplete!`)
      this.#onComplete(this.#callbackProps, this.#time, this.#progress, this)
      this.#onCompleteDeferred.resolve()
      this.stop()
    }
    // on reverse complete
    if (this.#isReversed && this.#progress === 0) {
      this.#onCompleteDeferred.resolve()
      this.stop()
    }
  }

  /**
   * Utility function to execute a callback on each props
   */
  #onEachProps(fn: (prop: FormattedProp) => void): void {
    for (const key of Object.keys(this.#props)) fn(this.#props[key])
  }

  /**
   * Mute each props value key
   */
  #interpolate(progress): void {
    // select ease
    const selectEase = (prop) =>
      this.#isReversed && prop.reverseEase ? prop.reverseEase : prop.ease
    // update prop.value
    this.#onEachProps(
      (prop) =>
        (prop.value = round(
          prop._from + (prop._to - prop._from) * selectEase(prop)(progress),
          1000,
        )),
    )
  }

  /**
   * Prepare internal props object
   */
  #prepareProps<K extends keyof Props>(props): Record<K, FormattedProp> {
    return Object.keys(props).reduce(
      (acc, key: K) => {
        let p = props[key as K]
        acc[key as K] = {
          from: p?.[0] ?? p?.["from"] ?? 0,
          _from: null,
          to: p?.[1] ?? p?.["to"] ?? p ?? 0,
          _to: null,
          value: null,
          ease: this.#chooseEase(p?.["ease"] || this.#ease),
          reverseEase: this.#chooseEase(p?.["reverseEase"] || p?.["ease"] || this.#reverseEase),
        }
        return acc
      },
      {} as Record<K, FormattedProp>,
    )
  }

  /**
   * Create an object with props keys
   * in order to keep the same reference on each frame
   */
  #createPropsParamObjRef<K extends keyof Props>(
    props: Record<K, FormattedProp>,
  ): CallbackProps<K> {
    return Object.keys(props).reduce((acc, key: K) => {
      acc[key as K] = props[key]._from
      return acc
    }, {} as any)
  }

  /**
   * Assign props value to propsValue object
   * in order to keep the same reference on each frame
   */
  #assignPropsValue<P extends K>(
    propsValue: CallbackProps<K>,
    props: Record<P, FormattedProp>,
  ): CallbackProps<P> {
    for (const key of Object.keys(propsValue)) {
      propsValue[key as P] = props[key].value
    }
    return propsValue
  }

  /**
   * Choose ease function
   * Can be a string or a function
   * @param e ease name or function
   * @returns ease function
   */
  #chooseEase(e: Ease): EaseFn {
    return e != null ? (typeof e === "string" ? easeAdapter(e as EaseName) : (e as EaseFn)) : null
  }

  /**
   * Log util
   */
  #log(...rest: any[]): void {
    this.debugEnable && console.log(`%cinterpol`, `color: rgb(53,158,182)`, this.ID || "", ...rest)
  }
}
