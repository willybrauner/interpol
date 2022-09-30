import { IInterpolConstruct, Interpol, IUpdateParams } from "./Interpol"
import { deferredPromise } from "./helpers/deferredPromise"
import Ticker from "./Ticker"
import debug from "@wbe/debug"
import { clamp } from "./helpers/clamp"
import { round } from "./helpers/round"
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
  public advancement = 0
  public time = 0
  protected adds: IAdd[] = []
  protected onFullCompleteDeferred = deferredPromise()
  protected ticker = new Ticker()
  protected tlDuration: number = 0
  protected debugEnable: boolean
  public readonly tlId: number
  protected repeat: number
  protected repeatCounter: number = 0
  protected onUpdate: ({ time, advancement }) => void
  protected onComplete: ({ time, advancement }) => void
  protected onRepeatComplete: () => void
  protected paused = false
  public get isPaused() {
    return this.paused
  }
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
    paused = true,
    repeat = 0,
    onUpdate = () => {},
    onComplete = () => {},
    onRepeatComplete = () => {},
    debug = false,
  }: {
    paused?: boolean
    repeat?: number
    onUpdate?: ({ time, advancement }) => void
    onComplete?: ({ time, advancement }) => void
    onRepeatComplete?: () => void
    debug?: boolean
  } = {}) {
    this.paused = paused
    this.repeat = repeat
    this.onUpdate = onUpdate
    this.onComplete = onComplete
    this.onRepeatComplete = onRepeatComplete
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
    // return instance
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
      if (createNewFullCompletePromise) this.onFullCompleteDeferred = deferredPromise()
      return this.onFullCompleteDeferred.promise
    }

    this.log("play")
    this.playing = true
    this._isPause = true
    this.ticker.play()
    this.ticker.onUpdateEmitter.on(this.handleTickerUpdate)
    if (createNewFullCompletePromise) this.onFullCompleteDeferred = deferredPromise()
    return this.onFullCompleteDeferred.promise
  }

  protected handleTickerUpdate = async ({ delta }) => {
    if (!this.ticker.isRunning) return

    // delta sign depend of reverse state
    delta = this._isReversed ? -delta : delta

    // clamp elapse time with full duration
    this.time = clamp(0, this.tlDuration, this.time + delta)
    this.advancement = clamp(0, round(this.time / this.tlDuration), 1)

    // exe on update with TL properties
    this.onUpdate?.({ advancement: this.advancement, time: this.time })
    this.log("onUpdate", { advancement: this.advancement, time: this.time })

    // Filter only adds who are matching with elapsed time
    // It allows playing superposed itp in case of negative offset
    const filtered = this.adds.filter((e) =>
      !this._isReversed
        ? e.startPositionInTl <= this.time && this.time < e.endPositionInTl
        : e.startPositionInTl < this.time && this.time <= e.endPositionInTl
    )

    // play filtered interpol(s)
    for (let i = 0; i < filtered.length; i++) {
      const instance = filtered[i].interpol
      log("this._isReversed", this._isReversed)
      instance.reverse(this._isReversed)
      instance.play()
    }

    // stop at the end
    if (!filtered.length) {
      this.onComplete?.({ time: this.time, advancement: this.advancement })

      // repeat logic
      const repeatInfinitely = this.repeat < 0
      const needToRepeat = this.repeat > 0 && this.repeatCounter + 1 < this.repeat
      if (repeatInfinitely) {
        this.replay()
        return
      }
      if (needToRepeat) {
        this.repeatCounter++
        this.log("Have been repeated", this.repeatCounter)
        this._stop(false)
        this._play(false)
        return
      }
      if (!needToRepeat && this.repeat !== 0) {
        this.repeatCounter++
        this.log("End repeats!", this.repeatCounter)
        this.onRepeatComplete?.()
        // and continue...
      }

      // If repeat is active, we want to resolve onComplete promise only
      // when all repeats are complete
      if (!repeatInfinitely && !needToRepeat) {
        this.onFullCompleteDeferred.resolve()
        this.log("this.onFullCompleteDeferred.resolve")
      }

      // stop and reset after onComplete
      // ! need to stop after repeat logic because stop() will reset repeatCounter
      this.log("This is the Timeline end, stop")
      this.stop()
    }
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

  protected _stop(resetRepeatCounter = true): void {
    this.log("stop")
    this.advancement = 0
    this.time = 0
    this.playing = false
    this._isPause = false
    this._isReversed = false
    for (let i = 0; i < this.adds.length; i++) this.adds[i].interpol.stop()
    this.ticker.onUpdateEmitter.off(this.handleTickerUpdate)
    if (resetRepeatCounter) this.repeatCounter = 0
    this.ticker.stop()
  }

  public reverse(r?: boolean) {
    this._isReversed = r ?? !this._isReversed
    // if stop
    if (!this.isPlaying && !this._isPause) {
      this.time = this._isReversed ? this.tlDuration : 0
      this.advancement = this._isReversed ? 1 : 0
    }

    this.log("reverse()", {
      _isReverse: this._isReversed,
      time: this.time,
      advancement: this.advancement,
    })
    return this._play(true, this._isReversed)
  }

  /**
   * Log util
   * Active @wbe/debug only if debugEnable is true
   */
  protected log(...rest): void {
    if (this.debugEnable) log(this.tlId, ...rest)
  }
}
