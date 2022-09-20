import { IInterpolConstruct, Interpol } from "./Interpol"
import { deferredPromise } from "./helpers/deferredPromise"
import Ticker from "./helpers/Ticker"

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

  protected adds: Add[] = []
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
   * API
   *
   *
   */
  public add(
    interpol: Interpol | IInterpolConstruct,
    offsetPosition: number = 0
  ): Timeline {
    const i = interpol instanceof Interpol ? interpol : new Interpol(interpol)

    // stop first to avoid, if "paused: false" is set, to run play() method
    i.stop()

    // bind Timeline ticker to each interpol instance
    i.ticker = this.ticker
    i.inTl = true

    // register full TL duration
    this.tlDuration += i.duration + offsetPosition

    // get last add
    const lastAdd = this.adds[this.adds.length - 1]

    // if lastAdd exist, calc start position of this new Add, else, this is the first one
    const startPositionInTl = lastAdd
      ? lastAdd.startPositionInTl + i.duration + offsetPosition
      : 0

    // calc end position in TL (start pos + duration of interpolation)
    const endPositionInTl = startPositionInTl + i.duration

    // update all "isLastOfTl" property
    for (let i = 0; i < this.adds.length; i++) {
      this.adds[i].isLastOfTl = false
    }

    // push new Add instance in local
    this.adds.push(
      new Add({
        interpol: i,
        offsetPosition,
        startPositionInTl,
        endPositionInTl,
        isLastOfTl: true,
      })
    )

    // return all the instance allow chaining methods calls
    return this
  }

  public async play(): Promise<any> {
    if (this.adds.length === 0) {
      console.warn("No Interpol instance added to this TimeLine, return")
      return
    }
    if (this.isPlaying) {
      this.onCompleteDeferred = deferredPromise()
      return this.onCompleteDeferred.promise
    }
    this._isPlaying = true
    this.ticker.start()
    this.ticker.onUpdate.on(this.handleTickerUpdate)
    this.onCompleteDeferred = deferredPromise()
    return this.onCompleteDeferred.promise
  }

  protected handleTickerUpdate = async ({ delta, time, elapsed }) => {
    // clamp elapse time with full duration
    elapsed = Math.min(elapsed, this.tlDuration)
    // console.log("=== TL", { elapsed, delta, time })

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

  public async replay () {
    this.stop()
    await this.play()
  }

  public pause() {
    this._isPlaying = false
    this.adds.forEach((e) => e.interpol.pause())
    this.ticker.onUpdate.off(this.handleTickerUpdate)
    this.ticker.pause()
  }

  public stop() {
    this._isPlaying = false
    this.ticker.onUpdate.off(this.handleTickerUpdate)
    this.adds.forEach((e) => e.interpol.stop())
    this.ticker.stop()
  }
}

/**
 *
 * Add
 * a single Tl entry
 *
 *
 *
 *
 *
 *
 *
 */

class Add {
  // interpol instance added to the timeline
  public interpol: Interpol
  // offset of position
  public offsetPosition: number = 0
  // Start/end position of this add inside the full timeline
  public startPositionInTl: number = 0
  public endPositionInTl: number = 0
  // is last "Add" instance of the parent TL
  public isLastOfTl: boolean = true
  // play state of this add
  public play: boolean = false
  // position progress (where we are) inside this current add
  public position: number

  constructor({
    interpol,
    offsetPosition,
    startPositionInTl,
    endPositionInTl,
    isLastOfTl,
    play,
    position,
  }: {
    interpol: Interpol
    offsetPosition: number
    startPositionInTl: number
    endPositionInTl: number
    isLastOfTl: boolean
    play?: boolean
    position?: number
  }) {
    this.interpol = interpol
    this.offsetPosition = offsetPosition
    this.startPositionInTl = startPositionInTl
    this.endPositionInTl = endPositionInTl
    this.isLastOfTl = isLastOfTl
    this.play = play
    this.position = position
  }
}
