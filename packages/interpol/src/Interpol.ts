import { IInterpolConstruct, IUpdateParams } from "./core/types"
import debug from "@wbe/debug"
import { Ticker } from "./core/Ticker"
import { deferredPromise } from "./core/deferredPromise"
import { clamp } from "./core/clamp"
import { round } from "./core/round"
import { compute } from "./core/compute"

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

    // compute values
    this.refreshComputedValues()

    // start!
    this.beforeStart?.()
    if (!this.paused) this.play()
  }

  // Compute if values are functions
  public refreshComputedValues(to = this.to, from = this.from, duration = this.duration): void {
    this._to = compute(to)
    this._from = compute(from)
    this._duration = compute(duration)
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
    this.value = this._to * from
    this.time = this._duration * from
    this.progress = from
    this._isReversed = false
    this._isPlaying = true
    this._isPause = false

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

    this.value = this._to * from
    this.time = this._duration * from
    this.progress = from
    this._isReversed = true
    this._isPlaying = true
    this._isPause = false

    // start ticker only if is single Interpol, not TL
    if (!this.inTl) this.ticker.play()
    this.ticker.onUpdateEmitter.on(this.handleTickerUpdate)
    // create new onComplete deferred Promise and return it
    this.onCompleteDeferred = deferredPromise()
    return this.onCompleteDeferred.promise
  }

  public pause(): void {
    this._isPause = true
    this._isPlaying = false
    this.ticker.onUpdateEmitter.off(this.handleTickerUpdate)
    if (!this.inTl) this.ticker.pause()
  }

  public resume(): void {
    if (!this._isPause) return
    this._isPause = false
    this._isPlaying = true
    this.ticker.onUpdateEmitter.on(this.handleTickerUpdate)
    if (!this.inTl) this.ticker.play()
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

  /**
   * Seek to a specific progress (between 0 and 1)
   * @param progress
   */
  #completed = false;
  public seek(progress: number): void {
    this.progress = clamp(0, progress, 1)
    this.time = clamp(0, this._duration * this.progress, this._duration)
    this.value = round(this._from + (this._to - this._from) * this.getEaseFn()(this.progress), 1000)

    if ((this.progress !== 0 && this.progress !== 1) && !this.#completed) {
      this.onUpdate?.({ value: this.value, time: this.time, progress: this.progress });
      this.log("seek onUpdate", { v: this.value, t: this.time, p: this.progress })
    }
    if (this.progress === 1) {
      if (!this.#completed) {
        this.log('seek onComplete');
        this.onComplete?.({ value: this.value, time: this.time, progress: this.progress });
        this.#completed = true;
      }
    } else {
      this.#completed = false;
    }
  }


  protected handleTickerUpdate = async ({ delta }): Promise<any> => {
    // Specific case if duration is 0, execute onComplete and return
    if (this._duration <= 0) {
      const obj = { value: this._to, time: this._duration, progress: 1 }
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
    this.value = round(this._from + (this._to - this._from) * this.getEaseFn()(this.progress), 1000)

    // Pass value, time and progress
    this.onUpdate?.({ value: this.value, time: this.time, progress: this.progress })
    this.log("onUpdate", { v: this.value, t: this.time, p: this.progress })

    // on complete
    if ((!this._isReversed && this.progress === 1) || (this._isReversed && this.progress === 0)) {
      this.log(`handleTickerUpdate onComplete !`)
      this.value = this._to
      this.time = this._duration
      this.onComplete?.({ value: this.value, time: this.time, progress: this.progress })
      this.onCompleteDeferred.resolve()
      this.stop()
    }
  }

  /**
   * Reverse depend of ease
   * @protected
   */
  protected getEaseFn(): (t: number) => number {
    return this._isReversed && this.reverseEase ? this.reverseEase : this.ease
  }

  /**
   * Log util
   * Active @wbe/debug only if debugEnable is true
   */
  protected log(...rest): void {
    if (this.debugEnable) log(this.id, ...rest)
  }
}
