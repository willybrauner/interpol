import { Ticker } from "@psap/utils"
import { computeAnims } from "./psap"
import debug from "@wbe/debug"
import { round, clamp } from "@psap/utils"

const log = debug(`psap:psap`)

/**
 * Psap Timeline
 *
 *
 *
 */
export class PsapTimeline {
  private psaps = []
  private tlDuration: number = 0
  public playing: boolean = false
  public ticker = new Ticker()
  private _isPause: boolean = false
  private _isReversed: boolean = false
  private time = 0
  private progress = 0

  protected onUpdate: ({ time, progress }) => void
  protected onComplete: ({ time, progress }) => void

  public to(targets, to, offsetPosition: number = 0) {
    to = { ...to, _type: "to" }

    // 1 psap peut avoir plusieurs psap car plusieurs targets
    const psap = computeAnims(targets, undefined, to, true)
    psap.map((e) => e.stop())

    const duration = to?.duration ? to?.duration * 1000 : 1000
    offsetPosition = offsetPosition ? offsetPosition * 1000 : 0

    this.tlDuration += duration + offsetPosition
    const prevPsap = this.psaps?.[this.psaps.length - 1]
    // if not, prev, this is the 1st, start position is 0 else, origin is the prev end + offset
    let startPositionInTl: number = prevPsap ? prevPsap.endPositionInTl + offsetPosition : 0
    // calc end position in TL (start pos + duration of interpolation)
    const endPositionInTl = startPositionInTl + duration
    log("startPositionInTl", startPositionInTl)
    log("endPositionInTl", endPositionInTl)
    // update all "isLastOfTl" property
    for (let i = 0; i < this.psaps.length; i++) this.psaps[i].isLastOfTl = false

    this.psaps.push({
      psap,
      offsetPosition,
      startPositionInTl,
      endPositionInTl,
      isLastOfTl: true,
    })

    console.log("this.psaps", this.psaps)
    return this
  }

  public async play(): Promise<any> {
    log("tl play")
    this.playing = true
    this._isPause = true
    this.ticker.play()
    this.ticker.onUpdateEmitter.on(this.handleTickerUpdate)
  }
  public stop() {
    this.ticker.stop()
  }

  handleTickerUpdate = ({ delta }) => {
    if (!this.ticker.isRunning) return

    // delta sign depend of reverse state
    delta = this._isReversed ? -delta : delta

    // clamp elapse time with full duration
    this.time = clamp(0, this.tlDuration, this.time + delta)
    this.progress = clamp(0, round(this.time / this.tlDuration), 1)

    log("this.time", this.time)
    // Filter only adds who are matching with elapsed time
    // It allows playing superposed itp in case of negative offset
    const filtered = this.psaps.filter(
      (e) => e.startPositionInTl <= this.time && this.time < e.endPositionInTl
    )

    log("filtered", filtered)
    for (let i = 0; i < filtered.length; i++) {
      filtered[i].psap.map((e) => e.play())
    }
  }

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
