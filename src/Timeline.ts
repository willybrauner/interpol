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
  public readonly tlId: number
  protected onComplete: () => void

  protected paused = false
  public get isPaused() {
    return this.paused
  }

  protected _isPlaying = false
  public get isPlaying() {
    return this._isPlaying
  }

  protected adds: IAdd[] = []
  protected onCompleteDeferred = deferredPromise()
  protected ticker = new Ticker()
  protected tlDuration: number = 0
  protected debugEnable: boolean

  constructor({
    paused = true,
    onComplete = () => {},
    debug = false,
  }: {
    paused?: boolean
    onComplete?: () => void
    debug?: boolean
  } = {}) {
    this.paused = paused
    this.onComplete = onComplete
    this.debugEnable = debug
    this.ticker.debugEnable = debug
    this.tlId = ++TL_ID

    //  if (!this.paused) this.play()
  }

  /**
   * Add a new interpol obj or instance in Timeline
   */
  public add(
    interpol: Interpol | IInterpolConstruct,
    offsetPosition: number = 0
  ): Timeline {
    const itp = interpol instanceof Interpol ? interpol : new Interpol(interpol)

    // Stop first to avoid, if "paused: false" is set, to run play() method
    itp.stop()

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

    // return all the instance allow chaining methods calls
    return this
  }

  public async play(): Promise<any> {
    if (!this.adds.length) {
      console.warn("No Interpol instance added to this TimeLine, return")
      return
    }

    if (this.isPlaying) {
      this.onCompleteDeferred = deferredPromise()
      return this.onCompleteDeferred.promise
    }

    this.log("play")
    this._isPlaying = true
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

    // stop at the end
    if (!filtered.length) {
      this._isPlaying = false
      this.log("This is the TL end, stop")
      this.ticker.onUpdateEmitter.off(this.handleTickerUpdate)
      this.ticker.stop()
      this.onComplete()
      this.onCompleteDeferred.resolve()
      return
    }

    for (let i = 0; i < filtered.length; i++) {
      const { interpol } = filtered[i]
      interpol.play()
    }
  }

  public async replay(): Promise<any> {
    this.log("replay")
    this._isPlaying = true
    this.stop()
    await this.play()
  }

  public pause(): void {
    this.log("pause")
    this._isPlaying = false
    this.adds.forEach((e) => e.interpol.pause())
    this.ticker.onUpdateEmitter.off(this.handleTickerUpdate)
    this.ticker.pause()
  }

  public stop(): void {
    this.log("stop")
    this._isPlaying = false
    this.adds.forEach((e) => e.interpol.stop())
    this.ticker.onUpdateEmitter.off(this.handleTickerUpdate)
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
