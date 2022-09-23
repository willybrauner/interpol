import { it, expect, describe, vi } from "vitest"
import { Interpol } from "../src"
import { wait } from "./utils/wait"

describe.concurrent("Interpol yoyo", () => {
  it("should reverse a the interpolation end infinitely", async () => {
    const mock = vi.fn()
    return new Promise(async (resolve: any) => {
      const itp = new Interpol({
        to: 10,
        duration: 400,
        yoyo: true,
        onComplete: () => mock(),
      })

      const goAndBack = async () => {
        setTimeout(() => {
          expect(itp.isReversed).toBe(false)
          expect(itp.isPlaying).toBe(true)
          expect(itp.time).toBeGreaterThan(0)
          expect(itp.value).toBeGreaterThan(0)
          expect(itp.advancement).toBeGreaterThan(0)
        }, itp.duration * 0.5)

        await wait(itp.duration)

        setTimeout(() => {
          expect(itp.isReversed).toBe(true)
          expect(itp.isPlaying).toBe(true)
          expect(itp.time).toBeLessThan(itp.duration)
          expect(itp.value).toBeLessThan(itp.to)
          expect(itp.advancement).toBeLessThan(1)
        }, itp.duration * 0.5)

        await wait(itp.duration)
      }

      for (let i = 0; i < 6; i++) await goAndBack()

      expect(mock).toHaveBeenCalledTimes(0)
      resolve()
    })
  })
})
