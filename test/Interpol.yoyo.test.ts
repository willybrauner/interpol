import { it, expect, describe, vi } from "vitest"
import { Interpol } from "../src"
import { wait } from "./utils/wait"

describe.concurrent("Interpol yoyo", () => {
  it(
    "should reverse a the interpolation end infinitely",
    async () => {
      const onComplete = vi.fn()
      return new Promise(async (resolve: any) => {
        const itp = new Interpol({
          to: 1000,
          duration: 400,
          yoyo: true,
          onComplete,
        })

        const goAndBack = async () => {
          setTimeout(() => {
            expect(itp.isReversed).toBe(false)
            expect(itp.isPlaying).toBe(true)
            expect(itp.time).toBeGreaterThan(0)
            expect(itp.value).toBeGreaterThan(0)
            expect(itp.advancement).toBeGreaterThan(0)
          }, itp._duration * 0.5)

          await wait(itp._duration)

          setTimeout(() => {
            expect(itp.isReversed).toBe(true)
            expect(itp.isPlaying).toBe(true)
            expect(itp.time).toBeLessThan(itp._duration)
            expect(itp.value).toBeLessThan(itp._to)
            expect(itp.advancement).toBeLessThan(1)
          }, itp._duration * 0.5)

          await wait(itp._duration)
        }

        for (let i = 0; i < 4; i++) await goAndBack()

        expect(onComplete).toHaveBeenCalledTimes(0)
        resolve()
      })
    },
    { timeout: 4000 }
  )
})
