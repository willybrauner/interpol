import { it, expect, describe, vi } from "vitest"
import { Interpol } from "../src"

describe.concurrent("Interpol basic", () => {
  it("should auto play by default", async () => {
    const itp = new Interpol({
      props: { v: [5, 100] },
      duration: 100,
      onUpdate: () => {
        expect(itp.isPlaying).toBe(true)
      },
      onComplete: () => {
        // here, isPlaying remains true, but not after promise resolve
      },
    })

    itp.play().then(() => {
      expect(itp.isPlaying).toBe(false)
    })
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
    }, itp._duration)
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
        onComplete: ({ time }) => {
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
        onUpdate: ({ props }) => {
          expect(props.foo).toBeDefined()
          expect(props.bar).toBeDefined()
        },
        onComplete: ({ props }) => {
          expect(props.foo).toBeDefined()
          expect(props.bar).toBeDefined()
          resolve()
        },
      })
    })
  })
})
