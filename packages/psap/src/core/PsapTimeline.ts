import { compute, Ticker } from "@psap/utils"
import { computeAnims, CSSProps, Options, OptionsWithoutProps, Target } from "./psap"
import debug from "@wbe/debug"
import { deferredPromise, round, clamp } from "@psap/utils"

const log = debug(`psap:PsapTimeline`)
interface IAdd {
  psaps
  offsetPosition: number
  startPositionInTl: number
  endPositionInTl: number
  isLastOfTl: boolean
  play?: boolean
  position?: number
}

export interface PsapTimelineConstruct {
  paused: boolean
  onUpdate: ({ time, progress }: { time: number; progress: number }) => void
  onComplete: ({ time, progress }: { time: number; progress: number }) => void
}

/**
 * Psap Timeline
 *
 *
 *
 */
export class PsapTimeline {
  private adds: IAdd[] = []
  private time = 0
  private progress = 0
  private tlDuration: number = 0
  protected onCompleteDeferred = deferredPromise()
  public ticker = new Ticker()
  protected onUpdate: ({ time, progress }) => void
  protected onComplete: ({ time, progress }) => void

  public _isPlaying: boolean = false
  public get isPlaying() {
    return this._isPlaying
  }
  protected _isReversed = false
  public get isReversed() {
    return this._isReversed
  }
  protected _isPause = false
  public paused: boolean = false

  protected playFrom = 0
  protected reverseFrom = 1

  constructor({ paused, onUpdate, onComplete }: Partial<PsapTimelineConstruct> = {}) {
    this.paused = paused
    this.onUpdate = onUpdate
    this.onComplete = onComplete
  }

  protected add(psap, duration: number | (() => number), offsetPosition: number = 0) {
    psap.map((e) => e.stop())
    duration = duration ? compute(duration) * 1000 : 1000
    offsetPosition = offsetPosition ? offsetPosition * 1000 : 0
    this.tlDuration += duration + offsetPosition
    const prevPsap: IAdd = this.adds?.[this.adds.length - 1]
    // if not, prev, this is the 1st, start position is 0 else, origin is the prev end + offset
    let startPositionInTl: number = prevPsap ? prevPsap.endPositionInTl + offsetPosition : 0
    // calc end position in TL (start pos + duration of interpolation)
    const endPositionInTl: number = startPositionInTl + duration
    // update all "isLastOfTl" property
    for (let i = 0; i < this.adds.length; i++) this.adds[i].isLastOfTl = false

    this.adds.push({
      psaps: psap,
      offsetPosition,
      startPositionInTl,
      endPositionInTl,
      isLastOfTl: true,
    })

    console.log(this.adds)
  }

  /**
   * To
   * @param targets
   * @param to
   * @param offsetPosition
   */
  public to<T extends Target>(targets: T, to: Options<any>, offsetPosition: number = 0) {
    to = { ...to, _type: "to" }
    const psap = computeAnims(targets, undefined, to, true, this.ticker)
    this.add(psap, to?.duration, offsetPosition)
    // hack needed because we need to waiting all psap register if this is an autoplay
    if (!this.paused) setTimeout(() => this.play(), 0)
    return this
  }

