import { it, expect, describe } from "vitest"
import { Interpol } from "../src"
import { interpolParamsGenerator } from "./utils/interpolParamsGenerator"
import { randomRange } from "./utils/randomRange"
import "./_setup"

/**
 * Create generic interpol tester
 */
const interpolTest = (from, to, duration, resolve, isLast) => {
  const inter = new Interpol({
    props: { v: [from, to] },
    duration,
    onUpdate: ({ v }) => {
      if (inter.props.v.from < inter.props.v.to) {
        expect(v).toBeGreaterThanOrEqual(inter.props.v._from)
      } else if (inter.props.v.from > inter.props.v.to) {
        expect(v).toBeLessThanOrEqual(inter.props.v._from)
      } else if (inter.props.v.from === inter.props.v.to) {
        expect(v).toBe(inter.props.v.to)
        expect(v).toBe(inter.props.v.from)
      }
    },
    onComplete: (props, time, progress) => {
      expect(props.v).toBe(inter.props.v.to)
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
    let inputs = new Array(50)
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
    let inputs = new Array(50)
      .fill(null)
      .map((_) => {
        return interpolParamsGenerator({
          to: randomRange(-10000, 10000, 2),
          from: randomRange(-10000, 10000, 2),
        })
      })
      .sort((a, b) => a.duration - b.duration)
    return new Promise((resolve: any) => {
      inputs.forEach(async ({ from, to, duration }, i) => {
        interpolTest(from, to, duration, resolve, i === inputs.length - 1)
      })
    })
  })

  it("should be onComplete immediately if duration is <= 0", () => {
    let inputs = new Array(50)
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
