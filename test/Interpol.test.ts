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
      // console.log("complete,", e, { value, time, advancement })
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
  fixedFrom = undefined,
  fixedTo = undefined,
  fixedDuration = undefined,
} = {}) => ({
  from: fixedFrom ?? randomRange(-10000, 10000, 2),
  to: fixedTo ?? randomRange(-10000, 10000, 2),
  duration: fixedDuration ?? randomRange(0, 5000, 2),
})

/**
 * Stress test
 *
 * w/ from to and duration
 *
 *
 *
 */
it("should interpol value between two points", async () => {
  // create random values
  let inputs = new Array(500).fill(null).map((_) => interpolValuesGenerator())

  // add a "from" "to" equality example
  inputs.push({ from: 10, to: 10, duration: 100 })

  // sort by duration for execute the promise resolve() on the last
  inputs.sort((a, b) => a.duration - b.duration)

  return new Promise((resolve: any) => {
    // execute test for each input
    inputs.forEach(async ({ from, to, duration }, i) => {
      interpolTest(from, to, duration, resolve, i === inputs.length - 1)
    })
  })
})

it("should return always the same value if duration is 0", () => {
  let inputs = new Array(500)
    .fill(null)
    .map((_) => interpolValuesGenerator({ fixedDuration: 0 }))
  console.log("inputs", inputs)

  return new Promise((resolve: any) => {
    inputs.forEach(async ({ from, to, duration }, i) => {
      interpolTest(from, to, duration, resolve, i === inputs.length - 1)
    })
  })
})

it("should work even if the developer does anything :)", () =>
  new Promise((resolve: any) => interpolTest(0, 0, 0, resolve, true)))

/**
 *
 *
 *
 *
 */

// it("should not auto play if paused is set", async () => {
//   let inter
//   inter = new Interpol({ to: 100, paused: true })
//   expect(inter.isPlaying).toBe(false)
//
//   inter = new Interpol({ to: 100, paused: false })
//   expect(inter.isPlaying).toBe(true)
// })
//
// it("should play, pause and play again", async () => {
//   let inter
//   inter = new Interpol({ to: 100, paused: true })
//   inter.play()
//   expect(inter.isPlaying).toBe(true)
//   inter.pause()
//   expect(inter.isPlaying).toBe(false)
//   inter.play()
//   expect(inter.isPlaying).toBe(true)
// })
//
// it("play() should return a resolved promise when complete", async () => {
//   const mock = vi.fn()
//   const inter = new Interpol({
//     to: 100,
//     paused: true,
//     onComplete: () => {
//       mock()
//     },
//   })
//   await inter.play()
//   expect(inter.isPlaying).toBe(false)
//   expect(mock).toBeCalledTimes(1)
// })
//
// it("should execute onComplete once", () => {})
