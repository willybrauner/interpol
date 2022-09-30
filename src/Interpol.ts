import { deferredPromise } from "./helpers/deferredPromise"
import { round } from "./helpers/round"
import Ticker from "./Ticker"
import debug from "@wbe/debug"
import { clamp } from "./helpers/clamp"
const log = debug("interpol:Interpol")

export interface IUpdateParams {
  value: number
  time: number
  advancement: number
}

export interface IInterpolConstruct {
  from?: number | (() => number)
  to?: number | (() => number)
  duration?: number | (() => number)
  ease?: (t: number) => number
  reverseEase?: (t: number) => number
  paused?: boolean
  delay?: number
  yoyo?: boolean
  repeat?: number
  repeatRefresh?: boolean
  debug?: boolean
  onStart?: () => void
  onUpdate?: ({ value, time, advancement }: IUpdateParams) => void
  beforeStart?: () => void
  onComplete?: ({ value, time, advancement }: IUpdateParams) => void
  onRepeatComplete?: ({ value, time, advancement }: IUpdateParams) => void
}

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
  public onStart: () => void
  public onUpdate: (e: IUpdateParams) => void
  public onComplete: (e: IUpdateParams) => void
  public onRepeatComplete: (e: IUpdateParams) => void
  public yoyo: boolean
  public repeat: number
  public repeatRefresh: boolean
  public ticker: Ticker = new Ticker()
  public advancement = 0
  public time = 0
  public value = 0
  public debugEnable: boolean
  // internal
  public readonly id = ++ID
  protected timeout: ReturnType<typeof setTimeout>
  protected onFullCompleteDeferred = deferredPromise()
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
  protected repeatCounter = 0

  constructor({
    from = 0,
    to = 1000,
    duration = 1000,
    // linear easing by default, without Ease object import
    ease = (t) => t,
    reverseEase,
    paused = false,
    delay = 0,
    beforeStart,
    onStart,
    onUpdate,
    onComplete,
    onRepeatComplete,
    debug = false,
    yoyo = false,
    repeat = 0,
    repeatRefresh = false,
  }: IInterpolConstruct) {
    this.from = from
    this.to = to
    this.duration = duration
    this.paused = paused
    this.ease = ease
    this.reverseEase = reverseEase
    this.delay = delay
    this.beforeStart = beforeStart
    this.onStart = onStart
    this.onUpdate = onUpdate
    this.onComplete = onComplete
    this.onRepeatComplete = onRepeatComplete
    this.yoyo = yoyo
    this.repeat = repeat
    this.repeatRefresh = repeatRefresh
    this.debugEnable = debug
    this.ticker.debugEnable = debug

    // start!
    this.beforeStart?.()
    if (!this.paused) this.play()
  }

  // Compute if values are a functions
  public refreshComputedValues(): void {
    const compute = (p) => (typeof p === "function" ? p() : p)
    this._to = compute(this.to)
    this._from = compute(this.from)
    this._duration = compute(this.duration)
    this.log("refreshComputedValues", {
      _from: this._from,
      _to: this._to,
      _duration: this._duration,
    })
  }

  public async play(): Promise<any> {
    await this._play()
  }
  protected _play(createNewFullCompletePromise = true, isReversedState: boolean = false) {
    if (this._isPlaying) {
      // refreshComputedValues value during the play if repeatRefresh is true
      if (this.repeatRefresh) this.refreshComputedValues()

      if (!this.inTl) {
        this._isReversed = isReversedState
      }
      // recreate deferred promise to avoid multi callback:
      // ex: await play()
      //  some code... -> need to be called once even if play() is called multi times
      if (createNewFullCompletePromise) this.onFullCompleteDeferred = deferredPromise()
      return this.onFullCompleteDeferred.promise
    }
    this._isPlaying = true
    this._isPause = false

    // Refresh values before play
    this.refreshComputedValues()

    // Delay is set only on first play.
    // If this play is trigger before onComplete, we don't wait again
    const d = this.time > 0 ? 0 : this.delay
    this.timeout = setTimeout(() => {
      // execute onStart event on each play
      this.onStart?.()
      // start ticker only if is single Interpol, not TL
      if (!this.inTl) this.ticker.play()
      this.ticker.onUpdateEmitter.on(this.handleTickerUpdate)
    }, d)

    // create new onComplete deferred Promise and return it
    if (createNewFullCompletePromise) this.onFullCompleteDeferred = deferredPromise()
    return this.onFullCompleteDeferred.promise
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
    this._stop()
  }
  protected _stop(resetRepeatCounter = true): void {
    this.value = 0
    this.time = 0
    this.advancement = 0
    if (resetRepeatCounter) this.repeatCounter = 0
    this._isPlaying = false
    this._isPause = false
    this._isReversed = false
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
      this.advancement = this._isReversed ? 1 : 0
    }
    return this._play(true, this._isReversed)
  }

  protected handleTickerUpdate = async ({ delta }) => {
    if (!this.ticker.isRunning) return

    // Specific case if duration is 0
    // execute onComplete and return
    if (this._duration <= 0) {
      const obj = { value: this._to, time: this._duration, advancement: 1 }
      this.onUpdate?.(obj)
      this.onComplete?.(obj)
      this.log("this._duration <= 0, return", this._duration <= 0)
      return
    }

    // delta sign depend of reverse state
    delta = this._isReversed ? -delta : delta

    // select easing function
    const easeFn = this._isReversed && this.reverseEase ? this.reverseEase : this.ease

    // calc time (time spend from the start)
    // calc advancement (between 0 and 1)
    // calc value (between "from" and "to")
    this.time = clamp(0, this._duration, this.time + delta)
    this.advancement = clamp(0, round(this.time / this._duration), 1)
    this.value = this._from + (this._to - this._from) * easeFn(this.advancement)
    this.value = round(this.value, 1000)

    // Pass value, time and advancement
    this.onUpdate?.({
      value: this.value,
      time: this.time,
      advancement: this.advancement,
    })

    this.log("onUpdate", {
      value: this.value,
      time: this.time,
      advancement: this.advancement,
    })

    // check direction end
    const isNormalDirectionEnd = !this._isReversed && this.advancement === 1
    const isReverseDirectionEnd = this._isReversed && this.advancement === 0

    // yoyo case, reverse and play again
    if (this.yoyo) {
      if (isNormalDirectionEnd || isReverseDirectionEnd) {
        this._isReversed = !this._isReversed
        this.log("yoyo! update reverse state to", this._isReversed)
        this.play()
        return
      }
    }

    // end, exe onComplete
    if (isNormalDirectionEnd || isReverseDirectionEnd) {
      this.log(`advancement = ${isNormalDirectionEnd ? 1 : 0}, execute onComplete()`)
      // uniformize vars
      if (this.value !== this._to) this.value = this._to
      if (this.time !== this._duration) this.time = this._duration
      // Call current interpol onComplete method
      this.onComplete?.({
        value: this.value,
        time: this.time,
        advancement: this.advancement,
      })

      // repeat logic
      const repeatInfinitely = this.repeat < 0
      const needToRepeat = this.repeat > 0 && this.repeatCounter + 1 < this.repeat

      if (repeatInfinitely) {
        this.replay()
        return
      }
      if (needToRepeat) {
        this.repeatCounter++
        this.log("Have been repeated", this.repeatCounter)
        this._stop(false)
        this._play(false)
        return
      }
      if (!needToRepeat && this.repeat !== 0) {
        this.repeatCounter++
        this.log("End repeats!", this.repeatCounter)
        this.onRepeatComplete?.({
          value: this.value,
          time: this.time,
          advancement: this.advancement,
        })
        // and continue...
      }

      // If repeat is active, we want to resolve onComplete promise only
      // when all repeats are complete
      if (!repeatInfinitely && !needToRepeat) {
        this.onFullCompleteDeferred.resolve()
      }
      // stop and reset after onComplete
      // ! need to stop after repeat logic because stop() will reset repeatCounter
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
