import { isServer } from "./env"

type TickParams = {
  delta: number
  time: number
  elapsed: number
}

const requestRaf = isServer() ? (c) => setTimeout(c, 16) : requestAnimationFrame
const cancelRaf = isServer() ? (c) => {} : cancelAnimationFrame

/**
 * Ticker
 */
export class Ticker {
  #isRunning = false
  public get isRunning() {
    return this.#isRunning
  }
  handlers: ((e: TickParams) => void)[] = []
  #onUpdateObject: TickParams = { delta: null, time: null, elapsed: null }
  #start: number
  #time: number
  #elapsed: number
  #keepElapsed: number
  #delta: number
  #debug: boolean
  #raf: number

  constructor({ debug = false } = {}) {
    this.#keepElapsed = 0
    this.#debug = debug
    this.play()
  }

  public add(handler): void {
    this.handlers.push(handler)
  }

  public remove(handler: Function): void {
    this.handlers = this.handlers.filter((obj) => obj !== handler)
  }
  

  public play(): void {
    this.#isRunning = true
    this.#start = performance.now()
    this.#time = this.#start
    this.#elapsed = this.#keepElapsed + (this.#time - this.#start)
    this.#delta = 16
    this.#raf = requestRaf(this.tick)
  }

  public pause(): void {
    this.#isRunning = false
    this.#keepElapsed = this.#elapsed
  }

  public stop(): void {
    this.#isRunning = false
    this.#keepElapsed = 0
    this.#elapsed = 0
    cancelRaf(this.#raf)
  }

  protected tick = (): void => {
    if (!this.#isRunning) return
    const now = performance.now()
    this.#delta = now - this.#time
    this.#time = now
    this.#elapsed = this.#keepElapsed + (this.#time - this.#start)
    this.#onUpdateObject.delta = this.#delta
    this.#onUpdateObject.time = this.#time
    this.#onUpdateObject.elapsed = this.#elapsed
    for (const o of this.handlers) o(this.#onUpdateObject)
    this.#raf = requestRaf(this.tick)
  }
}

/**
 * Ticker Instance
 * Used by all interpol/timeline instances
 */
export const tickerInstance = new Ticker()
