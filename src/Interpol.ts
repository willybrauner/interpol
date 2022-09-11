import { Ease } from "./Ease"

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

class Interpol {
  from: number
  to: number
  duration: number
  ease: (t: number) => number
  paused: boolean
  delay: number
  onUpdate: (e: IUpdateParams) => void
  onComplete: (e: IUpdateParams) => void

  protected raf: number
  protected currentTime: number = 0
  protected advancement: number = 0
  protected time: number
  protected value: number = 0
  protected isPlaying = false

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

  /**
   * Play
   */
  play(): Interpol {
    if (this.isPlaying) return this
    this.isPlaying = true
    setTimeout(() => this.render(), this.delay)
    return this
  }

  pause(): Interpol {
    if (!this.isPlaying) return this
    this.isPlaying = false
    this.time = undefined // reset time
    cancelAnimationFrame(this.raf)
    return this
  }

  resume(): Interpol {
    if (this.isPlaying) return this
    this.isPlaying = true
    this.render()
    return this
  }

  stop(): Interpol {
    this.isPlaying = false
    this.currentTime = 0
    this.time = undefined
    cancelAnimationFrame(this.raf)
    return this
  }

  protected render(): void {
    // prepare delta
    if (!this.time) this.time = Date.now()
    const _currentTime = Date.now()
    const deltaTime = _currentTime - this.time
    this.time = _currentTime

    // calc
    this.currentTime = Math.min(this.duration, this.currentTime + deltaTime)
    this.advancement = this.currentTime / this.duration
    this.value = this.from + (this.to - this.from) * this.ease(this.advancement)

    // exe onUpdate func
    this.onUpdate({
      value: this.value,
      time: this.currentTime,
      advancement: this.advancement,
    })

    // recursive call render
    this.raf = requestAnimationFrame(this.render.bind(this))

    // end
    if (this.value === this.to) {
      this.onComplete({
        value: this.value,
        time: this.currentTime,
        advancement: this.advancement,
      })
      this.stop()
    }
  }
}

export default Interpol
