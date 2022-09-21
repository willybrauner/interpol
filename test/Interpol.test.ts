import { it, expect, vi } from "vitest"
import { Interpol } from "../src"
import { randomRange } from "./utils/randomRange"

/**
 * Create generic interpol tester
 */
const interpolTest = (from, to, duration, resolve, isLast) => {
  const inter = new Interpol({
    from,
    to,
    duration,
    onUpdate: ({ value, time, advancement }) => {
      if (inter.from < inter.to) {
        expect(value).toBeGreaterThanOrEqual(inter.from)
      } else if (inter.from > inter.to) {
        expect(value).toBeLessThanOrEqual(inter.from)
      } else if (inter.from === inter.to) {
        expect(value).toBe(inter.to)
        expect(value).toBe(inter.from)
      }
    },
    onComplete: ({ value, time, advancement }) => {
      // console.log("complete,", { value, time, advancement })
      expect(value).toBe(inter.to)
      expect(time).toBe(inter.duration)
      expect(advancement).toBe(1)
      if (isLast) resolve()
    },
  })
}

/**
 * Interpol values generator
 */
const interpolValuesGenerator = ({
  from = undefined,
  to = undefined,
  duration = undefined,
} = {}) => ({
  from: from ?? randomRange(-10000, 10000, 2),
  to: to ?? randomRange(-10000, 10000, 2),
  duration: duration ?? randomRange(0, 2000, 2),
})

/**
 * Stress test
 * w/ from to and duration
 */
it("should interpol value between two points", async () => {
  let inputs = new Array(500)
    .fill(null)
    .map((_) => interpolValuesGenerator())
    .sort((a, b) => a.duration - b.duration)
  return new Promise((resolve: any) => {
    inputs.forEach(async ({ from, to, duration }, i) => {
      interpolTest(from, to, duration, resolve, i === inputs.length - 1)
    })
  })
})

it("should work if 'from' and 'to' are equals", () => {
  let inputs = new Array(500)
    .fill(null)
    .map((_) => {
      const fromTo = randomRange(-10000, 10000, 2)
      return interpolValuesGenerator({ to: fromTo, from: fromTo })
    })
    .sort((a, b) => a.duration - b.duration)
  return new Promise((resolve: any) => {
    inputs.forEach(async ({ from, to, duration }, i) => {
      interpolTest(from, to, duration, resolve, i === inputs.length - 1)
    })
  })
})

it("should be onComplete immediately if duration is <= 0", () => {
  let inputs = new Array(500)
    .fill(null)
    .map((_) => interpolValuesGenerator({ duration: randomRange(-2000, 0, 2) }))
  return new Promise((resolve: any) => {
    inputs.forEach(async ({ from, to, duration }, i) => {
      interpolTest(from, to, duration, resolve, i === inputs.length - 1)
    })
  })
})

it("should work even if the developer does anything :)", () =>
  new Promise((resolve: any) => interpolTest(0, 0, 0, resolve, true)))

/**
 * API
 * play, pause, stop, replay
 *
 */
it("should auto play by default", async () => {
  const mock = vi.fn()
  return new Promise((resolve: any) => {
    const itp = new Interpol({
      from: 5,
      to: 100,
      duration: 100,
      onUpdate: () => expect(itp.isPlaying).toBe(true),
      onComplete: () => mock(),
    })
    setTimeout(() => {
      expect(mock).toHaveBeenCalledTimes(1)
      expect(itp.isPlaying).toBe(false)
      resolve()
    }, itp.duration + 100)
  })
})

it("should not auto play if paused is set", async () => {
  const mock = vi.fn()
  return new Promise((resolve: any) => {
    const itp = new Interpol({
      from: 5,
      to: 100,
      duration: 100,
      paused: true,
      onUpdate: () => mock(),
      onComplete: () => mock(),
    })
    expect(itp.isPlaying).toBe(false)
    setTimeout(() => {
      expect(itp.advancement).toBe(0)
      expect(mock).toHaveBeenCalledTimes(0)
      resolve()
    }, itp.duration)
  })
})

