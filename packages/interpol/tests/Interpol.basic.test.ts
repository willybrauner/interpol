import { it, expect, describe, vi } from "vitest"
import { Interpol } from "../src"
import { randomRange } from "./utils/randomRange"
import "./_setup"

describe.concurrent("Interpol basic", () => {
  it("should return the right time", async () => {
    const test = (duration) => {
      return new Interpol({
        props: { v: [5, 100] },
        duration,
        onComplete: (props, time) => {
          expect(time).toBe(duration)
        },
      }).play()
    }
    const tests = new Array(100).fill(0).map((_, i) => test(randomRange(0, 2000)))
    await Promise.all(tests)
  })

  it("should not auto play if paused is set", async () => {
    const mock = vi.fn()
    const itp = new Interpol({
      props: { v: [5, 100] },
      duration: 100,
      paused: true,
      onUpdate: () => mock(),
      onComplete: () => mock(),
    })
    expect(itp.isPlaying).toBe(false)
    setTimeout(() => {
      expect(itp.progress).toBe(0)
      expect(mock).toHaveBeenCalledTimes(0)
    }, itp.duration)
  })

  it("play should play with duration 0", async () => {
    const mock = vi.fn()
    return new Promise((resolve: any) => {
      new Interpol({
        props: { v: [0, 1000] },
        duration: 0,
        onUpdate: () => {
          mock()
          expect(mock).toBeCalledTimes(1)
        },
        onComplete: (props, time) => {
          mock()
          expect(mock).toBeCalledTimes(2)
          expect(time).toBe(0)
          resolve()
        },
      })
    })
  })

  it("should support multiple props", async () => {
    return new Promise((resolve: any) => {
      new Interpol({
        props: {
          foo: [0, 1000],
          bar: [-30, 60],
        },
        duration: 0,
        onUpdate: (props) => {
          expect(props.foo).toBeDefined()
          expect(props.bar).toBeDefined()
        },
        onComplete: (props) => {
          expect(props.foo).toBeDefined()
          expect(props.bar).toBeDefined()
          resolve()
        },
      })
    })
  })

  it("should accept a single 'to' prop number", async () => {
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

  it("should accept a prop object", async () => {
    const test = (from, to, unit, onCompleteProp, onCompleteType) =>
      new Interpol({
        props: { x: { from, to, unit } },
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
})
