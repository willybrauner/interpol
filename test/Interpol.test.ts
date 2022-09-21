import { it, expect, vi } from "vitest"
import { Interpol } from "../src"
import { randomRange } from "./utils/randomRange"

it("should interpol value between two points", async () => {
  return new Promise((resolve: any) => {
    const generateRandomInterpolValues = () => {
      const from = randomRange(-10000, 10000)
      // "to" is always greater than "from"
      const to = from * randomRange(-10000, 10000)
      const duration = randomRange(0, 2000)
      return { from, to, duration }
    }

    // create random values
    let inputs = new Array(50)
      .fill(null)
      .map((_) => generateRandomInterpolValues())

    // add a "from" "to" equality example
    inputs.push({ from: 10, to: 10, duration: 100 })

    // sort by duration for execute the promise resolve() on the last
    inputs.sort((a, b) => a.duration - b.duration)
    // console.log('inputs', inputs)

    inputs.forEach(async (e, i) => {
      const inter = new Interpol({
        from: e.from,
        to: e.to,
        duration: e.duration,
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
          if (inputs.length - 1 === i) resolve()
        },
      })
    })
  })
})

it.skip("should return always the same value if duration is 0", () => {
  const inputs = [{ from: 10, to: 100, duration: 0 }]
  return new Promise((resolve: any) => {
    inputs.forEach(async (e, i) => {
      const inter = new Interpol({
        from: e.from,
        to: e.to,
        duration: e.duration,
        onUpdate: ({ value, time, advancement }) => {
          console.log({value, time, advancement})
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
          console.log("complete,", e, { value, time, advancement })
          expect(value).toBe(inter.to)
          expect(time).toBe(inter.duration)
          expect(advancement).toBe(1)
          if (inputs.length - 1 === i) resolve()
        },
      })
    })
  })
})

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
