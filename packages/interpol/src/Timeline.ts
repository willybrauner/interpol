import { Interpol } from "./Interpol"
import { InterpolConstruct, Props, TimelineConstruct } from "./core/types"
import { Ticker } from "./core/Ticker"
import { deferredPromise } from "./core/deferredPromise"
import { clamp } from "./core/clamp"
import { round } from "./core/round"
import { noop } from "./core/noop"
import { InterpolOptions } from "./options"

interface IAdd {
  itp: Interpol
  time: { start: number; end: number; offset: number }
  progress: { start?: number; end?: number; current: number; last: number }
}

let TL_ID = 0

export class Timeline {
  public readonly ID: number
  #progress = 0
  public get progress(): number {
    return this.#progress
  }
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
  #playFrom = 0
  #reverseFrom = 1
  #onCompleteDeferred = deferredPromise()
  #ticker: Ticker
  #tlDuration: number = 0
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
    this.#ticker = InterpolOptions.ticker

    // waiting for all adds register before log
    setTimeout(() => this.#log("adds", this.#adds), 1)
  }

  /**
   * Add a new interpol obj or instance in Timeline
   * @param interpol
   * @param offset Default "0" is relative position in TL
   */
  public add<K extends keyof Props>(
    interpol: Interpol | InterpolConstruct<K>,
    offset: number | string = "0",
  ): Timeline {
    // Create Interpol instance or not
    const itp = interpol instanceof Interpol ? interpol : new Interpol<K>(interpol)
    // Stop first to avoid to run play() method if "paused: false" is set
    itp.stop()
    // Compute from to and duration
    itp.refreshComputedValues()
    // Bind Timeline ticker to each interpol instance
    itp.ticker = this.#ticker
    // Specify that we use the itp in Timeline context
    itp.inTl = true
    // Only active debug on each itp, if is enabled on the timeline
    if (this.#debugEnable) itp.debugEnable = this.#debugEnable
    // Get prev add of the list
    const prevAdd = this.#adds?.[this.#adds.length - 1]

    // Register full TL duration
    // calc offset, could be a string like
    // relative position {string} "-=100" | "-100" | "100" | "+=100" | "+100"
    // absolute position {number} 100 | -100
    let fOffset: number
    let startTime: number

    // Relative position in TL
    if (typeof offset === "string") {
      fOffset = parseFloat(offset.includes("=") ? offset.split("=").join("") : offset)
      this.#tlDuration = Math.max(this.#tlDuration, this.#tlDuration + itp.duration + fOffset)
      startTime = prevAdd ? prevAdd.time.end + fOffset : 0
    }

    // absolute position in TL
    else if (typeof offset === "number") {
      fOffset = offset
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
      return
    }

    if (this.#isPlaying) {
      this.stop()
      return await this.play(from)
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
    // If TL is playing in normal direction, change to reverse and return
    if (this.#isPlaying && !this.#isReversed) {
      this.#isReversed = true
      return
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

  public seek(progress: number, suppressEvents = true, suppressTlEvents = true): void {
    if (this.#isPlaying) this.pause()
    this.#progress = clamp(0, progress, 1)
    this.#time = clamp(0, this.#tlDuration * this.#progress, this.#tlDuration)
    this.#updateAdds(this.#time, this.#progress, suppressEvents)
    if ((progress === 0 || progress === 1) && !suppressTlEvents) {
      this.#onComplete(this.#time, this.#progress)
    }
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
  #handleTick = async ({ delta }): Promise<any> => {
    this.#time = clamp(0, this.#tlDuration, this.#time + (this.#isReversed ? -delta : delta))
    this.#progress = clamp(0, round(this.#time / this.#tlDuration), 1)
    this.#updateAdds(this.#time, this.#progress, false)
    // prettier-ignore
    if (
      (!this.#isReversed && this.#progress === 1)
      || (this.#isReversed && this.#progress === 0)
      || this.#tlDuration === 0
    ) {
      this.#onComplete(this.#time, this.#progress)
      this.#onCompleteDeferred.resolve()
      this.stop()
    }
  }

  /**
   * Update all adds (itps)
   * Main update function witch seek all adds on there relative time in TL
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

    // Then seek all itps
    this.#onAllAdds((add) => {
      // Register last and current progress in current add
      add.progress.last = add.progress.current
      add.progress.current = (tlTime - add.time.start) / add.itp.duration
      add.itp.seek(add.progress.current, suppressEvents)
    }, this.#reverseLoop)
  }

  /**
   * Exe Callback function on all adds
   * Need to call from 0 to x or x to 0, depends on reversed state
   * @param {(add: IAdd, i?: number) => void} cb
   * @param {boolean} reverse Call from X to 0 index
   */
  #onAllAdds(cb: (add: IAdd, i?: number) => void, reverse = false): void {
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
