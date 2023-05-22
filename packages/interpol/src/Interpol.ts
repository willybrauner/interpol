import { IInterpolConstruct, IUpdateParams } from "./core/types"
import debug from "@wbe/debug"
import { Ticker } from "./core/Ticker"
import { deferredPromise } from "./core/deferredPromise"
import { clamp } from "./core/clamp"
import { round } from "./core/round"

const log = debug("interpol:Interpol")

let ID = 0

export class Interpol {
  public from: number | (() => number)
  public _from: number
  public to: number | (() => number)
  public _to: number
  public duration: number | (() => number)
  public _duration: number
  public ease: (t: number) => number
  public reverseEase: (t: number) => number
  public paused: boolean
  public delay: number
  public beforeStart: () => void
  public onUpdate: (e: IUpdateParams) => void
  public onComplete: (e: IUpdateParams) => void
  public ticker: Ticker
  public progress = 0
  public time = 0
  public value = 0
  public debugEnable: boolean
  // internal
  public readonly id = ++ID
  protected timeout: ReturnType<typeof setTimeout>
  protected onCompleteDeferred = deferredPromise()
  protected _isReversed = false
  public get isReversed() {
    return this._isReversed
  }

  protected _isPlaying = false
  public get isPlaying() {
    return this._isPlaying
  }
  protected _isPause = false

  public inTl = false

  constructor({
    from = 0,
    to = 1000,
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
  }: IInterpolConstruct) {
    this.from = from
    this.to = to
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
    this.ticker.debugEnable = debug

    // start!
    this.beforeStart?.()
    if (!this.paused) this.play()
  }

  // Compute if values are functions
  public refreshComputedValues(): void {
    const compute = (p) => (typeof p === "function" ? p() : p)
    this._to = compute(this.to)
    this._from = compute(this.from)
    this._duration = compute(this.duration)
  }

  public async play(): Promise<any> {
    await this._play()
  }
  protected _play(createNewCompletePromise = true, isReversedState: boolean = false) {
    if (this._isPlaying) {
      if (!this.inTl) {
        this._isReversed = isReversedState
      }
      // recreate deferred promise to avoid multi callback
      // this one need to be called once even if play() is called multi times
      if (createNewCompletePromise) this.onCompleteDeferred = deferredPromise()
      return this.onCompleteDeferred.promise
    }
    this._isPlaying = true
    this._isPause = false

    // Refresh values before play
    this.refreshComputedValues()

    // Delay is set only on first play.
    // If this play is trigger before onComplete, we don't wait again
    const d = this.time > 0 && !this._isReversed ? 0 : this.delay
    this.timeout = setTimeout(() => {
      // start ticker only if is single Interpol, not TL
      if (!this.inTl) this.ticker.play()
      this.ticker.onUpdateEmitter.on(this.handleTickerUpdate)
    }, d)

    // create new onComplete deferred Promise and return it
    if (createNewCompletePromise) this.onCompleteDeferred = deferredPromise()
    return this.onCompleteDeferred.promise
  }

  public async replay(): Promise<any> {
    this._isPlaying = true
    this.stop()
    await this.play()
  }

  public pause(): void {
    this._isPause = true
    this._isPlaying = false
    this.ticker.onUpdateEmitter.off(this.handleTickerUpdate)
    if (!this.inTl) this.ticker.pause()
  }

  public stop(): void {
    if (!this.inTl || (this.inTl && this._isReversed)) {
      this.value = 0
      this.time = 0
      this.progress = 0
    }
    if (!this.inTl) {
      this._isReversed = false
    }
    this._isPlaying = false
    this._isPause = false
    clearTimeout(this.timeout)
    this.ticker.onUpdateEmitter.off(this.handleTickerUpdate)
    if (!this.inTl) this.ticker.stop()
  }

  public reverse(r?: boolean) {
    this._isReversed = r ?? !this._isReversed
    // if has been stopped
    if (!this.isPlaying && !this._isPause) {
      this.value = this._isReversed ? this._to : 0
      this.time = this._isReversed ? this._duration : 0
      this.progress = this._isReversed ? 1 : 0
    }
    return this._play(true, this._isReversed)
  }

  protected handleTickerUpdate = async ({ delta }) => {
    // Specific case if duration is 0
    // execute onComplete and return
    if (this._duration <= 0) {
      const obj = { value: this._to, time: this._duration, progress: 1 }
      this.onUpdate?.(obj)
      this.onComplete?.(obj)
      this.log("this._duration <= 0, return", this._duration <= 0)
      // stop after onComplete
      this.onCompleteDeferred.resolve()
      this.stop()
      return
    }

    // delta sign depend of reverse state
    delta = this._isReversed ? -delta : delta

    // select easing function
    const easeFn = this._isReversed && this.reverseEase ? this.reverseEase : this.ease

    // calc time (time spend from the start)
    // calc progress (between 0 and 1)
    // calc value (between "from" and "to")
    this.time = clamp(0, this._duration, this.time + delta)
    this.progress = clamp(0, round(this.time / this._duration), 1)
    this.value = this._from + (this._to - this._from) * easeFn(this.progress)
    this.value = round(this.value, 1000)

    // Pass value, time and progress
    this.onUpdate?.({
      value: this.value,
      time: this.time,
      progress: this.progress,
    })

    this.log("onUpdate", {
      value: this.value,
      time: this.time,
      progress: this.progress,
    })

    // check direction end
    const isNormalDirectionEnd = !this._isReversed && this.progress === 1
    const isReverseDirectionEnd = this._isReversed && this.progress === 0

    // end, onComplete
    if (isNormalDirectionEnd || isReverseDirectionEnd) {
      this.log(`progress = ${isNormalDirectionEnd ? 1 : 0}, execute onComplete()`)
      // uniformize vars
      this.value = this._to
      this.time = this._duration
      // Call current interpol onComplete method
      this.onComplete?.({
        value: this.value,
        time: this.time,
        progress: this.progress,
      })

      // stop after onComplete
      this.onCompleteDeferred.resolve()
      this.stop()
    }
  }

  /**
   * Log util
   * Active @wbe/debug only if debugEnable is true
   */
  protected log(...rest): void {
    if (this.debugEnable) log(this.id, ...rest)
  }
}
