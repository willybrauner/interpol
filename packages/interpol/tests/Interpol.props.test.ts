import { it, expect, describe } from "vitest"
import { Interpol } from "../src"
import "./_setup"

describe.concurrent("Interpol props", () => {
  it("should accept array props", async () => {
    const test = (from, to, onCompleteProp) =>
      new Interpol({
        duration: 100,
        x: [from, to],
        y: [from, to],
        onUpdate: ({ x, y }) => {
          expect(x).toBeTypeOf("number")
          expect(y).toBeTypeOf("number")
        },
        onComplete: ({ x, y }) => {
          expect(x).toBe(onCompleteProp)
          expect(x).toBeTypeOf("number")
          expect(y).toBeTypeOf("number")
        },
      }).play()

    return Promise.all([
      test(0, 1000, 1000),
      test(-100, 100, 100),
      test(0, 1000, 1000),
      test(null, 1000, 1000),
      test(null, null, NaN),
    ])
  })

  it("should accept object props", async () => {
    const test = (from, to, onCompleteProp) =>
      new Interpol({
        x: { from, to, ease: "power3.out", reverseEase: "power2.in" },
        y: { from, to },
        duration: 100,
        onUpdate: ({ x }) => {
          expect(x).toBeTypeOf("number")
        },
        onComplete: ({ x }) => {
          expect(x).toBe(onCompleteProp)
          expect(x).toBeTypeOf("number")
        },
      }).play()

    return Promise.all([
      test(0, 1000, 1000),
      test(-100, 100, 100),
      test(0, 1000, 1000),
      test(null, 1000, 1000),
      test(null, null, NaN),
    ])
  })

  it("should accept a single number props 'to', implicit 'from'", async () => {
    const test = (to, onCompleteProp) =>
      new Interpol({
        x: to,
        duration: 100,
        onUpdate: ({ x }) => {
          expect(x).toBeTypeOf("number")
        },
        onComplete: ({ x }) => {
          expect(x).toBe(onCompleteProp)
          expect(x).toBeTypeOf("number")
        },
      }).play()

    return Promise.all([test(0, 0), test(1000, 1000), test(10, 10), test(null, 0)])
  })

  it("should accept inline props", async () => {
    return new Interpol({
      duration: 100,
      x: 100,
      y: -100,
      top: [0, 100],
      left: [-100, 100],
      onComplete: ({ x, y, top, left }) => {
        expect(x).toBe(100)
        expect(y).toBe(-100)
        expect(top).toBe(100)
        expect(left).toBe(100)
      },
    }).play()
  })

  it("Should works without props object and without inline props", async () => {
    return new Interpol({
      duration: 100,
      onUpdate: (props, time, progress) => {
        expect(props).toEqual({})
      },
      onComplete: (props, time, progress) => {
        expect(props).toEqual({})
      },
    }).play()
  })
})
