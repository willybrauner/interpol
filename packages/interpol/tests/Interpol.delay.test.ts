import { it, expect, describe, vi, afterEach } from "vitest"
import { wait } from "./utils/wait"
import { Interpol, InterpolOptions } from "../src"
import "./_setup"

describe.concurrent("Interpol delay", () => {
  it("play with delay", () => {
    return new Promise(async (resolve: any) => {
      const delay = 200
      const mock = vi.fn()
      const itp = new Interpol({
        props: { x: [0, 100] },
        delay,
        onComplete: () => mock(),
      })
      // juste before play
      await wait(delay).then(() => {
        expect(itp.isPlaying).toBe(true)
        expect(itp.time).toBe(0)
        expect(itp.progress).toBe(0)
      })
      // wait just after play
      await wait(100)
      expect(itp.time).toBeGreaterThan(0)
      expect(itp.progress).toBeGreaterThan(0)
      resolve()
    })
  })

  afterEach(() => {
    InterpolOptions.durationFactor = 1
    InterpolOptions.duration = 1000
  })

  it("play with delay when a custom Duration factor is set", () => {
    return new Promise(async (resolve: any) => {
      InterpolOptions.durationFactor = 1000
      InterpolOptions.duration = 1
      const delay = 0.2
      const mock = vi.fn()
      const itp = new Interpol({
        delay,
        onComplete: () => mock(),
      })
      // juste before play
      await wait(delay * InterpolOptions.durationFactor).then(() => {
        expect(itp.isPlaying).toBe(true)
        expect(itp.time).toBe(0)
        expect(itp.progress).toBe(0)
      })
      // wait just after play
      await wait(100)
      expect(itp.time).toBeGreaterThan(0)
      expect(itp.progress).toBeGreaterThan(0)
      resolve()
    })
  })
})
