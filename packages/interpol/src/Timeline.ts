import { Interpol } from "./Interpol"
import { Ticker, deferredPromise, round, clamp } from "./core"
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
  public paused = false
  protected playFrom = 0
  protected reverseFrom = 1

  protected adds: IAdd[] = []
  protected onCompleteDeferred = deferredPromise()
  protected ticker: Ticker
  protected tlDuration: number = 0
  protected debugEnable: boolean
  public readonly tlId: number
  protected onUpdate: ({ time, progress }) => void
  protected onComplete: ({ time, progress }) => void

  protected _isPlaying = false
  protected _isReversed = false
  protected _isPause = false

  constructor({
    onUpdate = () => {},
    onComplete = () => {},
    debug = false,
    ticker = new Ticker(),
    paused = false
  }: {
    onUpdate?: ({ time, progress }) => void
    onComplete?: ({ time, progress }) => void
    debug?: boolean
    ticker?: Ticker
    paused?: boolean
  } = {}) {
    this.onUpdate = onUpdate
    this.onComplete = onComplete
    this.debugEnable = debug
    this.ticker = ticker
    this.paused = paused
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
    let startPositionInTl = prevAdd ? prevAdd.endPositionInTl + offsetPosition : 0
    // calc end position in TL (start pos + duration of interpolation)
    const endPositionInTl = startPositionInTl + itp._duration
    // update all "isLastOfTl" property
    this.executeOnAllAdds((add) => (add.isLastOfTl = false))
    // push new Add instance in local
    this.adds.push({
      interpol: itp,
      offsetPosition,
      startPositionInTl,
      endPositionInTl,
      isLastOfTl: true,
    })
    this.log("adds", this.adds)

    // hack needed because we need to waiting all adds register if this is an autoplay
    if (!this.paused) setTimeout(() => this.play(), 0)

    return this
  }

  public async play(from: number = 0): Promise<any> {
    log("play")
    this.playFrom = from
    if (this._isPlaying && this._isReversed) {
      this._isReversed = false
      return
    }

    if (this._isPlaying) {
      this.stop()
      return await this.play(from)
    }

    this.time = this.tlDuration * from
    this.progress = from
    this._isReversed = false
    this._isPlaying = true
    this._isPause = false

    this.executeOnAllAdds((e: IAdd) => {
      e.interpol.resetSeekOnComplete = true
      e.interpol.seek(0)
    })

    this.ticker.play()
    this.ticker.onUpdateEmitter.on(this.handleTickerUpdate)
    this.onCompleteDeferred = deferredPromise()
    return this.onCompleteDeferred.promise
  }

  public async reverse(from: number = 1): Promise<any> {
    log("reverse")
    this.reverseFrom = from
    // If is playing normal direction, change to reverse and return
    if (this._isPlaying && !this._isReversed) {
      this._isReversed = true
      return
    }
    // If is playing reverse, restart reverse
    if (this._isPlaying && this._isReversed) {
      this.stop()
      return await this.reverse(from)
    }

    this.time = this.tlDuration * from
    this.progress = from
    this._isReversed = true
    this._isPlaying = true
    this._isPause = false

    this.executeOnAllAdds((e) => {
      e.interpol.resetSeekOnComplete = true
      e.interpol.seek(1)
    })

    this.ticker.play()
    this.ticker.onUpdateEmitter.on(this.handleTickerUpdate)
    this.onCompleteDeferred = deferredPromise()
    return this.onCompleteDeferred.promise
  }

  public pause(): void {
    log("pause")
    this._isPlaying = false
    this._isPause = true
    this.executeOnAllAdds((e) => e.interpol.pause())
    this.ticker.onUpdateEmitter.off(this.handleTickerUpdate)
    this.ticker.pause()
  }

  public resume(): void {
    if (!this._isPause) return
    this._isPause = false
    this._isPlaying = true
    this.executeOnAllAdds((e) => e.interpol.resume())
    this.ticker.onUpdateEmitter.on(this.handleTickerUpdate)
    this.ticker.play()
  }

  public stop(): void {
    log("stop")
    this.progress = 0
    this.time = 0
    this._isPlaying = false
    this._isPause = false
    this._isReversed = false
    this.executeOnAllAdds((e) => e.interpol.stop())
    this.ticker.onUpdateEmitter.off(this.handleTickerUpdate)
    this.ticker.stop()
  }

  public seek(progress: number): void {
    this.progress = clamp(0, progress, 1)
    this.time = clamp(0, this.tlDuration * this.progress, this.tlDuration)
    this.updateAdds({ progress: this.progress, time: this.time, adds: this.adds })
  }

  protected handleTickerUpdate = async ({ delta }): Promise<any> => {
    if (!this.ticker.isRunning) return

    this.time = clamp(0, this.tlDuration, this.time + (this._isReversed ? -delta : delta))
    this.progress = clamp(0, round(this.time / this.tlDuration), 1)
    this.updateAdds({ progress: this.progress, time: this.time, adds: this.adds })

    if ((!this._isReversed && this.progress === 1) || (this._isReversed && this.progress === 0)) {
      this.onComplete?.({ time: this.time, progress: this.progress })
      this.onCompleteDeferred.resolve()
      this.stop()
    }
  }

  private updateAdds({ progress, time, adds }): void {
    this.onUpdate?.({ progress, time })
    this.executeOnAllAdds((add) => {
      const p = clamp(0, (time - add.startPositionInTl) / add.interpol._duration, 1)
      add.interpol.seek(p)
    })
  }

  /**
   * exe API function on all adds
   * @param cb
   */
  private executeOnAllAdds(cb: (add: IAdd) => void): void {
    for (let i = 0; i < this.adds.length; i++) cb(this.adds[i])
  }

  /**
   * Log util
   * Active @wbe/debug only if debugEnable is true
   */
  protected log(...rest): void {
    if (this.debugEnable) log(this.tlId, ...rest)
  }
}
