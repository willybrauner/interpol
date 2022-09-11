import { Ease } from "./Ease"
import { deferredPromise } from "./helpers/deferredPromise"

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

const RAF =
  typeof window === "undefined"
    ? (cb) => setTimeout(cb, 16)
    : requestAnimationFrame

const CANCEL_RAF =
  typeof window === "undefined" ? (cb) => {} : cancelAnimationFrame

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
  protected timer: number
  protected value: number = 0

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
    if (this.paused) return
    this.play()
  }

  async play(): Promise<any> {
    if (this._isPlaying) {
      // FIXME est ce qu'on veut que le code après la promesse soit exécuté autant de fois que l'on a executé play() ?
      console.log("is already playing")
      return this.onCompleteDeferred.promise
    }
    this._isPlaying = true

    // Delay is set only on first play.
    // If this play is retrigger before onComplete, we don't wait again
    setTimeout(() => this.render(), this.time > 0 ? 0 : this.delay)

    // create new onComplete deferred Promise and return it
    this.onCompleteDeferred = deferredPromise()
    return this.onCompleteDeferred.promise
  }

  async replay(): Promise<any> {
    this.stop()
    return this.play()
  }

  pause(): void {
    if (!this._isPlaying) return
    this._isPlaying = false

    // reset timer and raf
    this.timer = undefined
    CANCEL_RAF(this.raf)
  }

  stop(): void {
    this._isPlaying = false

    // reset time, timer and raf
    this.time = 0
    this.timer = undefined
    CANCEL_RAF(this.raf)
  }

  protected render(): void {
    // prepare delta
    if (!this.timer) this.timer = Date.now()
    const _currentTime = Date.now()
    const deltaTime = _currentTime - this.timer
    this.timer = _currentTime

    // calc
    this.time = Math.min(this.duration, this.time + deltaTime)
    this.advancement = this.time / this.duration
    this.value = this.from + (this.to - this.from) * this.ease(this.advancement)

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
