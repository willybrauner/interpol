import { Interpol } from "./Interpol"
import { InterpolConstruct, Props, TimelineConstruct } from "./types"
import { Ticker } from "./Ticker"
import { deferredPromise } from "../utils/deferredPromise"
import { clamp } from "../utils/clamp"
import { round } from "../utils/round"
import { noop } from "../utils/noop"
import { engine } from "./engine"

export interface IAdd {
  itp: Interpol
  time: { start: number; end: number; offset: number }
  progress: { start?: number; end?: number; current: number; last: number }
  _isAbsoluteOffset?: boolean
}

let TL_ID = 0

export class Timeline {
  public readonly ID: number
  #progress = 0
  #time = 0
  public get time(): number {
    return this.#time
  }
  #isPlaying = false
  public get isPlaying(): boolean {
    return this.#isPlaying
  }
  #isReversed = false
  public get isReversed(): boolean {
    return this.#isReversed
  }
  #isPaused = false
  public get isPaused(): boolean {
    return this.#isPaused
  }
  #adds: IAdd[] = []
  public get adds(): IAdd[] {
    return this.#adds
  }
  #tlDuration: number = 0
  public get duration(): number {
    return this.#tlDuration
  }
  #ticker: Ticker
  public get ticker(): Ticker {
    return this.#ticker
  }

  #playFrom = 0
  #reverseFrom = 1
  #onCompleteDeferred = deferredPromise()
  #debugEnable: boolean
  #onUpdate: (time: number, progress: number) => void
  #onComplete: (time: number, progress: number) => void
  #lastTlProgress = 0
  #reverseLoop = false

