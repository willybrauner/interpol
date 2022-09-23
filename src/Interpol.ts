import { deferredPromise } from "./helpers/deferredPromise"
import { round } from "./helpers/round"
import Ticker from "./Ticker"
import debug from "@wbe/debug"
import { clamp } from "./helpers/clamp"
const log = debug("interpol:Interpol")

interface IUpdateParams {
  value: number
  time: number
  advancement: number
}

export interface IInterpolConstruct {
  from?: number | (() => number)
  to?: number | (() => number)
  duration?: number | (() => number)
  ease?: (t: number) => number
  paused?: boolean
  delay?: number
  beforeStart?: () => void
  onUpdate?: ({ value, time, advancement }: IUpdateParams) => void
  onComplete?: ({ value, time, advancement }: IUpdateParams) => void
  onRepeatComplete?: ({ value, time, advancement }: IUpdateParams) => void
  yoyo?: boolean
  repeat?: number
  repeatRefresh?: boolean
  debug?: boolean
}

let ID = 0

export class Interpol {
  public from: number | (() => number)
  public _from: number
  public to: number | (() => number)
  public _to: number
  public duration: number | (() => number)
  public _duration: number
  public readonly ease: (t: number) => number
  public paused: boolean
  public delay: number
  public beforeStart: () => void
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
  public inTl = false
  protected repeatCounter = 0

  constructor({
    from = 0,
    to = 1000,
    duration = 1000,
    // linear easing by default, without Ease object import
    ease = (t) => t,
    paused = false,
    delay = 0,
    beforeStart,
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
    this.delay = delay
    this.beforeStart = beforeStart
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

  // Compute if is a function
  public refresh(): void {
    const compute = (p) => (typeof p === "function" ? p() : p)
    this._to = compute(this.to)
    this._from = compute(this.from)
    this._duration = compute(this.duration)
    this.log({ _from: this._from, _to: this._to, _duration: this._duration })
  }

  public async play(): Promise<any> {
    await this._play()
  }
  protected _play(createNewFullCompletePromise = true) {
    if (this._isPlaying) {
      // refresh value during the play if repeatRefresh is true
      if (this.repeatRefresh) this.refresh()

      // recreate deferred promise to avoid multi callback:
      // ex: await play()
      //  some code... -> need to be called once even if play() is called multi times
      if (createNewFullCompletePromise) this.onFullCompleteDeferred = deferredPromise()
      return this.onFullCompleteDeferred.promise
    }
    this._isPlaying = true

    // Refresh values before play
    this.refresh()

    // Delay is set only on first play.
    // If this play is trigger before onComplete, we don't wait again
    const d = this.time > 0 ? 0 : this.delay
    this.timeout = setTimeout(() => {
      // start ticker
      this.render()
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
    this._isPlaying = false
    this.ticker.onUpdateEmitter.off(this.handleTickerUpdate)
    if (!this.inTl) this.ticker.pause()
  }

  public stop(): void {
    this._stop()
  }
  protected _stop(resetRepeatCounter = true): void {
    this._isPlaying = false
    clearTimeout(this.timeout)
    this.value = 0
    this.time = 0
    this.advancement = 0
    this._isReversed = false
    this.ticker.onUpdateEmitter.off(this.handleTickerUpdate)
    if (resetRepeatCounter) this.repeatCounter = 0
    if (!this.inTl) this.ticker.stop()
  }

  public reverse() {
    this._isReversed = !this._isReversed
    return this
  }

  protected async render(): Promise<void> {
    if (!this.inTl) this.ticker.play()
    this.ticker.onUpdateEmitter.on(this.handleTickerUpdate)
  }

  protected handleTickerUpdate = async ({ delta, time, elapsed }) => {
    // Specific case if duration is 0
    // execute onComplete and return
    if (this._duration <= 0) {
      const obj = { value: this._to, time: this._duration, advancement: 1 }
      this.onUpdate?.(obj)
      this.onComplete?.(obj)
      return
    }

    // delta sign depend of reverse state
    delta = this._isReversed ? -delta : delta

    // calc time (time spend from the start)
    // calc advancement (between 0 and 1)
    // calc value (between "from" and "to")
    this.time = clamp(0, this._duration, this.time + delta)
    this.advancement = clamp(0, round(this.time / this._duration), 1)
    this.value = this._from + (this._to - this._from) * this.ease(this.advancement)
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
      this.log(`advancement = ${isNormalDirectionEnd ? 1 : 0}`)
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
