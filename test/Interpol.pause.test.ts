import { it, expect, describe, vi } from "vitest"
import { Interpol } from "../src"
import { wait } from "./utils/wait"

describe.concurrent("Interpol pause", () => {
  it("should play, pause and play again (resume)", async () => {
    const mock = vi.fn()
    let savedTime
    return new Promise(async (resolve: any) => {
      const itp = new Interpol({
        to: 1000,
        duration: 1000,
        paused: true,
        onUpdate: mock,
      })
      expect(mock).toHaveBeenCalledTimes(0)
      itp.play()
      expect(itp.isPlaying).toBe(true)
      await wait(500)
      itp.pause()
      expect(mock).toHaveBeenCalled()
      expect(itp.isPlaying).toBe(false)
      // save time before restart (should be around 500)
      savedTime = itp.time

      // and play again (resume)
      itp.play()

      // We are sure that time is not reset on play() after pause()
      await wait(100)
      expect(itp.advancement - savedTime).toBeLessThan(150)
      expect(itp.isPlaying).toBe(true)
      resolve()
    })
  })
})