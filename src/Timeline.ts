import { IInterpolConstruct, Interpol } from "./Interpol"
import { deferredPromise } from "./helpers/deferredPromise"
import Ticker from "./Ticker"
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
  protected adds: IAdd[] = []
  protected onCompleteDeferred = deferredPromise()
  protected ticker = new Ticker()
  protected tlDuration: number = 0
  protected debugEnable: boolean
  public readonly tlId: number
  protected repeat: number
  protected repeatCounter: number = 0
  protected onComplete: () => void
  protected onRepeatComplete: () => void
  protected paused = false
  public get isPaused() {
    return this.paused
  }
  protected playing = false
  public get isPlaying() {
    return this.playing
  }

  constructor({
    paused = true,
    repeat = 0,
    onComplete = () => {},
    onRepeatComplete = () => {},
    debug = false,
  }: {
    paused?: boolean
    repeat?: number
    onComplete?: () => void
    onRepeatComplete?: () => void
    debug?: boolean
  } = {}) {
    this.paused = paused
    this.repeat = repeat
    this.onComplete = onComplete
    this.onRepeatComplete = onRepeatComplete
    this.debugEnable = debug
    this.ticker.debugEnable = debug
    this.tlId = ++TL_ID

    //  if (!this.paused) this.play()
  }

  /**
   * Add a new interpol obj or instance in Timeline
   */
  public add(interpol: Interpol | IInterpolConstruct, offsetPosition: number = 0): Timeline {
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

    // get last add of the list
    const lastAdd = this.adds[this.adds.length - 1]

    // if lastAdd exist, calc start position of this new Add, else, this is the first one
    const startPositionInTl = lastAdd
      ? lastAdd.startPositionInTl + itp._duration + offsetPosition
      : 0

    // calc end position in TL (start pos + duration of interpolation)
    const endPositionInTl = startPositionInTl + itp._duration

    // update all "isLastOfTl" property
    for (let i = 0; i < this.adds.length; i++) {
      this.adds[i].isLastOfTl = false
    }

    // push new Add instance in local
    this.adds.push({
      interpol: itp,
      offsetPosition,
      startPositionInTl,
      endPositionInTl,
      isLastOfTl: true,
    })

    this.log("adds", this.adds)

    // return all the instance allow chaining methods calls
    return this
  }

  public async play(): Promise<any> {
    await this._play()
  }

  protected async _play(createNewFullCompletePromise = true): Promise<any> {
    if (!this.adds.length) {
      console.warn("No Interpol instance added to this TimeLine, return")
      return
    }

    if (this.isPlaying) {
      if (createNewFullCompletePromise) this.onCompleteDeferred = deferredPromise()
      return this.onCompleteDeferred.promise
    }

    this.log("play")
    this.playing = true
    this.ticker.play()
    this.ticker.onUpdateEmitter.on(this.handleTickerUpdate)
    this.onCompleteDeferred = deferredPromise()
    return this.onCompleteDeferred.promise
  }

  protected handleTickerUpdate = async ({ delta, time, elapsed }) => {
    // clamp elapse time with full duration
    elapsed = Math.min(elapsed, this.tlDuration)

    // Filter only adds who are matching with elapsed time
    // It allows playing superposed itp in case of
    const filtered = this.adds.filter(
      (e) => elapsed >= e.startPositionInTl && elapsed < e.endPositionInTl
    )

    for (let i = 0; i < filtered.length; i++) {
      filtered[i].interpol.play()
    }

    // stop at the end
    if (!filtered.length) {
      this.onComplete?.()

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
        this.onCompleteDeferred.resolve()
        this.log("this.onCompleteDeferred.resolve")
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
    for (let i = 0; i < this.adds.length; i++) this.adds[i].interpol.pause()
    this.ticker.onUpdateEmitter.off(this.handleTickerUpdate)
    this.ticker.pause()
  }

  public stop(): void {
    this._stop()
  }

  protected _stop(resetRepeatCounter = true): void {
    this.log("stop")
    this.playing = false
    for (let i = 0; i < this.adds.length; i++) this.adds[i].interpol.stop()
    this.ticker.onUpdateEmitter.off(this.handleTickerUpdate)
    if (resetRepeatCounter) this.repeatCounter = 0
    this.ticker.stop()
  }

  /**
   * Log util
   * Active @wbe/debug only if debugEnable is true
   */
  protected log(...rest): void {
    if (this.debugEnable) log(this.tlId, ...rest)
  }
}
