import {
  FormattedProp,
  CallBack,
  InterpolConstruct,
  Props,
  Value,
  PropsValueObjectRef,
} from "./core/types"
import { Ticker } from "./core/Ticker"
import { deferredPromise } from "./core/deferredPromise"
import { clamp } from "./core/clamp"
import { round } from "./core/round"
import { compute } from "./core/compute"
import { noop } from "./core/noop"
import { easeAdapter, EaseFn, EaseName } from "./core/ease"
import { styles } from "./core/styles"

let ID = 0

export class Interpol<K extends keyof Props = keyof Props> {
  public readonly ID = ++ID
  public ticker: Ticker
  public inTl = false
  public debugEnable: boolean

  #duration: Value
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
  public get progress() {
    return this.#progress
  }
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

  #propsValueRef: PropsValueObjectRef<K>
  #initUpdate: boolean
  #delay: number
  #ease: EaseFn
  #revEase: EaseFn
  #beforeStart: CallBack<K>
  #onUpdate: CallBack<K>
  #onComplete: CallBack<K>
  #timeout: ReturnType<typeof setTimeout>
  #onCompleteDeferred = deferredPromise()
  #el: HTMLElement | HTMLElement[] | null

  constructor({
    props = null,
    duration = 1000,
    ease = "linear",
    reverseEase = ease,
    paused = false,
    delay = 0,
    initUpdate = false,
    beforeStart = noop,
    onUpdate = noop,
    onComplete = noop,
    debug = false,
    ticker = new Ticker(),
    el = null,
  }: InterpolConstruct<K>) {
    this.#duration = duration
    this.#isPaused = paused
    this.#delay = delay
    this.#initUpdate = initUpdate
    this.#beforeStart = beforeStart
    this.#el = el
    this.#onUpdate = (props, time, progress) => {
      styles(this.#el, props)
      onUpdate(props, time, progress)
    }
    this.#onComplete = (props, time, progress) => {
      styles(this.#el, props)
      onComplete(props, time, progress)
    }
    this.debugEnable = debug
    this.ticker = ticker
    this.#ease = this.#chooseEase(ease)
    this.#revEase = this.#chooseEase(reverseEase)

    // Prepare & compute props
    this.#props = this.#prepareProps<K>(props)
    this.#props = this.refreshComputedValues()
    this.#propsValueRef = this.#createPropsParamObjRef<K>(this.#props)

    // start
    if (this.#initUpdate) this.#onUpdate(this.#propsValueRef, this.#time, this.#progress)
    this.#beforeStart(this.#propsValueRef, this.#time, this.#progress)

    if (!this.#isPaused) this.play()
  }

  // Compute if values were functions
  public refreshComputedValues(): Record<string, FormattedProp> {
    this.#_duration = compute(this.#duration)
    this.#onEachProps((prop) => {
      prop._from = compute(prop.from)
      prop._to = compute(prop.to)
    })
    return this.#props
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

    // Delay is set only on first play
    // If this play is trigger before onComplete, we don't wait again
    // start ticker only if is single Interpol, not TL
    this.#timeout = setTimeout(
      () => {
        if (!this.inTl) this.ticker.play()
        this.ticker.onTick.on(this.#handleTick)
      },
      this.#time > 0 ? 0 : this.#delay
    )
    this.#onCompleteDeferred = deferredPromise()
    return this.#onCompleteDeferred.promise
  }

