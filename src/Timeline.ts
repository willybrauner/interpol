import { Interpol } from "./Interpol"
import { deferredPromise } from "./helpers/deferredPromise"
import Ticker from "./helpers/Ticker"
import { ad } from "vitest/dist/global-d05ffb3f"

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
  protected timeouts: ReturnType<typeof setTimeout>[] = []

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

    // update all "isLastOfTl property
    for (let i = 0; i < this.adds.length; i++) {
      this.adds[i].isLastOfTl = false
    }

    // push new Add instance in local
    this.adds.push(
      new Add({
        interpol,
        offsetPosition,
        startPositionInTl,
        isLastOfTl: true,
      })
    )

    // return all the instance allow chaining methods calls
    return this
  }

  async play(): Promise<any> {
    if (this.adds.length === 0) {
      console.warn("No Interpol instance added to this TimeLine, return")
      return
    }

    // if (this.isPlaying) {
    //   this.onCompleteDeferred = deferredPromise()
    //   return this.onCompleteDeferred.promise
    // }

    this.ticker.start()
    this.ticker.onUpdate = ({ delta, time, elapsedTime }) => {
      console.log({ elapsedTime })

      for (let i = 0; i < this.adds.length; i++) {
        const currentAdd = this.adds[i]
        // currentAdd.update()

        const currentAddEnd =
          currentAdd.startPositionInTl + currentAdd.interpol.duration

        if (
          elapsedTime >= currentAdd.startPositionInTl &&
          elapsedTime < currentAddEnd
        ) {
          currentAdd.interpol.play()
        }

        if (currentAdd.isLastOfTl && elapsedTime >= currentAddEnd) {
          this.ticker.stop()
          this.onComplete()
        }
      }
    }

    // for (let i = 0; i < this.adds.length; i++) {
    //   const curr = this.adds[i]
    //
    //   const timeout = setTimeout(async () => {
    //     await curr.interpol.play()
    //     if (curr.isLastOfTl) {
    //       return this.onCompleteDeferred.resolve()
    //     }
    //   }, curr.startPositionInTl)
    //
    //   this.timeouts.push(timeout)
    // }

    this.onCompleteDeferred = deferredPromise()
    return this.onCompleteDeferred.promise
  }

  replay() {}

  pause() {
    this.adds.forEach((e) => e.interpol.pause())
    this.ticker.pause()

    // ne peut pas clear ici
    // this.timeouts.forEach((e) => clearTimeout(e))
  }

  stop() {
    this.adds.forEach((e) => e.interpol.stop())
    this.timeouts.forEach((e) => clearTimeout(e))
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
  // Start position of this add inside the full timeline
  public startPositionInTl: number = 0
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
    isLastOfTl,
    play,
    position,
  }: {
    interpol: Interpol
    offsetPosition: number
    startPositionInTl: number
    isLastOfTl: boolean
    play?: boolean
    position?: number
  }) {
    this.interpol = interpol
    this.offsetPosition = offsetPosition
    this.startPositionInTl = startPositionInTl
    this.isLastOfTl = isLastOfTl
    this.play = play
    this.position = position
  }
}
