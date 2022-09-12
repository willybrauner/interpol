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
  interpols: IAdd[] = []

  paused: boolean

  protected _isPlaying = false
  get isPlaying() {
    return this._isPlaying
  }
  protected onCompleteDeferred = deferredPromise()
  protected timeouts: ReturnType<typeof setTimeout>[] = []

  constructor({ paused = true }: ITimelineConstruct = {}) {
    this.paused = paused
  }

  add(interpol: Interpol, offsetDuration: number = 0) {
    this.interpols.push({ interpol, offsetDuration })
    return this
  }

  async play() {
    if (this._isPlaying) {
      this.onCompleteDeferred = deferredPromise()
      return this.onCompleteDeferred.promise
    }

    // console.log(this.interpols)
    const durations: number[] = []
    for (let i = 0; i < this.interpols.length; i++) {

      const prev: IAdd = this.interpols[i - 1]
      const curr: IAdd = this.interpols[i]
      const isLast = i === this.interpols.length - 1

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

  pause() {}

  stop() {}
}