  public async reverse(from: number = 1, allowReplay = true): Promise<any> {
    if (this.#isPlaying && !allowReplay) return
    // If is playing normal direction, change to reverse and return
    if (this.#isPlaying && !this.#isReversed) {
      this.#isReversed = true
      return
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
    if (!this.inTl) this.ticker.play()
    this.ticker.onTick.on(this.#handleTick)
    // create new onComplete deferred Promise and return it
    this.#onCompleteDeferred = deferredPromise()
    return this.#onCompleteDeferred.promise
  }

  public pause(): void {
    this.#isPaused = true
    this.#isPlaying = false
    this.#lastProgress = 0
    if (!this.inTl) {
      this.ticker.onTick.off(this.#handleTick)
      this.ticker.pause()
    }
  }

  public resume(): void {
    if (!this.#isPaused) return
    this.#isPaused = false
    this.#isPlaying = true
    if (!this.inTl) {
      this.ticker.onTick.on(this.#handleTick)
      this.ticker.play()
    }
  }

  public stop(): void {
    if (!this.inTl || (this.inTl && this.#isReversed)) {
      this.#onEachProps((prop) => (prop.value = prop._from))
      this.#time = 0
      this.#progress = 0
    }

    this.#isPlaying = false
    this.#isPaused = false
    this.#lastProgress = 0
    clearTimeout(this.#timeout)

    if (!this.inTl) {
      this.#isReversed = false
      this.ticker.onTick.off(this.#handleTick)
      this.ticker.stop()
    }
  }

  /**
   * Seek to a specific progress (between 0 and 1)
   */
  public seek(progress: number): void {
    if (this.#isPlaying) this.pause()
    // keep previous progress before update it
    this.#lastProgress = this.#progress
    this.#progress = clamp(0, progress, 1)
    this.#time = clamp(0, this.#_duration * this.#progress, this.#_duration)
    this.#interpolate(this.#progress)
    this.#propsValueRef = this.#assignPropsValue<K>(this.#propsValueRef, this.#props)

    // Always call onUpdate
    if (this.#lastProgress !== this.#progress) {
      this.#onUpdate(this.#propsValueRef, this.#time, this.#progress)
      this.#log("seek onUpdate", {
        props: this.#propsValueRef,
        time: this.#time,
        progress: this.#progress,
      })
    }

    // if progress 1, execute onComplete
    if (this.#progress === 1) {
      this.#log("seek onComplete")
      this.#onComplete(this.#propsValueRef, this.#time, this.#progress)
      this.#lastProgress = this.#progress
    }

    // if progress 0, reset completed flag
    if (this.#progress === 0) {
      this.#lastProgress = this.#progress
    }
  }

  #handleTick = async ({ delta }): Promise<any> => {
    // Specific case if duration is 0, execute onComplete and return
    if (this.#_duration <= 0) {
      this.#onEachProps((p) => (p.value = p._to))
      const obj = {
        props: this.#assignPropsValue<K>(this.#propsValueRef, this.#props),
        time: this.#_duration,
        progress: 1,
      }
      this.#onUpdate(obj.props, obj.time, obj.progress)
      this.#onComplete(obj.props, obj.time, obj.progress)
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
    this.#propsValueRef = this.#assignPropsValue<K>(this.#propsValueRef, this.#props)

    // Pass value, time and progress
    this.#onUpdate(this.#propsValueRef, this.#time, this.#progress)
    this.#log("handleTickerUpdate onUpdate", {
      props: this.#propsValueRef,
      t: this.#time,
      p: this.#progress,
    })

    // on complete
    if ((!this.#isReversed && this.#progress === 1) || (this.#isReversed && this.#progress === 0)) {
      this.#log(`handleTickerUpdate onComplete!`)
      this.#onComplete(this.#propsValueRef, this.#time, this.#progress)
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
    const ease = this.#isReversed && this.#revEase ? this.#revEase(progress) : this.#ease(progress)
    this.#onEachProps(
      (prop) => (prop.value = round(prop._from + (prop._to - prop._from) * (ease as number), 1000))
    )
  }

  /**
   * Prepare internal props object
   */
  #prepareProps<K extends keyof Props>(props: Props): Record<K, FormattedProp> {
    return Object.keys(props).reduce((acc, key: K) => {
      const p = props[key as K]
      acc[key as K] = {
        from: p[0],
        _from: null,
        to: p[1],
        _to: null,
        value: null,
        unit: p?.[2] || null,
      }
      return acc
    }, {} as Record<K, FormattedProp>)
  }

  /**
   * Create an object with props keys
   * in order to keep the same reference on each frame
   */
  #createPropsParamObjRef<K extends keyof Props>(
    props: Record<K, FormattedProp>
  ): PropsValueObjectRef<K> {
    return Object.keys(props).reduce((acc, key: K) => {
      acc[key as K] = props[key]._from + props[key].unit
      return acc
    }, {} as any)
  }

  /**
   * Assign props value to propsValue object
   * in order to keep the same reference on each frame
   */
  #assignPropsValue<P extends K>(
    propsValue: PropsValueObjectRef<K>,
    props: Record<P, FormattedProp>
  ): PropsValueObjectRef<P> {
    for (const key of Object.keys(propsValue)) {
      propsValue[key as P] = props[key].value + props[key].unit
    }
    return this.#propsValueRef
  }

  /**
   * Choose ease function
   * Can be a string or a function
   * @param e ease name or function
   * @returns ease function
   */
  #chooseEase(e): EaseFn {
    return typeof e === "string" ? easeAdapter(e as EaseName) : (e as EaseFn)
  }

  /**
   * Log util
   */
  #log(...rest: any[]): void {
    this.debugEnable &&
    console.log(`%cinterpol`, `color: rgb(53,158,182)`, this.ID || "", ...rest)
  }
}
