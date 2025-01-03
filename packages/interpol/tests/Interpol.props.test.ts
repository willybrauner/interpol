import { it, expect, describe } from "vitest"
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

  it("should accept inline props", async () => {
    return new Interpol({
      duration: 100,
      x: 100,
      y: -100,
      top: [0, 100],
      left: [-100, 100, "px"],
      onComplete: ({ x, y, top, left, right, marginRight }) => {
        expect(x).toBe(100)
        expect(y).toBe(-100)
        expect(top).toBe(100)
        expect(left).toBe("100px")
      },
    }).play()
  })

  it("should accept props object AND inline props together for backward compatibility", async () => {
    return new Interpol({
      duration: 100,
      // object props
      props: {
        x: 100,
        y: -100,
        // top key will be overrided by inline props
        top: -2000,
      },
      // inline props
      top: [0, 100],
      left: [-100, 100, "px"],

      onComplete: ({ x, y, top, left, right }) => {
        expect(x).toBe(100)
        expect(y).toBe(-100)
        expect(top).toBe(100)
        expect(left).toBe("100px")
        expect(right).toBe(undefined)
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
