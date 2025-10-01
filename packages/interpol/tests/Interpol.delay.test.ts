import { it, expect, describe, vi } from "vitest"
import { wait } from "./utils/wait"
import { Interpol, InterpolOptions } from "../src"
import "./_setup"
import { randomRange } from "./utils/randomRange"

describe.concurrent("Interpol delay", () => {
  it("play with delay", () => {
    return new Promise(async (resolve: any) => {
      InterpolOptions.durationFactor = 1
      InterpolOptions.duration = 1000
      const delay = 200
      const mock = vi.fn()
      const itp = new Interpol({
        delay,
        onComplete: () => mock(),
      })
      // juste before play
      await wait(delay).then(() => {
        expect(itp.isPlaying).toBe(true)
        expect(itp.time).toBe(0)
        expect(itp.progress()).toBe(0)
      })
      // wait just after play
      await wait(100)
      expect(itp.time).toBeGreaterThan(0)
      expect(itp.progress()).toBeGreaterThan(0)
      resolve()
    })
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
        expect(itp.progress()).toBe(0)
      })
      // wait just after play
      await wait(100)
      expect(itp.time).toBeGreaterThan(0)
      expect(itp.progress()).toBeGreaterThan(0)
      resolve()
    })
  })

  it("play with a computed delay function", () => {
    return new Promise(async (resolve: any) => {
      InterpolOptions.durationFactor = 1
      InterpolOptions.duration = 1000
      const start = performance.now()
      const delay = 200
      const duration = 100

      const itp = new Interpol({
        paused: true,
        delay: () => delay,
        duration,
        onStart: () => {
          // -1 for rounding issues
          const now = performance.now() - start
          expect(now).toBeGreaterThanOrEqual(delay - 1)
        },
        onUpdate: () => {
          const now = performance.now() - start
          expect(now).toBeGreaterThanOrEqual(delay - 1)
        },
        onComplete: () => {
          const now = performance.now() - start
          expect(now).toBeGreaterThanOrEqual(delay + duration - 1)
        },
      })

      await itp.play()

      // final check
      const now = performance.now() - start
      expect(now).toBeGreaterThanOrEqual(delay + duration)

      resolve()
    })
  })

  it('should refesh delay when calling "refreshComputedValues()"', () => {
    return new Promise(async (resolve: any) => {
      InterpolOptions.durationFactor = 1
      InterpolOptions.duration = 1000
      const duration = 100
      let currDelay = null

      const itp = new Interpol({
        paused: true,
        delay: () => randomRange(0, 300),
        duration,
        onStart: (props, t, p, instance) => {
          currDelay = instance.delay
        },
        onUpdate: (props, t, p, instance) => {
          expect(instance.delay).toEqual(currDelay)
        },
        onComplete: (props, t, p, instance) => {
          expect(instance.delay).toEqual(currDelay)
        },
      })

      for (let i = 0; i < 10; i++) {
        itp.refreshComputedValues()
        expect(itp.delay).not.toEqual(currDelay)
      }

      resolve()
    })
  })
})
