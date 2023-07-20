import {
  FormattedProp,
  FormattedProps,
  IInterpolConstruct,
  Props,
  ParamPropsValue,
} from "./core/types"
import debug from "@wbe/debug"
import { Ticker } from "./core/Ticker"
import { deferredPromise } from "./core/deferredPromise"
import { clamp } from "./core/clamp"
import { round } from "./core/round"
import { compute } from "./core/compute"
const log = debug("interpol:Interpol")
let ID = 0

export class Interpol<K extends keyof Props = keyof Props> {
  public props: FormattedProps<K>
  public duration: number | (() => number)
  public _duration: number
  public ease: (t: number) => number
  public reverseEase: (t: number) => number
  public paused: boolean
  public delay: number
  public beforeStart: () => void
  public onUpdate: (e) => void
  public onComplete: (e) => void
  public ticker: Ticker
  public progress = 0
  public time = 0
  public debugEnable: boolean
  public readonly id = ++ID
  protected timeout: ReturnType<typeof setTimeout>
  protected onCompleteDeferred = deferredPromise()
  protected _isReversed = false
  public inTl = false
  public get isReversed() {
    return this._isReversed
  }
  protected _isPlaying = false
  public get isPlaying() {
    return this._isPlaying
  }
  protected _isPaused = false
  public get isPaused() {
    return this._isPaused
  }

  public propsValue: ParamPropsValue<K>

  constructor({
    props,
    duration = 1000,
    ease = (t) => t,
    reverseEase,
    paused = false,
    delay = 0,
    beforeStart,
    onUpdate,
    onComplete,
    debug = false,
    ticker = new Ticker(),
  }: IInterpolConstruct<K>) {
    this.props = this.prepareProps<K>(props)
    this.propsValue = this.createPropsParamObj<K>(this.props)
    this.duration = duration
    this.paused = paused
    this.ease = ease
    this.reverseEase = reverseEase
    this.delay = delay
    this.beforeStart = beforeStart
    this.onUpdate = onUpdate
    this.onComplete = onComplete
    this.debugEnable = debug
    this.ticker = ticker
    this.refreshComputedValues()

    // start!
    this.beforeStart?.()
    if (!this.paused) this.play()
  }

  // Compute if values were functions
  public refreshComputedValues(): void {
    this._duration = compute(this.duration)
    this.onEachProps((prop) => {
      prop._from = compute(prop.from)
      prop._to = compute(prop.to)
    })
  }

  public async play(from: number = 0, allowReplay = true): Promise<any> {
    if (this._isPlaying && !allowReplay) return
    if (this._isPlaying && this._isReversed) {
      this._isReversed = false
      return
    }
    if (this._isPlaying) {
      this.stop()
      return await this.play(from)
    }

    this.onEachProps((prop) => (prop.value = prop._to * from))
    this.time = this._duration * from
    this.progress = from

    this._isReversed = false
    this._isPlaying = true
    this._isPaused = false

    // Delay is set only on first play
    // If this play is trigger before onComplete, we don't wait again
    // start ticker only if is single Interpol, not TL
    this.timeout = setTimeout(
      () => {
        if (!this.inTl) this.ticker.play()
        this.ticker.onUpdateEmitter.on(this.handleTickerUpdate)
      },
      this.time > 0 ? 0 : this.delay
    )
    this.onCompleteDeferred = deferredPromise()
    return this.onCompleteDeferred.promise
  }

  public async reverse(from: number = 1, allowReplay = true): Promise<any> {
    if (this._isPlaying && !allowReplay) return

    // If is playing normal direction, change to reverse and return
    if (this._isPlaying && !this._isReversed) {
      this._isReversed = true
      return
    }

    // If is playing reverse, restart reverse
    if (this._isPlaying && this._isReversed) {
      this.stop()
      return await this.reverse(from)
    }

    this.onEachProps((prop) => (prop.value = prop._to * from))
    this.time = this._duration * from
    this.progress = from
    this._isReversed = true
    this._isPlaying = true
    this._isPaused = false

    // start ticker only if is single Interpol, not TL
    if (!this.inTl) this.ticker.play()
    this.ticker.onUpdateEmitter.on(this.handleTickerUpdate)
    // create new onComplete deferred Promise and return it
    this.onCompleteDeferred = deferredPromise()
    return this.onCompleteDeferred.promise
  }

  public pause(): void {
    this._isPaused = true
    this._isPlaying = false
    this.ticker.onUpdateEmitter.off(this.handleTickerUpdate)
    if (!this.inTl) this.ticker.pause()
  }

  public resume(): void {
    if (!this._isPaused) return
    this._isPaused = false
    this._isPlaying = true
    this.ticker.onUpdateEmitter.on(this.handleTickerUpdate)
    if (!this.inTl) this.ticker.play()
  }

