import { it, expect, describe, vi } from "vitest"
import { Interpol } from "../src"

describe.concurrent("Interpol replay", () => {
  it("replay should stop and start", async () => {
    const mock = vi.fn()
    let saveTime
    return new Promise(async (resolve: any) => {
      const itp = new Interpol({
        to: 1000,
        duration: 1000,
        onComplete: () => mock(),
      })

      // play
      await new Promise((r) => setTimeout(r, 500))
      expect(itp.isPlaying).toBe(true)
      expect(itp.time).toBeGreaterThan(0)
      saveTime = itp.time

      // replay (stop + start)
      itp.replay()
      expect(itp.time - saveTime).toBeLessThan(500)
      expect(itp.isPlaying).toBe(true)

      await new Promise((r) => setTimeout(r, itp.duration + 50))
      expect(mock).toHaveBeenCalledTimes(1)

      resolve()
    })
  })
})
