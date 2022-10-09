import { Interpol, Timeline } from "./index"
import { IInterpolConstruct } from "./Interpol"

// type Style = Partial<CSSStyleDeclaration>
interface IOptions extends Omit<IInterpolConstruct, "from" | "to"> {
  [x: string]: any
  // same than interpol fn without "value" param
  onUpdate?: ({ time, advancement }) => void
  onComplete?: ({ time, advancement }) => void
  onRepeatComplete?: ({ time, advancement }) => void
}

/**
 * Interdom
 */
export function Interdom(
  target,
  {
    duration,
    ease,
    reverseEase,
    paused,
    delay,
    yoyo,
    repeat,
    repeatRefresh,
    debug,
    onStart,
    onUpdate,
    beforeStart,
    onComplete,
    onRepeatComplete,
    ...keys
  }: IOptions
) {
  const toKeys = { ...keys }
  console.log(toKeys)
  if (!Object.entries(toKeys).length) {
    console.warn("No properties to animate, return")
    return null
  }

  const ks = Object.keys(toKeys)
  const itps = []
  const init = () => {
    ks.forEach((key, i) => {
      const last = i === ks.length - 1
      const itp = new Interpol({
        from: toKeys[key]?.[0] ?? undefined,
        to: toKeys[key]?.[1] ?? toKeys[key],
        duration,
        ease,
        reverseEase,
        paused,
        delay,
        yoyo,
        repeat,
        repeatRefresh,
        debug,
        beforeStart: () => {
          last && beforeStart?.()
        },
        onStart: () => {
          last && onStart?.()
        },
        onUpdate: ({ value, time, advancement }) => {
          last && onUpdate?.({ time, advancement })
          //console.log("value", value)
          // TODO parse property value to apply
          target.style[key] = value + "px"
        },
        onComplete: ({ value, time, advancement }) => {
          last && onComplete?.({ time, advancement })
          target[key] = value
        },
        onRepeatComplete: ({ value, time, advancement }) => {
          last && onRepeatComplete?.({ time, advancement })
        },
      })
      itps.push(itp)
    })
  }

  const play = (): Promise<any> => Promise.all(itps.map((e) => e.play()))
  const replay = (): Promise<any> => Promise.all(itps.map((e) => e.replay()))
  const reverse = (): Promise<any> => Promise.all(itps.map((e) => e.reverse()))
  const stop = () => itps.forEach((e) => e.stop())
  const pause = () => itps.forEach((e) => e.pause())
  const refreshComputedValues = () => itps.forEach((e) => e.refreshComputedValues())

  init()

  return Object.freeze({
    play,
    replay,
    stop,
    pause,
    reverse,
    refreshComputedValues,
  })
}
