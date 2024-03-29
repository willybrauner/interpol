import { isClient } from "./env"

type TickParams = {
  delta: number
  time: number
  elapsed: number
}

type Handler = (e: TickParams) => void

/**
 * Ticker
 */
export class Ticker {
  #isRunning = false
  #handlers: ((e: TickParams) => void)[]
  #onUpdateObj: TickParams
  #start: number
  #time: number
  #elapsed: number
  #keepElapsed: number
  #delta: number
  #rafId: number
  #isClient: boolean
  #enable: boolean

  constructor() {
    this.#handlers = []
    this.#onUpdateObj = { delta: null, time: null, elapsed: null }
    this.#keepElapsed = 0
    this.#enable = true
    this.#isClient = isClient()
    this.#initEvents()
    // wait a frame in case disableRaf is set to true
    setTimeout(() => this.play(), 0)
  }

  public disable(): void {
    this.#enable = false
  }

  public add(fn: Handler): void {
    this.#handlers.push(fn)
  }

  public remove(fn: Handler): void {
    this.#handlers = this.#handlers.filter((h) => h !== fn)
  }

  public play(): void {
    this.#isRunning = true
    this.#start = performance.now()
    this.#time = this.#start
    this.#elapsed = this.#keepElapsed + (this.#time - this.#start)
    this.#delta = 16
    if (this.#enable && this.#isClient) {
      this.#rafId = requestAnimationFrame(this.#update)
    }
  }

  public pause(): void {
    this.#isRunning = false
    this.#keepElapsed = this.#elapsed
  }

  public stop(): void {
    this.#isRunning = false
    this.#keepElapsed = 0
    this.#elapsed = 0
    this.#removeEvents()
    if (this.#enable && this.#isClient && this.#rafId) {
      cancelAnimationFrame(this.#rafId)
      this.#rafId = null
    }
  }

  public raf(t: number): void {
    this.#delta = t - (this.#time || t)
    this.#time = t
    this.#elapsed = this.#keepElapsed + (this.#time - this.#start)
    this.#onUpdateObj.delta = this.#delta
    this.#onUpdateObj.time = this.#time
    this.#onUpdateObj.elapsed = this.#elapsed
    for (const h of this.#handlers) h(this.#onUpdateObj)
  }

  #initEvents(): void {
    if (this.#isClient) {
      document.addEventListener("visibilitychange", this.#handleVisibility)
    }
  }

  #removeEvents(): void {
    if (this.#isClient) {
      document.removeEventListener("visibilitychange", this.#handleVisibility)
    }
  }

  #handleVisibility = (): void => {
    document.hidden ? this.pause() : this.play()
  }

  #update = (t = performance.now()): void => {
    if (!this.#isRunning) return
    if (this.#enable && this.#isClient) {
      this.#rafId = requestAnimationFrame(this.#update)
    }
    this.raf(t)
  }
}
