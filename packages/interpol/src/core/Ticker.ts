import { isClient, isServer } from "./env"

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

  handlers: ((e: TickParams) => void)[]
  #onUpdateObject: TickParams
  #start: number
  #time: number
  #elapsed: number
  #keepElapsed: number
  #delta: number
  #debug: boolean
  #rafId: number
  #enableRaf: boolean

  constructor({ debug = false } = {}) {
    this.#debug = debug
    this.handlers = []
    this.#onUpdateObject = { delta: null, time: null, elapsed: null }
    this.#keepElapsed = 0
    this.#enableRaf = true
    this.#initEvents()
    this.play()
  }

  public add(handler): void {
    this.handlers.push(handler)
  }

  public remove(handler: Function): void {
    this.handlers = this.handlers.filter((obj) => obj !== handler)
  }

  #requestRaf = () => (isServer() ? (c) => setTimeout(c, 16) : requestAnimationFrame)
  #cancelRaf = () => (isServer() ? (c) => {} : cancelAnimationFrame)

  public disableRaf(): void {
    this.#enableRaf = false
  }

  #initEvents(): void {
    if (isClient()) {
      document.addEventListener("visibilitychange", this.handleVisibilityChange)
      document.addEventListener("pageshow", this.handlePageShow)
    }
  }
  #removeEvents(): void {
    if (isClient()) {
      document.removeEventListener("visibilitychange", this.handleVisibilityChange)
      document.removeEventListener("pageshow", this.handlePageShow)
    }
  }

  public handleVisibilityChange = (): void => {
    document.hidden ? this.pause() : this.play()
  }

  public handlePageShow = (): void => {
    if (!this.#isRunning) this.play()
  }

  public play(): void {
    this.#isRunning = true
    this.#start = performance.now()
    this.#time = this.#start
    this.#elapsed = this.#keepElapsed + (this.#time - this.#start)
    this.#delta = 16
    // wait a frame in case disableRaf is set to true
    setTimeout(() => {
      if (this.#enableRaf) this.#rafId = this.#requestRaf()(this.update)
    }, 0)
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
    if (this.#rafId && this.#enableRaf) {
      this.#cancelRaf()(this.#rafId)
      this.#rafId = null
    }
  }

  protected update = (t = performance.now()): void => {
    if (!this.#isRunning) return
    if (this.#enableRaf) this.#rafId = this.#requestRaf()(this.update)
    this.raf(t)
  }

  public raf(t: number) {
    this.#delta = t - (this.#time || t)
    this.#time = t
    this.#elapsed = this.#keepElapsed + (this.#time - this.#start)
    this.#onUpdateObject.delta = this.#delta
    this.#onUpdateObject.time = this.#time
    this.#onUpdateObject.elapsed = this.#elapsed
    for (const h of this.handlers) h(this.#onUpdateObject)
  }
}
