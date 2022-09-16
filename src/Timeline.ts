import { Interpol } from "./Interpol"
import { deferredPromise } from "./helpers/deferredPromise"

interface ITimelineConstruct {
  paused?: boolean
}

interface IAdd {
  interpol: Interpol
  offsetDuration: number
}

export class Timeline {
  public adds: IAdd[] = []

  protected _isPaused = false
  public get isPaused() {
    return this._isPaused
  }

  protected _isPlaying = false
  public get isPlaying() {
    return this._isPlaying
  }

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
  add(interpol: Interpol, offsetDuration: number = 0) {
    this.adds.push({ interpol, offsetDuration })
    return this
  }

  async play() {
    if (this.isPlaying) {
      this.onCompleteDeferred = deferredPromise()
      return this.onCompleteDeferred.promise
    }
    
    const durations: number[] = []
    for (let i = 0; i < this.adds.length; i++) {
      const prev: IAdd = this.adds[i - 1]
      const curr: IAdd = this.adds[i]
      const isLast = i === this.adds.length - 1

      // TODO faire ce calc dans add pour avoir directement les valeurs dispo
      // add new duration
      durations.push((prev?.interpol.duration || 0) + curr.offsetDuration)
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
