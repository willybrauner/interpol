import { Interpol } from "./Interpol"
import { deferredPromise } from "./helpers/deferredPromise"
import Ticker from "./helpers/Ticker"
import { roundedValue } from "./helpers/roundValue"

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

  protected ticker: Ticker
  protected adds: Add[] = []
  protected onCompleteDeferred = deferredPromise()

  constructor({
    paused = true,
    onComplete = () => {},
  }: {
    paused?: boolean
    onComplete?: () => void
  } = {}) {
    this._isPaused = paused
    this.ticker = new Ticker()
    this.onComplete = onComplete
  }

  /**
   * API
   *
   *
   */
  add(interpol: Interpol, offsetPosition: number = 0): Timeline {
    console.log("this.adds before new register", this.adds)
    const lastAdd = this.adds[this.adds.length - 1]

    // if lastAdd exist, calc start position of this new Add, else, this is the first one
    const startPositionInTl = lastAdd
      ? lastAdd.startPositionInTl + interpol.duration + offsetPosition
      : 0

    // calc end position in TL (start pos + duration of interpolation)
    const endPositionInTl = startPositionInTl + interpol.duration

    // update all "isLastOfTl" property
    for (let i = 0; i < this.adds.length; i++) {
      this.adds[i].isLastOfTl = false
    }

    // push new Add instance in local
    this.adds.push(
      new Add({
        interpol,
        offsetPosition,
        startPositionInTl,
        endPositionInTl,
        isLastOfTl: true,
      })
    )

    // return all the instance allow chaining methods calls
    return this
  }

  protected time = 0

  async play(): Promise<any> {
    if (this.adds.length === 0) {
      console.warn("No Interpol instance added to this TimeLine, return")
      return
    }
    if (this.isPlaying) {
      this.onCompleteDeferred = deferredPromise()
      return this.onCompleteDeferred.promise
    }
    this._isPlaying = true

    // start ticker
    this.ticker.start()

    // on ticker update
    this.ticker.onUpdate = ({ delta, time, elapsed }) => {
      console.log("=== TL", { elapsed, delta, time })

      // calc
      this.time = elapsed

      for (let i = 0; i < this.adds.length; i++) {
        const currentAdd = this.adds[i]

        // play
        if (
          currentAdd.startPositionInTl < this.time &&
          this.time < currentAdd.endPositionInTl
        ) {
          currentAdd.interpol.play()
        } else {
           currentAdd.interpol.stop()
        }

        // stop at the end
        if (currentAdd.isLastOfTl &&  this.time >= currentAdd.endPositionInTl) {
          this.onComplete()
          this.onCompleteDeferred.resolve()
          this.stop()
        }
      }
    }

    this.onCompleteDeferred = deferredPromise()
    return this.onCompleteDeferred.promise
  }

  replay() {}

  pause() {
    this._isPlaying = false
    this.adds.forEach((e) => e.interpol.pause())
    this.ticker.pause()
  }

  stop() {
    this._isPlaying = false
    this.adds.forEach((e) => e.interpol.stop())
    this.time = 0
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
