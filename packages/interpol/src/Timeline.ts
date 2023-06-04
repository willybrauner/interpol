import { Interpol } from "./Interpol"
import { Ticker, deferredPromise, round, clamp } from "@psap/utils"
import { IInterpolConstruct } from "./core/types"

import debug from "@wbe/debug"
const log = debug("interpol:Timeline")

interface IAdd {
  interpol: Interpol
  offsetPosition: number
  startPositionInTl: number
  endPositionInTl: number
  isLastOfTl: boolean
  play?: boolean
  position?: number
}

let TL_ID = 0

export class Timeline {
  public progress = 0
  public time = 0
  protected adds: IAdd[] = []
  protected onCompleteDeferred = deferredPromise()
  protected ticker = new Ticker()
  protected tlDuration: number = 0
  protected debugEnable: boolean
  public readonly tlId: number
  protected onUpdate: ({ time, progress }) => void
  protected onComplete: ({ time, progress }) => void
  protected playing = false
  public get isPlaying() {
    return this.playing
  }
  protected _isReversed = false
  public get isReversed() {
    return this._isReversed
  }
  protected _isPause = false

  constructor({
    onUpdate = () => {},
    onComplete = () => {},
    debug = false,
  }: {
    onUpdate?: ({ time, progress }) => void
    onComplete?: ({ time, progress }) => void
    debug?: boolean
  } = {}) {
    this.onUpdate = onUpdate
    this.onComplete = onComplete
    this.debugEnable = debug
    this.ticker.debugEnable = debug
    this.tlId = ++TL_ID
  }

  /**
   * Add a new interpol obj or instance in Timeline
   */
  public add(interpol: Interpol | IInterpolConstruct, offsetPosition: number = 0): Timeline {
    // Create Interpol instance or not
    const itp = interpol instanceof Interpol ? interpol : new Interpol(interpol)
    // Stop first to avoid, if "paused: false" is set, to run play() method
    itp.stop()
    // compute from to and duration
    itp.refreshComputedValues()
    // Bind Timeline ticker to each interpol instance
    itp.ticker = this.ticker
    // Specify that we use the itp in Timeline context
    itp.inTl = true
    // only active debug on each itp, if is enabled on the timeline
    if (this.debugEnable) itp.debugEnable = this.debugEnable
    // register full TL duration
    this.tlDuration += itp._duration + offsetPosition
    // get last prev of the list
    const prevAdd = this.adds?.[this.adds.length - 1]
    // if not, prev, this is the 1st, start position is 0 else, origin is the prev end + offset
    let startPositionInTl: number = prevAdd ? prevAdd.endPositionInTl + offsetPosition : 0
    // calc end position in TL (start pos + duration of interpolation)
    const endPositionInTl = startPositionInTl + itp._duration
    // update all "isLastOfTl" property
    for (let i = 0; i < this.adds.length; i++) this.adds[i].isLastOfTl = false
    // push new Add instance in local
    this.adds.push({
      interpol: itp,
      offsetPosition,
      startPositionInTl,
      endPositionInTl,
      isLastOfTl: true,
    })
    this.log("adds", this.adds)
    return this
  }

  public async play(): Promise<any> {
    await this._play()
  }
  protected async _play(
    createNewFullCompletePromise = true,
    isReversedState = false
  ): Promise<any> {
    if (!this.adds.length) {
      console.warn("No Interpol instance added to this TimeLine, return")
      return
    }

    if (this.isPlaying) {
      this._isReversed = isReversedState
      if (createNewFullCompletePromise) this.onCompleteDeferred = deferredPromise()
      return this.onCompleteDeferred.promise
    }

    this.log("play")
    this.playing = true
    this._isPause = false
    this.ticker.play()
    this.ticker.onUpdateEmitter.on(this.handleTickerUpdate)
    if (createNewFullCompletePromise) this.onCompleteDeferred = deferredPromise()
    return this.onCompleteDeferred.promise
  }

  public async replay(): Promise<any> {
    this.log("replay")
    this.playing = true
    this.stop()
    await this.play()
  }

  public pause(): void {
    this.log("pause")
    this.playing = false
    this._isPause = true
    for (let i = 0; i < this.adds.length; i++) this.adds[i].interpol.pause()
    this.ticker.onUpdateEmitter.off(this.handleTickerUpdate)
    this.ticker.pause()
  }

  public stop(): void {
    this._stop()
  }
  protected _stop(): void {
    this.log("stop")
    this.progress = 0
    this.time = 0
    this.playing = false
    this._isPause = false
    this._isReversed = false
    for (let i = 0; i < this.adds.length; i++) this.adds[i].interpol.stop()
    this.ticker.onUpdateEmitter.off(this.handleTickerUpdate)
    this.ticker.stop()
  }

  public reverse(r?: boolean): Promise<any> {
    this._isReversed = r ?? !this._isReversed
    // if stop
    if (!this.isPlaying && !this._isPause) {
      this.time = this._isReversed ? this.tlDuration : 0
      this.progress = this._isReversed ? 1 : 0
    }

    this.log("reverse()", {
      _isReverse: this._isReversed,
      time: this.time,
      progress: this.progress,
    })
    return this._play(true, this._isReversed)
  }

  protected handleTickerUpdate = async ({ delta }) => {
    if (!this.ticker.isRunning) return

    // delta sign depend of reverse state
    delta = this._isReversed ? -delta : delta

    // clamp elapse time with full duration
    this.time = clamp(0, this.tlDuration, this.time + delta)
    this.progress = clamp(0, round(this.time / this.tlDuration), 1)

    // exe on update with TL properties
    this.onUpdate?.({ progress: this.progress, time: this.time })
    this.log("onUpdate", { progress: this.progress, time: this.time })

    // Filter only adds who are matching with elapsed time
    // It allows playing superposed itp in case of negative offset
    const filtered = this.adds.filter((e) =>
      !this._isReversed
        ? e.startPositionInTl <= this.time && this.time < e.endPositionInTl
        : e.startPositionInTl < this.time && this.time <= e.endPositionInTl
    )

    // play filtered interpol(s)
    // reverse instead of play because, reverse return play() with direction
    for (let i = 0; i < filtered.length; i++) {
      const instance = filtered[i].interpol
      instance.reverse(this._isReversed)
    }

    // stop at the end
    if (!filtered.length) {
      this.onComplete?.({ time: this.time, progress: this.progress })
      // stop and reset after onComplete
      this.onCompleteDeferred.resolve()
      this.stop()
    }
  }
  /**
   * Log util
   * Active @wbe/debug only if debugEnable is true
   */
  protected log(...rest): void {
    if (this.debugEnable) log(this.tlId, ...rest)
  }
}
