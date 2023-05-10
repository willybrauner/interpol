import { it, expect, describe, vi } from "vitest"
import { Interpol } from "../src"
import { interpolParamsGenerator } from "./utils/interpolParamsGenerator"
import { randomRange } from "./utils/randomRange"

/**
 * Create generic interpol tester
 */
const interpolTest = (from, to, duration, resolve, isLast) => {
  const inter = new Interpol({
    from,
    to,
    duration,
    onUpdate: ({ value, time, progress }) => {
      if (inter.from < inter.to) {
        expect(value).toBeGreaterThanOrEqual(inter.from as number)
      } else if (inter.from > inter.to) {
        expect(value).toBeLessThanOrEqual(inter.from as number)
      } else if (inter.from === inter.to) {
        expect(value).toBe(inter.to)
        expect(value).toBe(inter.from)
      }
    },
    onComplete: ({ value, time, progress }) => {
      expect(value).toBe(inter.to)
      expect(time).toBe(inter.duration)
      expect(progress).toBe(1)
      if (isLast) resolve()
    },
  })
}

/**
 * Stress test
 * w/ from to and duration
 */
describe.concurrent("Interpol stress test", () => {
  it("should interpol value between two points", async () => {
    let inputs = new Array(500)
      .fill(null)
      .map((_) => interpolParamsGenerator())
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
        return interpolParamsGenerator({ to: fromTo, from: fromTo })
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
      .map((_) => interpolParamsGenerator({ duration: randomRange(-2000, 0, 2) }))
    return new Promise((resolve: any) => {
      inputs.forEach(async ({ from, to, duration }, i) => {
        interpolTest(from, to, duration, resolve, i === inputs.length - 1)
      })
    })
  })

  it("should work even if the developer does anything :)", () =>
    new Promise((resolve: any) => interpolTest(0, 0, 0, resolve, true)))
})
