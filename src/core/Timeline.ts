import { interpol, Interpol } from "./Interpol"
import { InterpolConstruct, Props, TimelineConstruct } from "./types"
import { Ticker } from "./Ticker"
import { deferredPromise } from "../utils/deferredPromise"
import { clamp } from "../utils/clamp"
import { round } from "../utils/round"
import { noop } from "../utils/noop"
import { InterpolOptions } from "./options"

export interface IAdd {
  itp: Interpol
  time: { start: number; end: number; offset: number }
  progress: { start?: number; end?: number; current: number; last: number }
  _isAbsoluteOffset?: boolean
}

let TL_ID = 0

export type Timeline = {
  readonly ID: number
  readonly time: number
  readonly isPlaying: boolean
  readonly isReversed: boolean
  readonly isPaused: boolean
  readonly duration: number
  readonly ticker: Ticker
  readonly adds: IAdd[]
  add<K extends keyof Props>(
    interp: Interpol | InterpolConstruct<K> | (() => void),
    offset?: number | string,
  ): Timeline
  play(from?: number): Promise<any>
  reverse(from?: number): Promise<any>
  pause(): void
  resume(): void
  stop(): void
  progress(value?: number, suppressEvents?: boolean, suppressTlEvents?: boolean): number | void
  refresh(): void
  refreshComputedValues(): void
}