  constructor({
    onUpdate = noop,
    onComplete = noop,
    debug = false,
    paused = false,
  }: TimelineConstruct = {}) {
    this.#onUpdate = onUpdate
    this.#onComplete = onComplete
    this.#debugEnable = debug
    this.#isPaused = paused
    this.ID = ++TL_ID
    this.#ticker = engine.ticker
    // waiting for all adds register before log
    setTimeout(() => this.#log("adds", this.#adds), 1)
  }

  /**
   * Add a new interpol obj or instance in Timeline or a callback function
   * @param interpol Interpol | InterpolConstruct<K> | (() => void),
   * @param offset Default "0" is relative position in TL
   */
  public add<K extends keyof Props>(
    interpol: Interpol | InterpolConstruct<K> | (() => void),
    offset: number | string = "0",
  ): Timeline {
    // Prepare the new Interpol instance
    // If interpol param is a callback function, we transform it to an Interpol instance
    if (typeof interpol === "function") {
      interpol = new Interpol({ duration: 0, onComplete: interpol })
    }
    const itp = interpol instanceof Interpol ? interpol : new Interpol<K>(interpol)
    itp.stop()
    itp.refresh()
    itp.ticker = this.#ticker
    itp.inTl = true
    if (this.#debugEnable) itp.debugEnable = this.#debugEnable

    let fOffset: number
    let startTime: number
    const factor: number = engine.durationFactor

    // Relative position in TL
    if (typeof offset === "string") {
      fOffset = parseFloat(offset.includes("=") ? offset.split("=").join("") : offset) * factor
      const relativeAdds = this.#adds.filter((add) => !add._isAbsoluteOffset)

      const prevAdd =
        relativeAdds?.length > 0
          ? // get previous relative add add with the biggest end time
            relativeAdds.reduce((a, b) => (b.time.end > a.time.end ? b : a))
          : // or get the previous (absolute)
            this.#adds?.[this.#adds.length - 1] || null

      this.#tlDuration = Math.max(this.#tlDuration, this.#tlDuration + itp.duration + fOffset)
      startTime = prevAdd ? prevAdd.time.end + fOffset : fOffset
    }
    // Absolute position in TL
    else if (typeof offset === "number") {
      fOffset = offset * factor
      this.#tlDuration = Math.max(0, this.#tlDuration, fOffset + itp.duration)
      startTime = fOffset ?? 0
    }

    // push new Add instance in local
    this.#adds.push({
      itp,
      time: {
        start: startTime,
        end: startTime + itp.duration,
        offset: fOffset,
      },
      progress: {
        start: null,
        end: null,
        current: 0,
        last: 0,
      },
      _isAbsoluteOffset: typeof offset === "number",
    })

    // Re Calc all progress start and end after each add register,
    // because we need to know the full TL duration for this calc
    this.#onAllAdds((currAdd, i) => {
      this.#adds[i].progress.start = currAdd.time.start / this.#tlDuration || 0
      this.#adds[i].progress.end = currAdd.time.end / this.#tlDuration || 0
    })

    // hack needed because we need to waiting all adds register if this is an autoplay
    if (!this.isPaused) setTimeout(() => this.play(), 0)

    // return the Timeline instance to chain methods
    return this
  }

  public async play(from: number = 0): Promise<any> {
    this.#playFrom = from
    if (this.#isPlaying && this.#isReversed) {
      this.#isReversed = false
      return this.#onCompleteDeferred.promise
    }
    if (this.#isPlaying) {
      this.#time = this.#tlDuration * from
      this.#progress = from
      this.#isReversed = false
      return this.#onCompleteDeferred.promise
    }
    this.#time = this.#tlDuration * from
    this.#progress = from
    this.#isReversed = false
    this.#isPlaying = true
    this.#isPaused = false
    this.#ticker.add(this.#handleTick)
    this.#onCompleteDeferred = deferredPromise()
    return this.#onCompleteDeferred.promise
  }

  public async reverse(from: number = 1): Promise<any> {
    this.#reverseFrom = from
    // If TL is playing in normal direction, change to reverse and return a new promise
    if (this.#isPlaying && !this.#isReversed) {
      this.#isReversed = true
      this.#onCompleteDeferred = deferredPromise()
      return this.#onCompleteDeferred.promise
    }
    // If is playing reverse, restart reverse
    if (this.#isPlaying && this.#isReversed) {
      this.stop()
      return await this.reverse(from)
    }

    this.#time = this.#tlDuration * from
    this.#progress = from
    this.#isReversed = true
    this.#isPlaying = true
    this.#isPaused = false

    this.#ticker.add(this.#handleTick)
    this.#onCompleteDeferred = deferredPromise()
    return this.#onCompleteDeferred.promise
  }

  public pause(): void {
    this.#isPlaying = false
    this.#isPaused = true
    this.#onAllAdds((e) => e.itp.pause())
    this.#ticker.remove(this.#handleTick)
  }

  public resume(): void {
    if (!this.#isPaused) return
    this.#isPaused = false
    this.#isPlaying = true
    this.#onAllAdds((e) => e.itp.resume())
    this.#ticker.add(this.#handleTick)
  }

  public stop(): void {
    this.#progress = 0
    this.#time = 0
    this.#isPlaying = false
    this.#isPaused = false
    this.#isReversed = false
    this.#onAllAdds((e) => e.itp.stop())
    this.#ticker.remove(this.#handleTick)
  }

  public progress(value?: number, suppressEvents = true, suppressTlEvents = true): number | void {
    if (value === undefined) return this.#progress
    if (this.#isPlaying) this.pause()
    this.#progress = clamp(0, value, 1)
    this.#time = clamp(0, this.#tlDuration * this.#progress, this.#tlDuration)
    this.#updateAdds(this.#time, this.#progress, suppressEvents)
    if (value === 1 && !suppressTlEvents) {
      this.#onComplete(this.#time, this.#progress)
    }
  }

  public refresh(): void {
    this.#onAllAdds((e) => e.itp.refresh())
  }

  /**
   * @deprecated use refresh() instead
   */
  public refreshComputedValues(): void {
    console.warn(`Timeline.refreshComputedValues() is deprecated. Use Timeline.refresh() instead.`)
    this.refresh()
  }

  /**
   * Handle Tick
   * On each tick
   * - update time and progress
   * - update all adds
   * - check if is completed
   * @param delta
   * @private
   */
  // prettier-ignore
  #handleTick = async ({ delta }): Promise<any> => {
    this.#time = clamp(0, this.#tlDuration, this.#time + (this.#isReversed ? -delta : delta))
    this.#progress = clamp(0, round(this.#time / this.#tlDuration), 1)
    this.#updateAdds(this.#time, this.#progress, false)
    // on play complete
    if ((!this.#isReversed && this.#progress === 1) || this.#tlDuration === 0) {
      this.#onComplete(this.#time, this.#progress)
      this.#onCompleteDeferred.resolve()
      this.stop()
    }
    // on reverse complete
    if ((this.#isReversed && this.#progress === 0) || this.#tlDuration === 0) {
      this.#onCompleteDeferred.resolve()
      this.stop()
    }
  }

  /**
   * Update all adds (itps)
   * Main update function witch progress all adds on there relative time in TL
   * @param tlTime
   * @param tlProgress
   * @param suppressEvents
   */
  #updateAdds(tlTime: number, tlProgress: number, suppressEvents = true): void {
    // Determine if the Adds loop should be reversed
    if (this.#lastTlProgress > tlProgress && !this.#reverseLoop) this.#reverseLoop = true
    if (this.#lastTlProgress < tlProgress && this.#reverseLoop) this.#reverseLoop = false
    this.#lastTlProgress = tlProgress
    // Call constructor onUpdate
    this.#onUpdate(tlTime, tlProgress)
    // Then progress all itps
    this.#onAllAdds((add) => {
      // Register last and current progress in current add
      add.progress.last = add.progress.current
      // For callbacks with duration 0, trigger when tlTime >= start time
      // In other case, calculate the current progress
      // prettier-ignore
      add.progress.current =
        add.itp.duration === 0
          ? tlTime >= add.time.start ? 1 : 0
          : (tlTime - add.time.start) / add.itp.duration
      // progress current itp
      add.itp.progress(add.progress.current, suppressEvents)
    }, this.#reverseLoop)
  }

  /**
   * Exe Callback function on all adds
   * Need to call from 0 to x or x to 0, depends on reversed state
   * @param {(add: IAdd, i?: number) => void} cb
   * @param {boolean} reverse Call from X to 0 index
   */
  #onAllAdds(cb: (add: IAdd, i?: number) => void, reverse: boolean = false): void {
    const startIndex = reverse ? this.#adds.length - 1 : 0
    const endIndex = reverse ? -1 : this.#adds.length
    const step = reverse ? -1 : 1
    for (let i = startIndex; i !== endIndex; i += step) cb(this.#adds[i], i)
  }

  /**
   * Log util
   * Active @wbe/debug only if debugEnable is true
   * @param rest
   */
  #log(...rest: any[]): void {
    this.#debugEnable && console.log(`%ctimeline`, `color: rgb(217,50,133)`, this.ID || "", ...rest)
  }
}