it("should play, pause and play again (resume)", async () => {
  const mock = vi.fn()
  let savedTime
  return new Promise(async (resolve: any) => {
    const itp = new Interpol({
      to: 1000,
      duration: 1000,
      paused: true,
      onUpdate: () => mock(),
    })
    expect(mock).toHaveBeenCalledTimes(0)
    itp.play()
    expect(itp.isPlaying).toBe(true)
    await new Promise((r) => setTimeout(r, 500))
    itp.pause()
    expect(mock).toHaveBeenCalled()
    expect(itp.isPlaying).toBe(false)
    // save time before restart (should be around 500)
    savedTime = itp.time

    // and play again (resume)
    itp.play()

    // We are sure that time is not reset on play() after pause()
    await new Promise((r) => setTimeout(r, 100))
    expect(itp.advancement - savedTime).toBeLessThan(150)
    expect(itp.isPlaying).toBe(true)
    resolve()
  })
})

it("play, stop and play should restart the interpolation", async () => {
  const mock = vi.fn()
  return new Promise(async (resolve: any) => {
    const itp = new Interpol({
      to: 1000,
      duration: 1000,
      onComplete: () => mock(),
    })

    // play, value are changed
    await new Promise((r) => setTimeout(r, 500))
    expect(itp.isPlaying).toBe(true)
    expect(itp.time).toBeGreaterThan(0)
    expect(itp.advancement).toBeGreaterThan(0)
    expect(itp.value).toBeGreaterThan(0)

    // stop, value are reset
    itp.stop()
    expect(itp.isPlaying).toBe(false)
    expect(mock).toHaveBeenCalledTimes(0)
    expect(itp.time).toBe(0)
    expect(itp.advancement).toBe(0)
    expect(itp.value).toBe(0)

    // and play again (resume)
    itp.play()
    expect(mock).toHaveBeenCalledTimes(0)
    await new Promise((r) => setTimeout(r, itp.duration + 50))
    expect(mock).toHaveBeenCalledTimes(1)

    resolve()
  })
})

it("replay should stop and start", async () => {
  const mock = vi.fn()
  let saveTime
  return new Promise(async (resolve: any) => {
    const itp = new Interpol({
      to: 1000,
      duration: 1000,
      onComplete: () => mock(),
    })

    // play
    await new Promise((r) => setTimeout(r, 500))
    expect(itp.isPlaying).toBe(true)
    expect(itp.time).toBeGreaterThan(0)
    saveTime = itp.time

    // replay (stop + start)
    itp.replay()
    expect(itp.time - saveTime).toBeLessThan(500)
    expect(itp.isPlaying).toBe(true)

    await new Promise((r) => setTimeout(r, itp.duration + 50))
    expect(mock).toHaveBeenCalledTimes(1)

    resolve()
  })
})

it("play should return a resolved promise when complete", async () => {
  const mock = vi.fn()
  const itp = new Interpol({
    to: 100,
    paused: true,
    onComplete: () => mock(),
  })
  await itp.play()
  expect(itp.isPlaying).toBe(false)
  expect(mock).toBeCalledTimes(1)
})

it("play process a delay", async () => {
  const delay = 200
  const mock = vi.fn()
  const itp = new Interpol({
    to: 100,
    delay,
    onComplete: () => mock(),
  })

  // during the delay
  await new Promise((r) => setTimeout(r, delay * 0.5))
  expect(itp.isPlaying).toBe(true)
  expect(itp.time).toBe(0)
  expect(itp.advancement).toBe(0)
  expect(itp.value).toBe(0)
  await new Promise((r) => setTimeout(r, delay))

  // after the delay
  expect(itp.time).toBeGreaterThan(0)
  expect(itp.advancement).toBeGreaterThan(0)
  expect(itp.value).toBeGreaterThan(0)
})
