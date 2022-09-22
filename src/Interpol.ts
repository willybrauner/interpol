import { deferredPromise } from "./helpers/deferredPromise"
import { roundedValue } from "./helpers/roundValue"
import Ticker from "./Ticker"
import debug from "@wbe/debug"
const log = debug("interpol:Interpol")

interface IUpdateParams {
  value: number
  time: number
  advancement: number
}

export interface IInterpolConstruct {
  from?: number
  to: number
  duration?: number
  ease?: (t: number) => number
  paused?: boolean
  delay?: number
  onUpdate?: ({ value, time, advancement }: IUpdateParams) => void
  onComplete?: ({ value, time, advancement }: IUpdateParams) => void
  yoyo?: boolean
  debug?: boolean
}

let ID = 0

export class Interpol {
  public from: number
  public to: number
  public duration: number
  public ease: (t: number) => number
  public paused: boolean
  public delay: number
  public onUpdate: (e: IUpdateParams) => void
  public onComplete: (e: IUpdateParams) => void
  public yoyo: boolean

  public inTl = false
  public ticker: Ticker = new Ticker()
  public advancement = 0
  public time = 0
  public value = 0
  public debugEnable: boolean
  public readonly id = ++ID
  public reverse = false

  protected timeout: ReturnType<typeof setTimeout>
  protected onCompleteDeferred = deferredPromise()

  protected _isPlaying = false
  public get isPlaying() {
    return this._isPlaying
  }

  constructor({
    from = 0,
    to = 1000,
    duration = 1000,
    // linear easing by default, without Ease object import
    ease = (t) => t,
    paused = false,
    delay = 0,
    onUpdate,
    onComplete,
    debug = false,
    yoyo = false,
  }: IInterpolConstruct) {
    this.from = from
    this.to = to
    this.duration = duration
    this.paused = paused
    this.ease = ease
    this.delay = delay
    this.onUpdate = onUpdate
    this.onComplete = onComplete
    this.yoyo = yoyo
    this.debugEnable = debug
    this.ticker.debugEnable = debug

    // start
    if (!this.paused) this.play()
  }

  async play(): Promise<any> {
    if (this._isPlaying) {
      // recreate deferred promise to avoid multi callback:
      // ex: await play()
      //  some code... -> need to be called once even if play() is called multi times
      this.onCompleteDeferred = deferredPromise()
      return this.onCompleteDeferred.promise
    }
    this._isPlaying = true
    // Delay is set only on first play.
    // If this play is trigger before onComplete, we don't wait again
    this.timeout = setTimeout(
      () => {
        // start ticker
        this.render()
      },
      this.time > 0 ? 0 : this.delay
    )

    // create new onComplete deferred Promise and return it
    this.onCompleteDeferred = deferredPromise()
    return this.onCompleteDeferred.promise
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
    this._isPlaying = false
    clearTimeout(this.timeout)
    this.value = 0
    this.time = 0
    this.advancement = 0
    this.ticker.onUpdateEmitter.off(this.handleTickerUpdate)
    if (!this.inTl) this.ticker.stop()
  }

  protected async render(): Promise<void> {
    if (!this.inTl) this.ticker.play()
    this.ticker.onUpdateEmitter.on(this.handleTickerUpdate)
  }

  protected handleTickerUpdate = ({ delta, time, elapsed }) => {
    // specific case if duration is 0
    // execute onComplete and return
    if (this.duration <= 0) {
      const obj = { value: this.to, time: this.duration, advancement: 1 }
      this.onUpdate?.(obj)
      this.onComplete?.(obj)
      return
    }

    // calc time (time spend from the start)
    // calc advancement (between 0 and 1)
    if (this.reverse) {
      this.time = Math.min(this.duration, this.time - delta)
      this.advancement = Math.max(roundedValue(this.time / this.duration), 0)
    } else {
      this.time = Math.min(this.duration, this.time + delta)
      this.advancement = Math.min(roundedValue(this.time / this.duration), 1)
    }

    // calc value (between "from" and "to")
    this.value = roundedValue(
      this.from + (this.to - this.from) * this.ease(this.advancement)
    )

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

    if (this.yoyo) {
      if (!this.reverse && this.advancement === 1) {
        this.reverse = !this.reverse
        this.log("yoyo!")
        this.log("update reverse state to", this.reverse)

        this.play()
        return
      }
      if (this.reverse && this.advancement === 0) {
        this.reverse = !this.reverse
        this.log("yoyo!")
        this.log("update reverse state to", this.reverse)
        this.play()
        return
      }
    }

    // end, exe onComplete
    if (this.advancement === 1) {
      this.log("this.advancement === 1")

      // uniform vars
      if (this.value !== this.to) this.value = this.to
      if (this.time !== this.duration) this.time = this.duration

      this.onComplete?.({
        value: this.value,
        time: this.time,
        advancement: this.advancement,
      })

      this.onCompleteDeferred.resolve()

      // reset after onComplete
      this.stop()
    }
  }

  /**
   * Log util
   */
  protected log(...rest): void {
    if (this.debugEnable) log(this.id, ...rest)
  }
}
