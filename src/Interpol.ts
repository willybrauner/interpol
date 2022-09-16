import { Ease } from "./Ease"
import { deferredPromise } from "./helpers/deferredPromise"
import { CANCEL_RAF, RAF } from "./helpers/Ticker"

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

  protected raf
  protected time: number = 0
  protected advancement: number = 0
  protected currentTime: number
  protected value: number = 0
  protected timeout

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
      () => this.render(),
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

    // reset timer and raf
    this.currentTime = undefined
    CANCEL_RAF(this.raf)
  }

  stop(): void {
    this._isPlaying = false

    // reset time, timer and raf
    this.time = 0
    this.currentTime = undefined
    CANCEL_RAF(this.raf)
    clearTimeout(this.timeout)
  }

  protected render(): void {
    // prepare delta
    const currentTime = Date.now()
    if (!this.currentTime) this.currentTime = Date.now()
    const deltaTime = currentTime - this.currentTime
    this.currentTime = currentTime

    // calc
    this.time = Math.min(this.duration, this.time + deltaTime)
    this.advancement = this.time / this.duration
    this.value = this.from + (this.to - this.from) * this.ease(this.advancement)
    this.value = Math.round(this.value * 1000) / 1000

    // exe onUpdate func
    this.onUpdate?.({
      value: this.value,
      time: this.time,
      advancement: this.advancement,
    })

    // recursive call render
    this.raf = RAF(this.render.bind(this))

    // end
    if (this.value === this.to) {
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
