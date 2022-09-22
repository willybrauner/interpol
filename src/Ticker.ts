import { Beeper } from "./Beeper"
import debug from "@wbe/debug"
const log = debug("interpol:Ticker")

// Useful trick from https://github.com/SolalDR/animate/blob/master/src/Timeline.ts
export const RAF =
  typeof window === "undefined"
    ? (cb) => setTimeout(cb, 16)
    : requestAnimationFrame

export const CANCEL_RAF =
  typeof window === "undefined" ? (cb) => {} : cancelAnimationFrame

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
  protected raf
  protected fps: number
  protected interval: number
  protected isRunning = false
  public onUpdateEmitter = Beeper<{
    interval: number
    delta: number
    time: number
    elapsed: number
  }>()


  constructor({ fps = 60, debug = false } = {}) {
    this.fps = fps
    this.interval = 1000 / this.fps
    // set outside "play()" because play is resume too
    this.keepElapsed = 0
    this.debugEnable = debug
  }

  public play(): void {
    this.isRunning = true
    this.start = Date.now()
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

    const now = Date.now()
    this.delta = now - this.time
    this.time = now
    this.elapsed = this.keepElapsed + (this.time - this.start)

    const onUpdateObj = {
      interval: this.interval,
      delta: this.delta,
      time: this.time,
      elapsed: this.elapsed,
    }
    this.onUpdateEmitter.dispatch(onUpdateObj)
    this.log("tick", onUpdateObj)

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
