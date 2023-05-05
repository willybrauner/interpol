import { Beeper } from "./Beeper"
import debug from "@wbe/debug"
const log = debug("interpol:Ticker")

// Useful trick from https://github.com/SolalDR/animate/blob/master/src/Timeline.ts
export const RAF =
  typeof window === "undefined" ? (cb) => setTimeout(cb, 16) : requestAnimationFrame

export const CANCEL_RAF = typeof window === "undefined" ? (cb) => {} : cancelAnimationFrame

/**
 * Ticker
 */
export default class Ticker {
  // Contain timestamp when the experience starts and will stay the same
  public start: number
  // Contain the current timestamp and will change on each frame
  public time: number
  // How much time was spent since the start of the experience
  public elapsed: number
  // Keep elapsed time if ticker is paused
  public keepElapsed: number
  // Will contain how much time was spent since the previous frame
  public delta: number
  // store the raf
  public debugEnable: boolean
  // store the raf
  protected raf: number
  // check if ticker is running
  public isRunning = false

  public onUpdateEmitter = Beeper<{
    delta: number
    time: number
    elapsed: number
  }>()

  constructor({ debug = false } = {}) {
    // set outside "play()" because play is resume too
    this.keepElapsed = 0
    this.debugEnable = debug
  }

  public play(): void {
    this.isRunning = true
    this.start = performance.now()
    this.time = this.start
    this.elapsed = this.keepElapsed + (this.time - this.start)
    this.delta = 16
    this.raf = RAF(this.tick.bind(this))
  }
  public pause(): void {
    this.isRunning = false
    this.keepElapsed = this.elapsed
  }

  public stop(): void {
    this.isRunning = false
    this.keepElapsed = 0
    this.elapsed = 0
    CANCEL_RAF(this.raf)
  }

  protected tick(): void {
    if (!this.isRunning) return

    const now = performance.now()
    this.delta = now - this.time
    this.time = now
    this.elapsed = this.keepElapsed + (this.time - this.start)

    const onUpdateObj = {
      delta: this.delta,
      time: this.time,
      elapsed: this.elapsed,
    }

    this.onUpdateEmitter.dispatch(onUpdateObj)
    log("tick", onUpdateObj)
    this.raf = RAF(this.tick.bind(this))
  }

  /**
   * Log util
   * Active @wbe/debug only if debugEnable is true
   */
  protected log(...rest): void {
    if (this.debugEnable) log(...rest)
  }
}
