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
})
