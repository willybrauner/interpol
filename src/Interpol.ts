import { Ease } from "./Ease"
import { deferredPromise } from "./helpers/deferredPromise"
import { roundedValue } from "./helpers/roundValue"
import Ticker from "./helpers/Ticker"

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
}

export class Interpol {
  public from: number
  public to: number
  public duration: number
  public ease: (t: number) => number
  public paused: boolean
  public delay: number
  public onUpdate: (e: IUpdateParams) => void
  public onComplete: (e: IUpdateParams) => void

  public inTl = false
  public ticker = new Ticker()
  public advancement = 0
  public time = 0
  public value = 0
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
    ease = Ease.linear,
    paused = false,
    delay = 0,
    onUpdate,
    onComplete,
  }: IInterpolConstruct) {
    this.from = from
    this.to = to
    this.duration = duration
    this.paused = paused
    this.ease = ease
    this.delay = delay
    this.onUpdate = onUpdate
    this.onComplete = onComplete

    // start
    if (!this.paused) this.play()
  }

  async play(): Promise<any> {
    if (this._isPlaying) {
      // recreate deferred promise to avoid multi callback:
      // ex:
      //  await play()
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

  async replay(): Promise<any> {
    this.stop()
    await this.play()
  }

  pause(): void {
    if (!this._isPlaying) return
    this._isPlaying = false
    this.ticker.onUpdate.off(this.handleTickerUpdate)
    if (!this.inTl) this.ticker.pause()
  }

  stop(): void {
    if (!this._isPlaying) return
    this._isPlaying = false
    clearTimeout(this.timeout)
    this.value = 0
    this.time = 0
    this.advancement = 0
    this.ticker.onUpdate.off(this.handleTickerUpdate)

    if (!this.inTl) this.ticker.stop()
  }

  protected async render(): Promise<void> {
    if (!this.inTl) this.ticker.start()
    this.ticker.onUpdate.on(this.handleTickerUpdate)
  }

  protected handleTickerUpdate = ({ delta, time, elapsed }) => {
    console.log("Interpol >", { delta, time, elapsed })

    this.time = Math.min(this.duration, this.time + delta)
    this.advancement = Math.min(roundedValue(this.time / this.duration), 1)
    this.value = roundedValue(
      this.from + (this.to - this.from) * this.ease(this.advancement)
    )


      // exe onUpdate local method with params
      this.onUpdate?.({
        value: this.value,
        time: this.time,
        advancement: this.advancement,
      })


    // end, exe onComplete
    if (this.advancement === 1) {
      // re-init advancement just in case
      if (this.value !== this.to) this.value = this.to

      console.log("Interpol > this.advancement >= 1", {
        "this.value": this.value,
        "this.to": this.to,
        "this.advancement": this.advancement,
      })

      this.stop()

      this.onComplete?.({
        value: this.value,
        time: this.time,
        advancement: this.advancement,
      })
      this.onCompleteDeferred.resolve()
    }
  }
}
