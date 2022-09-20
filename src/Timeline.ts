import { IInterpolConstruct, Interpol } from "./Interpol"
import { deferredPromise } from "./helpers/deferredPromise"
import Ticker from "./Ticker"

interface IAdd {
  interpol: Interpol
  offsetPosition: number
  startPositionInTl: number
  endPositionInTl: number
  isLastOfTl: boolean
  play?: boolean
  position?: number
}

export class Timeline {
  protected _isPaused = false
  protected onComplete: () => void

  public get isPaused() {
    return this._isPaused
  }

  protected _isPlaying = false
  public get isPlaying() {
    return this._isPlaying
  }

  protected adds: IAdd[] = []
  protected onCompleteDeferred = deferredPromise()
  protected ticker = new Ticker()
  protected tlDuration: number = 0

  constructor({
    paused = true,
    onComplete = () => {},
  }: {
    paused?: boolean
    onComplete?: () => void
  } = {}) {
    this._isPaused = paused
    this.onComplete = onComplete
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

    // register full TL duration
    this.tlDuration += itp.duration + offsetPosition

    // get last add of the list
    const lastAdd = this.adds[this.adds.length - 1]

    // if lastAdd exist, calc start position of this new Add, else, this is the first one
    const startPositionInTl = lastAdd
      ? lastAdd.startPositionInTl + itp.duration + offsetPosition
      : 0

    // calc end position in TL (start pos + duration of interpolation)
    const endPositionInTl = startPositionInTl + itp.duration

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

    this._isPlaying = true
    this.ticker.play()
    this.ticker.onUpdate.on(this.handleTickerUpdate)
    this.onCompleteDeferred = deferredPromise()
    return this.onCompleteDeferred.promise
  }

  protected handleTickerUpdate = async ({ delta, time, elapsed }) => {
    // clamp elapse time with full duration
    elapsed = Math.min(elapsed, this.tlDuration)
    // console.log("=== TL", { elapsed, delta, time })

    // Filter only adds who are matching with elapsed time
    // It allows playing superposed itp in case of
    const filtered = this.adds.filter(
      (e) => elapsed >= e.startPositionInTl && elapsed < e.endPositionInTl
    )

    // stop at the end
    if (!filtered.length) {
      this._isPlaying = false
      console.log("Timeline > stop!")
      this.ticker.onUpdate.off(this.handleTickerUpdate)
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
    this._isPlaying = true
    this.stop()
    await this.play()
  }

  public pause(): void {
    this._isPlaying = false
    this.adds.forEach((e) => e.interpol.pause())
    this.ticker.onUpdate.off(this.handleTickerUpdate)
    this.ticker.pause()
  }

  public stop(): void {
    this._isPlaying = false
    this.adds.forEach((e) => e.interpol.stop())
    this.ticker.onUpdate.off(this.handleTickerUpdate)
    this.ticker.stop()
  }
}
