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
  onUpdate: ({ time, progress }) => void
  onComplete: ({ time, progress }) => void
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
    const psap = computeAnims(targets, undefined, to, true)
    this.add(psap, to?.duration, offsetPosition)
    if (!this.paused) this.play()
    return this
  }

  public async play(from: number = 0): Promise<any> {
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

    log("tl play")
    this.time = this.tlDuration * from
    this.progress = from
    this._isReversed = false
    this._isPlaying = true
    this._isPause = false

    this.executeOnAllPsaps((e) => e.initPosition())
    this.ticker.play()
    this.ticker.onUpdateEmitter.on(this.handleTickerUpdate)
    this.onCompleteDeferred = deferredPromise()
    return this.onCompleteDeferred.promise
  }

  public async reverse(from: number = 1): Promise<any> {
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

  handleTickerUpdate = ({ delta }) => {
    if (!this.ticker.isRunning) return

    // delta sign depend of reverse state
    delta = this._isReversed ? -delta : delta

    // clamp elapse time with full duration
    this.time = clamp(0, this.tlDuration, this.time + delta)
    this.progress = clamp(0, round(this.time / this.tlDuration), 1)

    // exe on update with TL properties
    this.onUpdate?.({ progress: this.progress, time: this.time })
    log("onUpdate", { progress: this.progress, time: this.time })

    // Filter only adds who are matching with elapsed time
    // It allows playing superposed itp in case of negative offset
    const filtered = this.adds.filter((e) =>
      !this._isReversed
        ? e.startPositionInTl <= this.time && this.time < e.endPositionInTl
        : e.startPositionInTl < this.time && this.time <= e.endPositionInTl
    )

    log("filtered", filtered)
    for (let i = 0; i < filtered.length; i++) {
      filtered[i].psaps.forEach((e) => {
        //if (e._isPlaying) return
        log(e)
        this._isReversed ? e.reverse(1, false) : e.play(0, false)
      })
    }

    // Iterate through the animations
    // for (let i = 0; i < this.adds.length; i++) {
    //   const { psap, startPositionInTl, endPositionInTl, isLastOfTl } = this.adds[i];
    //
    //   // Check if the animation should be played/reversed
    //   if (
    //     (!this._isReversed && startPositionInTl <= this.time && this.time < endPositionInTl) ||
    //     (this._isReversed && startPositionInTl < this.time && this.time <= endPositionInTl)
    //   ) {
    //     // If it's the first animation or the previous animation is not playing/reversing, play/reverse the current animation
    //     if (i === 0 || !this.adds[i - 1].psap.some(e => e.isPlaying)) {
    //       psap.forEach((e) => {
    //         this._isReversed ? e.reverse() : e.play();
    //       });
    //     }
    //   } else if (isLastOfTl) {
    //     // If the animation is the last one and it's not in the current time range, stop it
    //     psap.forEach((e) => {
    //       e.stop();
    //     });
    //   }
    // }

    if (this.time >= this.tlDuration) {
      this.onComplete?.({ time: this.time, progress: this.progress })
      // Stop and reset after onComplete
      this.onCompleteDeferred.resolve()
      this.stop()
    }
  }

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