export function timeline({
  onUpdate = noop,
  onComplete = noop,
  debug = false,
  paused = false,
}: TimelineConstruct = {}): Timeline {
  const id = ++TL_ID

  let progress_ = 0
  let time_ = 0
  let isPlaying = false
  let isReversed = false
  let isPaused = paused
  const adds: IAdd[] = []
  let tlDuration = 0
  const ticker: Ticker = InterpolOptions.ticker

  let playFrom = 0
  let reverseFrom = 1
  let onCompleteDeferred = deferredPromise()
  let lastTlProgress = 0
  let reverseLoop = false

  // waiting for all adds register before log
  setTimeout(() => log("adds", adds), 1)

  // --- private helpers ---

  function onAllAdds(cb: (add: IAdd, i?: number) => void, reverse: boolean = false): void {
    const startIndex = reverse ? adds.length - 1 : 0
    const endIndex = reverse ? -1 : adds.length
    const step = reverse ? -1 : 1
    for (let i = startIndex; i !== endIndex; i += step) cb(adds[i], i)
  }

  function updateAdds(tlTime: number, tlProgress: number, suppressEvents = true): void {
    if (lastTlProgress > tlProgress && !reverseLoop) reverseLoop = true
    if (lastTlProgress < tlProgress && reverseLoop) reverseLoop = false
    lastTlProgress = tlProgress
    onUpdate(tlTime, tlProgress)
    onAllAdds((add) => {
      add.progress.last = add.progress.current
      // prettier-ignore
      add.progress.current =
        add.itp.duration === 0
          ? tlTime >= add.time.start ? 1 : 0
          : (tlTime - add.time.start) / add.itp.duration
      add.itp.progress(add.progress.current, suppressEvents)
    }, reverseLoop)
  }

  function log(...rest: any[]): void {
    debug && console.log(`%ctimeline`, `color: rgb(217,50,133)`, id || "", ...rest)
  }

  // --- public methods ---

  function add<K extends keyof Props>(
    interp: Interpol | InterpolConstruct<K> | (() => void),
    offset: number | string = "0",
  ): Timeline {
    if (typeof interp === "function" && !(interp as any)._isInterpol) {
      interp = interpol({ duration: 0, onComplete: interp } as any)
    }
    const itp: Interpol = (interp as any)._isInterpol
      ? (interp as Interpol)
      : interpol<K>(interp as InterpolConstruct<K>)
    itp.stop()
    itp.refresh()
    itp.ticker = ticker
    itp.inTl = true
    if (debug) itp.debugEnable = debug

    let fOffset: number
    let startTime: number
    const factor: number = InterpolOptions.durationFactor

    if (typeof offset === "string") {
      fOffset = parseFloat(offset.includes("=") ? offset.split("=").join("") : offset) * factor
      const relativeAdds = adds.filter((a) => !a._isAbsoluteOffset)
      const prevAdd =
        relativeAdds?.length > 0
          ? relativeAdds.reduce((a, b) => (b.time.end > a.time.end ? b : a))
          : adds?.[adds.length - 1] || null
      tlDuration = Math.max(tlDuration, tlDuration + itp.duration + fOffset)
      startTime = prevAdd ? prevAdd.time.end + fOffset : fOffset
    } else if (typeof offset === "number") {
      fOffset = offset * factor
      tlDuration = Math.max(0, tlDuration, fOffset + itp.duration)
      startTime = fOffset ?? 0
    }

    adds.push({
      itp,
      time: {
        start: startTime,
        end: startTime + itp.duration,
        offset: fOffset,
      },
      progress: {
        start: null,
        end: null,
        current: 0,
        last: 0,
      },
      _isAbsoluteOffset: typeof offset === "number",
    })

    onAllAdds((currAdd, i) => {
      adds[i].progress.start = currAdd.time.start / tlDuration || 0
      adds[i].progress.end = currAdd.time.end / tlDuration || 0
    })

    if (!isPaused) setTimeout(() => play(), 0)

    return self
  }

  async function play(from: number = 0): Promise<any> {
    playFrom = from
    if (isPlaying && isReversed) {
      isReversed = false
      return onCompleteDeferred.promise
    }
    if (isPlaying) {
      time_ = tlDuration * from
      progress_ = from
      isReversed = false
      return onCompleteDeferred.promise
    }
    time_ = tlDuration * from
    progress_ = from
    isReversed = false
    isPlaying = true
    isPaused = false
    ticker.add(handleTick)
    onCompleteDeferred = deferredPromise()
    return onCompleteDeferred.promise
  }

  async function reverse(from: number = 1): Promise<any> {
    reverseFrom = from
    if (isPlaying && !isReversed) {
      isReversed = true
      onCompleteDeferred = deferredPromise()
      return onCompleteDeferred.promise
    }
    if (isPlaying && isReversed) {
      stop()
      return await reverse(from)
    }

    time_ = tlDuration * from
    progress_ = from
    isReversed = true
    isPlaying = true
    isPaused = false

    ticker.add(handleTick)
    onCompleteDeferred = deferredPromise()
    return onCompleteDeferred.promise
  }

  function pause(): void {
    isPlaying = false
    isPaused = true
    onAllAdds((e) => e.itp.pause())
    ticker.remove(handleTick)
  }

  function resume(): void {
    if (!isPaused) return
    isPaused = false
    isPlaying = true
    onAllAdds((e) => e.itp.resume())
    ticker.add(handleTick)
  }

  function stop(): void {
    progress_ = 0
    time_ = 0
    isPlaying = false
    isPaused = false
    isReversed = false
    onAllAdds((e) => e.itp.stop())
    ticker.remove(handleTick)
  }

  function progressFn(value?: number, suppressEvents = true, suppressTlEvents = true): number | void {
    if (value === undefined) return progress_
    if (isPlaying) pause()
    progress_ = clamp(0, value, 1)
    time_ = clamp(0, tlDuration * progress_, tlDuration)
    updateAdds(time_, progress_, suppressEvents)
    if (value === 1 && !suppressTlEvents) {
      onComplete(time_, progress_)
    }
  }

  function refresh(): void {
    onAllAdds((e) => e.itp.refresh())
  }

  function refreshComputedValues(): void {
    console.warn(`Timeline.refreshComputedValues() is deprecated. Use Timeline.refresh() instead.`)
    refresh()
  }

  // prettier-ignore
  const handleTick = async ({ delta }): Promise<any> => {
    time_ = clamp(0, tlDuration, time_ + (isReversed ? -delta : delta))
    progress_ = clamp(0, round(time_ / tlDuration), 1)
    updateAdds(time_, progress_, false)
    // on play complete
    if ((!isReversed && progress_ === 1) || tlDuration === 0) {
      onComplete(time_, progress_)
      onCompleteDeferred.resolve()
      stop()
    }
    // on reverse complete
    if ((isReversed && progress_ === 0) || tlDuration === 0) {
      onCompleteDeferred.resolve()
      stop()
    }
  }

  // --- build self ---

  const self: Timeline = {
    get ID() { return id },
    get time() { return time_ },
    get isPlaying() { return isPlaying },
    get isReversed() { return isReversed },
    get isPaused() { return isPaused },
    get duration() { return tlDuration },
    get ticker() { return ticker },
    get adds() { return adds },
    add,
    play,
    reverse,
    pause,
    resume,
    stop,
    progress: progressFn,
    refresh,
    refreshComputedValues,
  }

  return self
}