  public stop(): void {
    if (!this.inTl || (this.inTl && this._isReversed)) {
      this.onEachProps((prop) => (prop.value = prop._from))
      this.time = 0
      this.progress = 0
    }
    if (!this.inTl) {
      this._isReversed = false
    }
    this._isPlaying = false
    this._isPaused = false
    clearTimeout(this.timeout)
    this.ticker.onUpdateEmitter.off(this.handleTickerUpdate)
    if (!this.inTl) this.ticker.stop()
  }

  /**
   * Seek to a specific progress (between 0 and 1)
   */
  #completed = false
  public seek(progress: number): void {
    const prevP = this.progress
    this.progress = clamp(0, progress, 1)
    this.time = clamp(0, this._duration * this.progress, this._duration)
    this.interpolate(this.progress)
    // get props value only
    this.propsValue = this.assignPropsValue<K>(this.propsValue, this.props)

    if (prevP !== this.progress) {
      this.onUpdate?.({ props: this.propsValue, time: this.time, progress: this.progress })
      this.log("seek onUpdate", { v: this.propsValue, t: this.time, p: this.progress })
    }

    if (this.progress === 1) {
      if (!this.#completed) {
        this.log("seek onComplete")
        this.onComplete?.({ props: this.propsValue, time: this.time, progress: this.progress })
        this.#completed = true
      }
    } else if (this.progress === 0) {
      this.#completed = false
    }
  }

  protected handleTickerUpdate = async ({ delta }): Promise<any> => {
    // Specific case if duration is 0, execute onComplete and return
    if (this._duration <= 0) {
      this.onEachProps((prop) => (prop.value = prop._to))
      const obj = {
        props: this.assignPropsValue<K>(this.propsValue, this.props),
        time: this._duration,
        progress: 1,
      }
      this.onUpdate?.(obj)
      this.onComplete?.(obj)
      this.onCompleteDeferred.resolve()
      this.stop()
      return
    }

    // calc time (time spend from the start)
    // calc progress (between 0 and 1)
    // calc value (between "from" and "to")
    this.time = clamp(0, this._duration, this.time + (this._isReversed ? -delta : delta))
    this.progress = clamp(0, round(this.time / this._duration), 1)
    this.interpolate(this.progress)

    this.propsValue = this.assignPropsValue<K>(this.propsValue, this.props)

    // Pass value, time and progress
    this.onUpdate?.({ props: this.propsValue, time: this.time, progress: this.progress })
    this.log("onUpdate", { props: this.propsValue, t: this.time, p: this.progress })

    // on complete
    if ((!this._isReversed && this.progress === 1) || (this._isReversed && this.progress === 0)) {
      this.log(`handleTickerUpdate onComplete!`)
      this.onComplete?.({ props: this.propsValue, time: this.time, progress: this.progress })
      this.onCompleteDeferred.resolve()
      this.stop()
    }
  }

  /**
   * Utility function to execute a callback on each props
   */
  protected onEachProps(fn: (prop: FormattedProp) => void): void {
    for (const key of Object.keys(this.props)) fn(this.props[key])
  }

  /**
   * Mute each props value key
   */
  protected interpolate(progress): void {
    const ease =
      this._isReversed && this.reverseEase ? this.reverseEase(progress) : this.ease(progress)
    this.onEachProps(
      (prop) => (prop.value = round(prop._from + (prop._to - prop._from) * ease, 1000))
    )
  }

  /**
   * Prepare internal props object
   */
  protected prepareProps<K extends keyof Props>(props: Props): FormattedProps<K> {
    return Object.keys(props).reduce((acc, key: K) => {
      const p = props[key as K]
      acc[key as K] = {
        from: p[0],
        _from: null,
        to: p[1],
        _to: null,
        value: null,
      }
      return acc
    }, {} as FormattedProps<K>)
  }

  /**
   * Create an object with props keys
   * in order to keep the same reference on each frame
   */
  protected createPropsParamObj<K extends keyof Props>(
    fProps: FormattedProps<K>
  ): ParamPropsValue<K> {
    return Object.keys(fProps).reduce((acc, key: K) => {
      acc[key as K] = null
      return acc
    }, {} as ParamPropsValue<K>)
  }

  /**
   * Assign props.value to propsValue object
   * in order to keep the same reference on each frame
   */
  protected assignPropsValue<P extends K>(
    propsValue: ParamPropsValue<P>,
    props: FormattedProps<P>
  ): ParamPropsValue<P> {
    for (const key of Object.keys(propsValue)) {
      propsValue[key as P] = props[key as P].value
    }
    return this.propsValue
  }

  /**
   * Log util
   * Active @wbe/debug only if debugEnable is true
   */
  protected log(...rest): void {
    if (this.debugEnable) log(this.id, ...rest)
  }
}
