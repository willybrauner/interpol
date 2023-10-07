import { Beeper } from "./Beeper"

type TickParams = {
  delta: number
  time: number
  elapsed: number
}

// Useful trick from https://github.com/SolalDR/animate/blob/master/src/Timeline.ts
// prettier-ignore
export const RAF = typeof window === "undefined" ? (cb) => setTimeout(cb, 16) : requestAnimationFrame
export const CANCEL_RAF = typeof window === "undefined" ? (cb) => {} : cancelAnimationFrame

/**
 * Ticker
 */
export class Ticker {
  // Check if the ticker is running
  #isRunning = false
  public get isRunning() {
    return this.#isRunning
  }
  // Our emitter witch emit params on each frame
  public onTick = Beeper<TickParams>()
  // Reference object to avoid creating a new object on each frame
  #onUpdateObject: TickParams = { delta: null, time: null, elapsed: null }
  // Contain timestamp when the experience starts and will stay the same
  #start: number
  // Contain the current timestamp and will change on each frame
  #time: number
  // How much time was spent since the start of the experience
  #elapsed: number
  // Keep elapsed time if ticker is paused
  #keepElapsed: number
  // Will contain how much time was spent since the previous frame
  #delta: number
  // True if debug is active
  #debug: boolean
  // Store the raf
  #raf

  constructor({ debug = false } = {}) {
    this.#keepElapsed = 0
    this.#debug = debug
  }

  public play(): void {
    this.#isRunning = true
    this.#start = performance.now()
    this.#time = this.#start
    this.#elapsed = this.#keepElapsed + (this.#time - this.#start)
    this.#delta = 16
    this.#raf = RAF(this.tick.bind(this))
  }

  public pause(): void {
    this.#isRunning = false
    this.#keepElapsed = this.#elapsed
  }

  public stop(): void {
    this.#isRunning = false
    this.#keepElapsed = 0
    this.#elapsed = 0
    CANCEL_RAF(this.#raf)
  }

  protected tick(): void {
    if (!this.#isRunning) return

    const now = performance.now()
    this.#delta = now - this.#time
    this.#time = now
    this.#elapsed = this.#keepElapsed + (this.#time - this.#start)

    this.#onUpdateObject.delta = this.#delta
    this.#onUpdateObject.time = this.#time
    this.#onUpdateObject.elapsed = this.#elapsed

    this.onTick.dispatch(this.#onUpdateObject)
    this.#raf = RAF(this.tick.bind(this))
  }
}
