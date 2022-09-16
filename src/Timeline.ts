import { Interpol } from "./Interpol"
import { deferredPromise } from "./helpers/deferredPromise"

interface ITimelineConstruct {
  paused?: boolean
}

export class Timeline {
  protected _isPaused = false
  public get isPaused() {
    return this._isPaused
  }

  protected _isPlaying = false
  public get isPlaying() {
    return this._isPlaying
  }

  protected adds: Add[] = []
  // protected timeline = []
  protected onCompleteDeferred = deferredPromise()
  protected timeouts: ReturnType<typeof setTimeout>[] = []

  constructor({ paused = true }: ITimelineConstruct = {}) {
    this._isPaused = paused
  }

  /**
   * API
   *
   *
   */
  add(interpol: Interpol, offsetPosition: number = 0) {
    const lastAdd = this.adds[this.adds.length - 1]
    console.log(">", this.adds)

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

  async play() {
    if (this.isPlaying) {
      this.onCompleteDeferred = deferredPromise()
      return this.onCompleteDeferred.promise
    }

    const durations: number[] = []
    for (let i = 0; i < this.adds.length; i++) {
      const prev: Add = this.adds[i - 1]
      const curr: Add = this.adds[i]
      const isLast = i === this.adds.length - 1

      // TODO faire ce calc dans add pour avoir directement les valeurs dispo
      // add new duration
      durations.push((prev?.interpol.duration || 0) + curr.offsetPosition)
      console.log("durations after push", durations)

      const pos = durations.reduce((a, b) => a + b)
      console.log("pos", pos)

      const timeout = setTimeout(async () => {
        prev?.interpol.stop()

        if (isLast) {
          await curr.interpol.play()
          // create new onComplete deferred Promise and return it
          return this.onCompleteDeferred.resolve()
        } else {
          curr.interpol.play()
        }
      }, pos)
      this.timeouts.push(timeout)
    }

    this.onCompleteDeferred = deferredPromise()
    return this.onCompleteDeferred.promise
  }

  replay() {}

  pause() {
    this.adds.forEach((e) => e.interpol.pause())

    // ne peut pas clear ici
    // this.timeouts.forEach((e) => clearTimeout(e))
  }

  stop() {
    this.adds.forEach((e) => e.interpol.stop())
    this.timeouts.forEach((e) => clearTimeout(e))
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
