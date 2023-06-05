import { compute, Ticker } from "@psap/utils"
import { computeAnims, CSSProps, Options, OptionsWithoutProps, Target } from "./psap"
import debug from "@wbe/debug"
import { deferredPromise, round, clamp } from "@psap/utils"

const log = debug(`psap:PsapTimeline`)
interface IAdd {
  psap
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

  public playing: boolean = false
  public get isPlaying() {
    return this.playing
  }
  protected _isReversed = false
  public get isReversed() {
    return this._isReversed
  }
  protected _isPause = false
  public paused: boolean = false

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
    const prevPsap = this.adds?.[this.adds.length - 1]
    // if not, prev, this is the 1st, start position is 0 else, origin is the prev end + offset
    let startPositionInTl: number = prevPsap ? prevPsap.endPositionInTl + offsetPosition : 0
    // calc end position in TL (start pos + duration of interpolation)
    const endPositionInTl = startPositionInTl + duration
    // update all "isLastOfTl" property
    for (let i = 0; i < this.adds.length; i++) this.adds[i].isLastOfTl = false

    this.adds.push({
      psap,
      offsetPosition,
      startPositionInTl,
      endPositionInTl,
      isLastOfTl: true,
    })
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

  public async play(): Promise<any> {
    await this._play()
  }
  public async _play(createNewFullCompletePromise = true, isReversedState = false): Promise<any> {
    if (this.isPlaying) {
      this._isReversed = isReversedState
      if (createNewFullCompletePromise) this.onCompleteDeferred = deferredPromise()
      return this.onCompleteDeferred.promise
    }
    log("tl play")
    this.playing = true
    this._isPause = false
    this.ticker.play()
    this.ticker.onUpdateEmitter.on(this.handleTickerUpdate)
    if (createNewFullCompletePromise) this.onCompleteDeferred = deferredPromise()
    return this.onCompleteDeferred.promise
  }

  public async replay(): Promise<any> {
    log("replay")
    this.playing = true
    this.stop()
    await this.play()
  }

  public pause(): void {
    log("pause")
    this.playing = false
    this._isPause = true
    for (let i = 0; i < this.adds.length; i++) this.adds[i].psap.map((e) => e.pause())
    this.ticker.onUpdateEmitter.off(this.handleTickerUpdate)
    this.ticker.pause()
  }

  public stop() {
    log("stop")
    this.progress = 0
    this.time = 0
    this.playing = false
    this._isPause = false
    this._isReversed = false
    for (let i = 0; i < this.adds.length; i++) this.adds[i].psap.map((e) => e.stop())
    this.ticker.onUpdateEmitter.off(this.handleTickerUpdate)
    this.ticker.stop()
  }

  public reverse(r?: boolean): Promise<any> {
    this._isReversed = r ?? !this._isReversed
    // if stop
    if (!this.isPlaying && !this._isPause) {
      this.time = this._isReversed ? this.tlDuration : 0
      this.progress = this._isReversed ? 1 : 0
    }

    log("reverse()", {
      _isReverse: this._isReversed,
      time: this.time,
      progress: this.progress,
    })
    return this._play(true, this._isReversed)
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
    // TODO revoir car ça ne prend pas toujours
    const filtered = this.adds.filter((e) =>
      !this._isReversed
        ? e.startPositionInTl <= this.time && this.time < e.endPositionInTl
        : e.startPositionInTl < this.time && this.time <= e.endPositionInTl
    )

    log("filtered", filtered)
    for (let i = 0; i < filtered.length; i++) {
      // TODO à revoir
      filtered[i].psap.map((e) => {
        this._isReversed ? e.reverse() : e.play()
      })
    }

    // stop at the end
    if (!filtered.length) {
      this.onComplete?.({ time: this.time, progress: this.progress })
      // stop and reset after onComplete
      this.onCompleteDeferred.resolve()
      this.stop()
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
