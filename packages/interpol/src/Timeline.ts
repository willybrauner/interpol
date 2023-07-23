import { Interpol } from "./Interpol"
import { IInterpolConstruct, Props } from "./core/types"
import { Ticker } from "./core/Ticker"
import { deferredPromise } from "./core/deferredPromise"
import { clamp } from "./core/clamp"
import { round } from "./core/round"

import debug from "@wbe/debug"
import { noop } from "./core/noop"
const log = debug("interpol:Timeline")

interface IAdd {
  itp: Interpol
  offsetPosition: number
  startPos: number
  endPos: number
  isLastOfTl: boolean
  play?: boolean
  position?: number
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

  constructor({
    onUpdate = noop,
    onComplete = noop,
    debug = false,
    ticker = new Ticker(),
    paused = false,
  }: {
    onUpdate?: (time: number, progress: number) => void
    onComplete?: (time: number, progress: number) => void
    debug?: boolean
    ticker?: Ticker
    paused?: boolean
  } = {}) {
    this.#onUpdate = onUpdate
    this.#onComplete = onComplete
    this.#debugEnable = debug
    this.#ticker = ticker
    this.#isPaused = paused
    this.ID = ++TL_ID
  }

  /**
   * Add a new interpol obj or instance in Timeline
   * @param interpol
   * @param offsetPosition
   */
  public add<K extends keyof Props>(
    interpol: Interpol | IInterpolConstruct<K>,
    offsetPosition: number = 0
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
    // Register full TL duration
    this.#tlDuration += itp.duration + offsetPosition
    // Get last prev of the list
    const prevAdd = this.#adds?.[this.#adds.length - 1]
    // If not, prev, this is the 1st, start position is 0 else, origin is the prev end + offset
    const startPos = prevAdd ? prevAdd.endPos + offsetPosition : 0
    // Calc end position in TL (start pos + duration of interpolation)
    const endPos = startPos + itp.duration
    // Update all "isLastOfTl" property
    this.#onAllAdds((add) => (add.isLastOfTl = false))
    // push new Add instance in local
    this.#adds.push({
      itp,
      startPos,
      endPos,
      offsetPosition,
      isLastOfTl: true,
    })
    this.#log("adds", this.#adds)

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

    this.#ticker.play()
    this.#ticker.onTick.on(this.#handleTick)
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

    this.#ticker.play()
    this.#ticker.onTick.on(this.#handleTick)
    this.#onCompleteDeferred = deferredPromise()
    return this.#onCompleteDeferred.promise
  }

  public pause(): void {
    this.#isPlaying = false
    this.#isPaused = true
    this.#onAllAdds((e) => e.itp.pause())
    this.#ticker.onTick.off(this.#handleTick)
    this.#ticker.pause()
  }

  public resume(): void {
    if (!this.#isPaused) return
    this.#isPaused = false
    this.#isPlaying = true
    this.#onAllAdds((e) => e.itp.resume())
    this.#ticker.onTick.on(this.#handleTick)
    this.#ticker.play()
  }

  public stop(): void {
    this.#progress = 0
    this.#time = 0
    this.#isPlaying = false
    this.#isPaused = false
    this.#isReversed = false
    this.#onAllAdds((e) => e.itp.stop())
    this.#ticker.onTick.off(this.#handleTick)
    this.#ticker.stop()
  }

  public seek(progress: number): void {
    this.#progress = clamp(0, progress, 1)
    this.#time = clamp(0, this.#tlDuration * this.#progress, this.#tlDuration)
    this.#updateAdds(this.#progress, this.#time)
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
    if (!this.#ticker.isRunning) return
    this.#time = clamp(0, this.#tlDuration, this.#time + (this.#isReversed ? -delta : delta))
    this.#progress = clamp(0, round(this.#time / this.#tlDuration), 1)
    this.#updateAdds(this.#progress, this.#time)

    if ((!this.#isReversed && this.#progress === 1) || (this.#isReversed && this.#progress === 0)) {
      this.#onComplete(this.#time, this.#progress)
      this.#onCompleteDeferred.resolve()
      this.stop()
    }
  }

  /**
   * Update all adds (itps)
   * Main update function witch seek all adds on there relative position in TL
   * @param progress
   * @param time
   */
  #updateAdds(progress: number, time: number): void {
    this.#onUpdate(progress, time)
    this.#onAllAdds((add) => {
      add.itp.seek((time - add.startPos) / add.itp.duration)
    })
  }

  /**
   * Exe Callback function on all adds
   * @param cb
   */
  #onAllAdds(cb: (add: IAdd) => void): void {
    for (let i = 0; i < this.#adds.length; i++) cb(this.#adds[i])
  }

  /**
   * Log util
   * Active @wbe/debug only if debugEnable is true
   * @param rest
   */
  #log(...rest): void {
    if (this.#debugEnable) log(this.ID, ...rest)
  }
}
