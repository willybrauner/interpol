import { Beeper } from "./Beeper"

export const RAF =
  typeof window === "undefined"
    ? (cb) => setTimeout(cb, 16)
    : requestAnimationFrame

export const CANCEL_RAF =
  typeof window === "undefined" ? (cb) => {} : cancelAnimationFrame

/**
 * Ticker
 *
 *
 */
export default class Ticker {
  // Contain timestamp when the experience starts and will stay the same
  public debut: number

  // contain the current timestamp and will change on each frame
  public time: number

  // How much time was spent since the start of the experience
  public elapsed: number

  // will contain how much time was spent since the previous frame.
  // We set it as 16 by default which is close to how many milliseconds
  //  there is between two frames at 60fps.
  public delta: number

  // store the raf
  protected raf

  protected fps: number
  protected interval: number

  protected isRunning = false

  public onUpdate = Beeper<{
    interval: number
    delta: number
    time: number
    elapsed: number
  }>()

  constructor({ fps = 60 } = {}) {
    this.fps = fps
    this.interval = 1000 / this.fps
  }

  public start(): void {
    this.isRunning = true
    this.debut = Date.now()
    this.time = this.debut
    this.elapsed = 0
    this.delta = 16
    this.raf = RAF(this.tick.bind(this))
  }
  public pause(): void {
    this.isRunning = false
    CANCEL_RAF(this.raf)
  }

  public stop(): void {
    this.isRunning = false
    this.elapsed = 0
    CANCEL_RAF(this.raf)
  }

  protected tick(): void {
    const now = Date.now()
    this.delta = now - this.time
    this.time = now
    this.elapsed = this.time - this.debut

    //    if (this.delta > this.interval) {
    if (this.isRunning) {
      this.onUpdate.dispatch({
        interval: this.interval,
        delta: this.delta,
        time: this.time,
        elapsed: this.elapsed,
      })
      this.raf = RAF(this.tick.bind(this))
    }
  }
}