  public async play(from: number = 0): Promise<any> {
    log("play")
    this.playFrom = from
    // If is playing reverse, juste return the state
    if (this.isPlaying && this._isReversed) {
      this._isReversed = false
      return
    }

    if (this.isPlaying) {
      this.stop()
      return await this.play(from)
    }

    this.time = this.tlDuration * from
    this.progress = from
    this._isReversed = false
    this._isPlaying = true
    this._isPause = false

    this.executeOnAllPsaps((e) => {
      e.itps.map((itp) => itp.resetSeekOnComplete = true)
      e.seek(0)
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
    if (this.isPlaying && !this._isReversed) {
      this._isReversed = true
      return
    }
    // If is playing reverse, restart reverse
    if (this.isPlaying && this._isReversed) {
      this.stop()
      return await this.reverse(from)
    }

    this.time = this.tlDuration * from
    this.progress = from
    this._isReversed = true
    this._isPlaying = true
    this._isPause = false

    // start ticker only if is single Interpol, not TL
    this.executeOnAllPsaps((e) => e.seek(1))
    this.ticker.play()
    this.ticker.onUpdateEmitter.on(this.handleTickerUpdate)
    // create new onComplete deferred Promise and return it
    this.onCompleteDeferred = deferredPromise()
    return this.onCompleteDeferred.promise
  }

  public pause(): void {
    log("pause")
    this._isPlaying = false
    this._isPause = true
    this.executeOnAllPsaps((e) => e.pause())
    this.ticker.onUpdateEmitter.off(this.handleTickerUpdate)
    this.ticker.pause()
  }

  public resume(): void {
    if (!this._isPause) return
    this._isPause = false
    this._isPlaying = true
    this.executeOnAllPsaps((e) => e.resume())
    this.ticker.onUpdateEmitter.on(this.handleTickerUpdate)
    this.ticker.play()
  }

  public stop() {
    log("stop")
    this.progress = 0
    this.time = 0
    this._isPlaying = false
    this._isPause = false
    this._isReversed = false
    this.executeOnAllPsaps((e) => e.stop())
    this.ticker.onUpdateEmitter.off(this.handleTickerUpdate)
    this.ticker.stop()
  }

  public seek(progress: number): void {
    this.progress = clamp(0, progress, 1)
    this.time = clamp(0, this.tlDuration * this.progress, this.tlDuration)
    this.updatePsaps({ progress: this.progress, time: this.time, adds: this.adds })
  }

  handleTickerUpdate = ({ delta }) => {
    if (!this.ticker.isRunning) return
    // delta sign depend of reverse state
    this.time = clamp(0, this.tlDuration, this.time + (this._isReversed ? -delta : delta))
    this.progress = clamp(0, round(this.time / this.tlDuration), 1)
    this.updatePsaps({ progress: this.progress, time: this.time, adds: this.adds })

    if (
      (!this._isReversed && this.time >= this.tlDuration) ||
      (this._isReversed && this.time <= 0)
    ) {
      // Stop and reset after onComplete
      this.onComplete?.({ time: this.time, progress: this.progress })
      this.onCompleteDeferred.resolve()
      this.stop()
    }
  }

  /**
   * Update psaps
   */
  private updatePsaps({ progress, time, adds }): void {
    // exe on update with TL properties
    this.onUpdate?.({ progress, time })
   // log("onUpdate", { progress, time })

    // Seek all selected psaps
    for (let i = 0; i < adds.length; i++) {

      const isBefore = time < adds[i].startPositionInTl
      const isAfter = time > adds[i].endPositionInTl
      if (isBefore || isAfter) {
       // continue
      } 

      for (let j = 0; j < adds[i].psaps.length; j++) {
        const psap = adds[i].psaps[j]
        const progress = clamp(0, (time - adds[i].startPositionInTl) / psap.itps[0].duration, 1)
        log("seek", { i, progress })
         psap.seek(progress)
      }
    }
  }

  /**
   * exe API function on all psaps
   * @param cb
   * @private
   */
  private executeOnAllPsaps(cb: (e) => void): void {
    for (let i = 0; i < this.adds.length; i++)
      for (let j = 0; j < this.adds[i].psaps.length; j++) {
        cb(this.adds[i].psaps[j])
      }
  }

  /**
   *
   *
   *
   *
   *
   *
   * TODO
   *
   *
   * @param target
   * @param to
   */

  public set(target, to) {
    to = { ...to, _type: "set" }
    return this
  }
  public from(target, from) {
    from = { ...from, _type: "from" }
    // this.itpsGroup.push(anims(target, from, undefined))
    // return this
  }
  public fromTo(target, from, to) {
    to = { ...to, _type: "fromTo" }
    // this.itpsGroup.push(anims(target, undefined, to))
    // return this
  }
}
