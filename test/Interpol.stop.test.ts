import { it, expect, describe, vi } from "vitest"
import { Interpol } from "../src"
import { wait } from "./utils/wait"

describe.concurrent("Interpol stop", () => {
  it("play, stop and play should restart the interpolation", async () => {
    const mock = vi.fn()
    return new Promise(async (resolve: any) => {
      const itp = new Interpol({
        to: 1000,
        duration: 1000,
        onComplete: () => mock(),
      })

      // play, value are changed
      await wait(500)
      expect(itp.isPlaying).toBe(true)
      expect(itp.time).toBeGreaterThan(0)
      expect(itp.advancement).toBeGreaterThan(0)
      expect(itp.value).toBeGreaterThan(0)

      // stop, value are reset
      itp.stop()
      expect(itp.isPlaying).toBe(false)
      expect(mock).toHaveBeenCalledTimes(0)
      expect(itp.time).toBe(0)
      expect(itp.advancement).toBe(0)
      expect(itp.value).toBe(0)

      // and play again (resume)
      itp.play()
      expect(mock).toHaveBeenCalledTimes(0)
      await wait(itp.duration + 50)
      expect(mock).toHaveBeenCalledTimes(1)

      resolve()
    })
  })
})
