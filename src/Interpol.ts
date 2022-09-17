import { Ease } from "./Ease"
import { deferredPromise } from "./helpers/deferredPromise"
import Ticker from "./helpers/Ticker"

interface IUpdateParams {
  value: number
  time: number
  advancement: number
}

interface IInterpolConstruct {
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
  from: number
  to: number
  duration: number
  ease: (t: number) => number
  paused: boolean
  delay: number
  onUpdate: (e: IUpdateParams) => void
  onComplete: (e: IUpdateParams) => void

  protected ticker = new Ticker()

  protected timeout: ReturnType<typeof setTimeout>
  protected time = 0
  protected advancement = 0
  protected value = 0

  protected _isPlaying = false
  get isPlaying() {
    return this._isPlaying
  }

  protected onCompleteDeferred = deferredPromise()

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
    // If this play is retrigger before onComplete, we don't wait again

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
    this.ticker.pause()
  }

  stop(): void {
    this._isPlaying = false

    // reset
    clearTimeout(this.timeout)
    this.value = 0
    this.time = 0
    this.advancement = 0
    this.ticker.stop()
  }

  protected render(): void {
    // start ticker
    this.ticker.start()

    // on ticker update
    this.ticker.onUpdate = ({ delta }) => {
      this.time = Math.min(this.duration, this.time + delta)
      this.advancement = this.roundedValue(this.time / this.duration)
      this.value = this.roundedValue(
        this.from + (this.to - this.from) * this.ease(this.advancement)
      )

      // exe onUpdate local method with params
      this.onUpdate?.({
        value: this.value,
        time: this.time,
        advancement: this.advancement,
      })

      // end, exe onComplete
      if (this.value === this.to) {
        console.log("this.value === this.to", this.value, this.to)

        this.onComplete?.({
          value: this.value,
          time: this.time,
          advancement: this.advancement,
        })
        this.onCompleteDeferred.resolve()
        this.stop()
      }
    }
  }

  protected roundedValue(v: number): number {
    return Math.round(v * 1000) / 1000
  }
}
