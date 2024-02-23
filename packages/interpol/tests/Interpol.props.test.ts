import { it, expect, describe, vi } from "vitest"
import { Interpol } from "../src"
import "./_setup"

describe.concurrent("Interpol props", () => {
  it("should accept array props", async () => {
    const test = (from, to, unit, onCompleteProp, onCompleteType) =>
      new Interpol({
        duration: 100,
        props: {
          x: [from, to, unit],
          y: [from, to, unit],
        },
        onUpdate: ({ x, y }) => {
          expect(x).toBeTypeOf(onCompleteType)
          expect(y).toBeTypeOf(onCompleteType)
        },
        onComplete: ({ x, y }) => {
          expect(x).toBe(onCompleteProp)
          expect(x).toBeTypeOf(onCompleteType)
          expect(y).toBeTypeOf(onCompleteType)
        },
      })

    return Promise.all([
      test(0, 1000, "px", "1000px", "string"),
      test(-100, 100, "%", "100%", "string"),
      test(0, 1000, null, 1000, "number"),
      test(null, 1000, null, 1000, "number"),
      test(null, null, null, NaN, "number"),
    ])
  })

  it("should accept object props", async () => {
    const test = (from, to, unit, onCompleteProp, onCompleteType) =>
      new Interpol({
        props: {
          x: { from, to, unit, ease: "power3.out", reverseEase: "power2.in" },
          y: { from, to, unit },
        },
        duration: 100,
        onUpdate: ({ x }) => {
          expect(x).toBeTypeOf(onCompleteType)
        },
        onComplete: ({ x }) => {
          expect(x).toBe(onCompleteProp)
          expect(x).toBeTypeOf(onCompleteType)
        },
      })

    return Promise.all([
      test(0, 1000, "px", "1000px", "string"),
      test(-100, 100, "%", "100%", "string"),
      test(0, 1000, null, 1000, "number"),
      test(null, 1000, null, 1000, "number"),
      test(null, null, null, NaN, "number"),
    ])
  })

  it("should accept number props", async () => {
    const test = (to, onCompleteProp, onCompleteType) =>
      new Interpol({
        props: { x: to },
        duration: 100,
        onUpdate: ({ x }) => {
          expect(x).toBeTypeOf(onCompleteType)
        },
        onComplete: ({ x }) => {
          expect(x).toBe(onCompleteProp)
          expect(x).toBeTypeOf(onCompleteType)
        },
      })

    return Promise.all([
      test(0, 0, "number"),
      test(1000, 1000, "number"),
      test(10, 10, "number"),
      test(null, 0, "number"),
    ])
  })
})
