import { Interpol } from "./Interpol"
import { InterpolConstruct, Meta, Props, TimelineConstruct } from "./types"
import { Ticker } from "./Ticker"
import { deferredPromise } from "../utils/deferredPromise"
import { clamp } from "../utils/clamp"
import { round } from "../utils/round"
import { noop } from "../utils/noop"
import { engine } from "./engine"

export interface IAdd {
  instance: Interpol | Timeline
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

  public ticker: Ticker
  public inTl = false
  public debugEnable: boolean
  public meta: Meta

  #playFrom = 0
  #reverseFrom = 1
  #onCompleteDeferred = deferredPromise()
  #onUpdate: (time: number, progress: number) => void
  #onComplete: (time: number, progress: number) => void
  #lastTlProgress = 0
  #reverseLoop = false
  #autoplayScheduled = false

  constructor({
    onUpdate = noop,
    onComplete = noop,
    debug = false,
    paused = false,
    meta = {},
  }: TimelineConstruct = {}) {
    this.#onUpdate = onUpdate
    this.#onComplete = onComplete
    this.debugEnable = debug
    this.#isPaused = paused
    this.meta = meta
    this.ID = ++TL_ID
    this.ticker = engine.ticker
  }

  /**
   * Add a new interpol obj or instance in Timeline or a callback function
   * @param data Timeline | Interpol | InterpolConstruct<K> | (() => void),
   * @param offset Default "0" is relative position in TL
   */
  public add<K extends keyof Props>(
    data: Timeline | Interpol | InterpolConstruct<K> | (() => void),
    offset: number | string = "0",
  ): Timeline {
    // If interpol param is a callback function, we transform it to an Interpol instance
    if (typeof data === "function") data = new Interpol({ duration: 0, onComplete: data })

    // If data is an InterpolConstruct obj, create a new Interpol instance with it
    const instance: Interpol | Timeline =
      data instanceof Interpol || data instanceof Timeline ? data : new Interpol<K>(data)

    // Stop first to fully clean up (remove tick handler, reset state)
    instance.stop()

    // Then flag as child of this timeline, set ticker and debugEnable
    instance.inTl = true
    instance.ticker = this.ticker
    instance.debugEnable = this.debugEnable
    // Propagate ticker and debugEnable to nested Timeline children
    if (instance instanceof Timeline) this.#propagateToChildrenTl(instance)

    // Start the offset calculation
    let fOffset: number
    let startTime: number
    const factor: number = engine.durationFactor

    // Calculate the relative position of the current instance in TL
    if (typeof offset === "string") {
      fOffset = parseFloat(offset.includes("=") ? offset.split("=").join("") : offset) * factor
      const relativeAdds = this.#adds.filter((add) => !add._isAbsoluteOffset)

      // Get the previous 'add' instance to calculate start time of the new one
      // If there is at least one relative add, get the one with the biggest end time
      // If there is no relative add, get the previous add (absolute) if exist, or null
      const prevAdd =
        relativeAdds?.length > 0
          ? // get previous relative add add with the biggest end time
            relativeAdds.reduce((a, b) => (b.time.end > a.time.end ? b : a))
          : // or get the previous (absolute)
            this.#adds?.[this.#adds.length - 1] || null

      this.#tlDuration = Math.max(this.#tlDuration, this.#tlDuration + instance.duration + fOffset)
      startTime = prevAdd ? prevAdd.time.end + fOffset : fOffset
    }
    // Absolute position in TL
    else if (typeof offset === "number") {
      fOffset = offset * factor
      this.#tlDuration = Math.max(0, this.#tlDuration, fOffset + instance.duration)
      startTime = fOffset ?? 0
    }

    // push new Add instance in local
    this.#adds.push({
      instance,
      time: {
        start: startTime,
        end: startTime + instance.duration,
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

    // Defer autoplay to after all chained add() calls complete.
    // Deduplicated: only one microtask is scheduled no matter how many add() calls are chained.
    if (!this.isPaused && !this.inTl && !this.#autoplayScheduled) {
      this.#autoplayScheduled = true
      queueMicrotask(() => {
        this.#autoplayScheduled = false
        this.play()
      })
    }

    // return the Timeline instance to chain methods
    return this
  }

  public async play(from: number = 0): Promise<any> {
    // If owned by a parent timeline, this instance is driven via progress()
    if (this.inTl) return

    this.#playFrom = from
    if (this.#isPlaying && this.#isReversed) {
      this.#isReversed = false
      return this.#onCompleteDeferred.promise
    }
    this.#time = this.#tlDuration * from
    this.#progress = from
    this.#isReversed = false
    this.#lastTlProgress = from
    this.#reverseLoop = false
    if (this.#isPlaying) {
      return this.#onCompleteDeferred.promise
    }
    this.#isPlaying = true
    this.#isPaused = false
    this.ticker.add(this.#handleTick)
    this.#onCompleteDeferred = deferredPromise()
    return this.#onCompleteDeferred.promise
  }

  public async reverse(from: number = 1): Promise<any> {
    // If owned by a parent timeline, this instance is driven via progress()
    if (this.inTl) return

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
    this.#lastTlProgress = from

    this.ticker.add(this.#handleTick)
    this.#onCompleteDeferred = deferredPromise()
    return this.#onCompleteDeferred.promise
  }

  public pause(): void {
    this.#isPlaying = false
    this.#isPaused = true
    this.#onAllAdds((e) => e.instance.pause())
    if (!this.inTl) this.ticker.remove(this.#handleTick)
  }

  public resume(): void {
    if (!this.#isPaused) return
    this.#isPaused = false
    this.#isPlaying = true
    this.#onAllAdds((e) => e.instance.resume())
    if (!this.inTl) this.ticker.add(this.#handleTick)
  }

  public stop(): void {
    this.#progress = 0
    this.#time = 0
    this.#isPlaying = false
    this.#isPaused = false
    this.#isReversed = false
    this.#onAllAdds((e) => {
      e.instance.stop()
      e.progress.current = 0
      e.progress.last = 0
    })
    if (!this.inTl) this.ticker.remove(this.#handleTick)
  }

  public progress(value?: number, suppressEvents = true, suppressTlEvents = true): number | void {
    if (value === undefined) return this.#progress
    if (this.#isPlaying) this.pause()
    this.#progress = clamp(0, value, 1)
    this.#time = clamp(0, this.#tlDuration * this.#progress, this.#tlDuration)
    this.#updateAdds(this.#time, this.#progress, suppressEvents, suppressTlEvents)
    if (value === 1 && !suppressTlEvents) {
      this.#onComplete(this.#time, this.#progress)
    }
  }

  public refresh(): void {
    this.#onAllAdds((e) => e.instance.refresh())
  }

  /**
   * Handle Tick
   * On each tick
   * - update time and progress
   * - update all adds
   * - check if is completed
   */
  #handleTick = ({ delta }): void => {
    // Keep #time raw (no quantization mid-animation) for accurate child add progress.
    // Only snap #time at boundaries so child adds receive exact 0/1 on completion.
    this.#time = clamp(0, this.#tlDuration, this.#time + (this.#isReversed ? -delta : delta))
    this.#progress = clamp(0, round(this.#time / this.#tlDuration), 1)
    if (this.#progress === 1) this.#time = this.#tlDuration
    if (this.#progress === 0) this.#time = 0
    this.#updateAdds(this.#time, this.#progress, false, false)
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
  #updateAdds(
    tlTime: number,
    tlProgress: number,
    suppressEvents = true,
    suppressTlEvents = true,
  ): void {
    // Determine if the Adds loop should be reversed
    if (this.#lastTlProgress > tlProgress && !this.#reverseLoop) this.#reverseLoop = true
    if (this.#lastTlProgress < tlProgress && this.#reverseLoop) this.#reverseLoop = false
    this.#lastTlProgress = tlProgress
    // Call constructor onUpdate
    this.#onUpdate(tlTime, tlProgress)
    // Then progress all itps

    // prepare loop parameters depending on reversed state
    const startIndex = this.#reverseLoop ? this.#adds.length - 1 : 0
    const endIndex = this.#reverseLoop ? -1 : this.#adds.length
    const step = this.#reverseLoop ? -1 : 1

    // don't use #onAllAdds util for performance reason
    // this loop is called on each frames
    for (let i = startIndex; i !== endIndex; i += step) {
      const add = this.#adds[i]
      // Register last and current progress in current add
      add.progress.last = add.progress.current
      // For callbacks with duration 0, trigger when tlTime >= start time
      // In other case, calculate the current progress

      // prettier-ignore
      add.progress.current =
        add.instance.duration === 0
          ? tlTime >= add.time.start ? 1 : 0
          : (tlTime - add.time.start) / add.instance.duration

      // Skip adds that are out of their time range and were already out of range.
      // This prevents inactive adds from overwriting active ones with their _from values.
      if (add.progress.current < 0 && add.progress.last <= 0) continue
      if (add.progress.current > 1 && add.progress.last > 1) continue
      // progress current itp
      add.instance.progress(add.progress.current, suppressEvents, suppressTlEvents)
    }
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
   * Propagate ticker and debugEnable to nested Timeline children
   */
  #propagateToChildrenTl(tl: Timeline): void {
    for (const add of tl.adds) {
      add.instance.ticker = this.ticker
      add.instance.debugEnable = this.debugEnable
      if (add.instance instanceof Timeline) {
        this.#propagateToChildrenTl(add.instance)
      }
    }
  }
}
