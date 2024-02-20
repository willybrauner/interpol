import { isServer } from "./env"

type TickParams = {
  delta: number
  time: number
  elapsed: number
}

/**
 * Ticker
 */
export class Ticker {
  #isRunning = false
  public get isRunning() {
    return this.#isRunning
  }

  #handlers: ((e: TickParams) => void)[]
  #onUpdateObject: TickParams
  #start: number
  #time: number
  #elapsed: number
  #keepElapsed: number
  #delta: number
  #debug: boolean
  #rafId: number
  #enable: boolean
  #isServer: boolean

  constructor({ debug = false } = {}) {
    this.#debug = debug
    this.#handlers = []
    this.#onUpdateObject = { delta: null, time: null, elapsed: null }
    this.#keepElapsed = 0
    this.#enable = true
    this.#isServer = isServer()
    this.#initEvents()
    // wait a frame in case disableRaf is set to true
    setTimeout(() => this.play(), 0)
  }

  public add(handler): void {
    this.#handlers.push(handler)
  }

  public remove(handler: Function): void {
    this.#handlers = this.#handlers.filter((obj) => obj !== handler)
  }

  public disable(): void {
    this.#enable = false
  }

  #requestRaf(callback: FrameRequestCallback): number {
    return this.#isServer ? setTimeout(callback, 16) : requestAnimationFrame(callback)
  }

  #cancelRaf(rafId: number): void {
    return this.#isServer ? clearTimeout(rafId) : cancelAnimationFrame(rafId)
  }

  #initEvents(): void {
    if (!this.#isServer) {
      document.addEventListener("visibilitychange", this.#handleVisibility)
    }
  }

  #removeEvents(): void {
    if (!this.#isServer) {
      document.removeEventListener("visibilitychange", this.#handleVisibility)
    }
  }

  #handleVisibility = (): void => {
    document.hidden ? this.pause() : this.play()
  }

  public play(): void {
    this.#isRunning = true
    this.#start = performance.now()
    this.#time = this.#start
    this.#elapsed = this.#keepElapsed + (this.#time - this.#start)
    this.#delta = 16
    if (this.#enable) this.#rafId = this.#requestRaf(this.update)
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
    if (this.#rafId && this.#enable) {
      this.#cancelRaf(this.#rafId)
      this.#rafId = null
    }
  }

  protected update = (t = performance.now()): void => {
    if (!this.#isRunning) return
    if (this.#enable) this.#rafId = this.#requestRaf(this.update)
    this.raf(t)
  }

  public raf(t: number): void {
    this.#delta = t - (this.#time || t)
    this.#time = t
    this.#elapsed = this.#keepElapsed + (this.#time - this.#start)
    this.#onUpdateObject.delta = this.#delta
    this.#onUpdateObject.time = this.#time
    this.#onUpdateObject.elapsed = this.#elapsed
    for (const h of this.#handlers) h(this.#onUpdateObject)
  }
}
