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
import { engine } from "./engine"
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
  #_delay: number
  public get delay() {
    return this.#_delay
  }
  #_ease: EaseFn
  public get ease() {
    return this.#_ease
  }
  #_reverseEase: EaseFn
  public get reverseEase() {
    return this.#_reverseEase
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

  meta: Record<string, any>
  #duration: Value
  #delay: Value
  #callbackProps: CallbackProps<K>
  #immediateRender: boolean
  #ease: Value<Ease>
  #reverseEase: Value<Ease>
  #originalProps: Omit<InterpolConstruct<K>, keyof InterpolConstructBase<K>>
  #beforeStart: CallBack<K>
  #onStart: CallBack<K>
  #onUpdate: CallBack<K>
  #onComplete: CallBack<K>
  #timeout: ReturnType<typeof setTimeout>
  #onCompleteDeferred = deferredPromise()
  #hasProgressOnStart = false
  #hasProgressCompleted = false
  #propKeys: string[] = []
  #propValues: FormattedProp[] = []

  constructor({
    duration = engine.duration,
    ease = engine.ease,
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
  }: InterpolConstruct<K>) {
    this.ticker = engine.ticker
    this.#duration = duration
    this.#isPaused = paused
    this.#delay = delay
    this.#immediateRender = immediateRender
    this.#beforeStart = beforeStart
    this.#onStart = onStart
    this.#onUpdate = onUpdate
    this.#onComplete = onComplete
    this.debugEnable = debug
    this.#ease = ease
    this.#reverseEase = reverseEase
    this.meta = meta

    // Prepare & compute props
    this.#originalProps = inlineProps
    // Compute all values (duration, delay, ease, props values)
    this.refresh()
    // Create callback props object
    this.#callbackProps = this.#createPropsParamObjRef<K>(this.#props)
    // Initial callbacks
    this.#beforeStart(this.#callbackProps, this.#time, this.#progress, this)
    if (this.#immediateRender) {
      this.#onUpdate(this.#callbackProps, this.#time, this.#progress, this)
    }
    if (!this.#isPaused) this.play()
  }

  // Compute if values were functions
  public refresh(): void {
    // re preprare all props
    this.#props = this.#prepareProps<K>(this.#originalProps)
    this.#propKeys = Object.keys(this.#props)
    this.#propValues = this.#propKeys.map((k) => this.#props[k])

    // compute global options
    this.#_duration = compute(this.#duration) * engine.durationFactor
    this.#_delay = compute(this.#delay) * engine.durationFactor
    this.#_ease = this.#chooseEase(this.#ease)
    this.#_reverseEase = this.#chooseEase(this.#reverseEase)

    // compute each internal prop properties
    for (let i = 0; i < this.#propValues.length; i++) {
      const prop = this.#propValues[i]
      // Compute keyframes if present
      if (prop.keyframes) {
        prop._keyframes = prop.keyframes.map((v) => compute(v))
        prop._from = prop._keyframes[0]
        prop._to = prop._keyframes[prop._keyframes.length - 1]
      } else {
        prop._from = compute(prop.from)
        prop._to = compute(prop.to)
      }
      prop.ease = prop._computeEaseFn(this.#_ease)
      prop.reverseEase = prop._computeReverseEaseFn(this.#_reverseEase)
    }
  }

  /**
   * @deprecated use refresh() instead
   */
  public refreshComputedValues(): void {
    console.warn(`Interpol.refreshComputedValues() is deprecated. Use Interpol.refresh() instead.`)
    this.refresh()
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

    this.#interpolate(from)
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
      this.#time > 0 ? 0 : this.#_delay,
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

    this.#interpolate(from)
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
      this.refresh()
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

  #handleTick = ({ delta }): void => {
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
    for (let i = 0; i < this.#propValues.length; i++) fn(this.#propValues[i])
  }

  /**
   * Mute/interpolate each props value
   */
  #interpolate(progress: number): void {
    this.#onEachProps((prop) => {
      const selectedEase = this.#isReversed && prop.reverseEase ? prop.reverseEase : prop.ease
      const t = selectedEase(progress)

      // If keyframes are present, interpolate between keyframes
      // ex: x: [0, 25, 50]
      if (prop._keyframes) {
        // get number of segments
        const segments = prop._keyframes.length - 1
        // scale t to the total number of segments
        const scaled = t * segments
        // get the current segment index
        const idx = Math.min(Math.floor(scaled), segments - 1)
        // interpolate between the two keyframes of the current segment
        const a = prop._keyframes[idx]
        const b = prop._keyframes[idx + 1]
        prop.value = round(a + (b - a) * (scaled - idx), 1000)
      }

      // In other cases, simple from/to interpolation
      // ex: x: [0, 25] | x: { from: 0, to: 25 } | x: 25
      else {
        prop.value = round(prop._from + (prop._to - prop._from) * t, 1000)
      }
    })
  }

  /**
   * Prepare internal props object
   */
  #prepareProps<K extends keyof Props>(props): Record<K, FormattedProp> {
    return Object.keys(props).reduce(
      (acc, key: K) => {
        let p = props[key as K]
        const isKeyframes = Array.isArray(p) && p.length > 2
        acc[key as K] = {
          from: isKeyframes ? p[0] : (p?.[0] ?? p?.["from"] ?? 0),
          _from: null,
          to: isKeyframes ? p[p.length - 1] : (p?.[1] ?? p?.["to"] ?? p ?? 0),
          _to: null,
          keyframes: isKeyframes ? p : undefined,
          _keyframes: undefined,
          value: null,
          // will be exec by refresh and set _ease
          _computeEaseFn: (globalEase) => {
            const propEase = p?.["ease"]
            return propEase ? this.#chooseEase(propEase) : globalEase
          },
          // will be exec by refresh and set _reverseEase
          _computeReverseEaseFn: (globalEase) => {
            const reverseEase = p?.["reverseEase"]
            const propEase = p?.["ease"]
            return reverseEase
              ? this.#chooseEase(reverseEase)
              : propEase
                ? this.#chooseEase(propEase)
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

  /**
   * Create an object with props keys
   * in order to keep the same reference on each frame
   */
  #createPropsParamObjRef<K extends keyof Props>(
    props: Record<K, FormattedProp>,
  ): CallbackProps<K> {
    const acc: any = {}
    for (let i = 0; i < this.#propKeys.length; i++) {
      acc[this.#propKeys[i]] = this.#propValues[i]._from
    }
    return acc as CallbackProps<K>
  }

  /**
   * Assign props value to propsValue object
   * in order to keep the same reference on each frame
   */
  #assignPropsValue<P extends K>(
    propsValue: CallbackProps<K>,
    props: Record<P, FormattedProp>,
  ): CallbackProps<P> {
    for (let i = 0; i < this.#propKeys.length; i++) {
      propsValue[this.#propKeys[i] as P] = this.#propValues[i].value
    }
    return propsValue
  }

  /**
   * Choose ease function
   * Can be a string or a function or a function that returns one of those
   * @param e ease name or function
   * @returns ease function
   */
  #chooseEase(e: Value<Ease>): EaseFn {
    if (e == null) return (t) => t
    // First, compute the value if it's a function that returns Ease
    const computedEase = compute(e)

    // if computed value is a string, return the corresponding ease function
    if (typeof computedEase === "string") {
      return easeAdapter(computedEase as EaseName) as EaseFn
    }
    // if initial "e" param is a function that returns a number (EaseFn)
    // deduce that it's an EaseFn, ex: ease = (t) => t * t
    else if (typeof (e as (t: number) => number)?.(0) === "number") {
      return e as EaseFn
    }
    // else return the computed result ex: () => (t) => t * t transformed as (t) => t * t
    else {
      return computedEase as EaseFn
    }
  }

  /**
   * Log util
   */
  #log(...rest: any[]): void {
    this.debugEnable && console.log(`%cinterpol`, `color: rgb(53,158,182)`, this.ID || "", ...rest)
  }
}
