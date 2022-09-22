import { it, expect, describe, vi } from "vitest"
import { Interpol } from "../src"
import { wait } from "./utils/wait"

describe.concurrent("Interpol reverse", () => {
  it("should reverse the interpolation", async () => {
    const mock = vi.fn()
    return new Promise(async (resolve: any) => {
      const itp = new Interpol({
        to: 10,
        duration: 1000,
        onComplete: () => {
          mock()
        },
      })

      expect(itp.isReversed).toBe(false)
      await wait(100)
      itp.pause()
      itp.reverse()
      await itp.play()

      expect(mock).toHaveBeenCalledTimes(1)
      expect(itp.advancement).toBe(0)
      expect(itp.time).toBe(0)
      expect(itp.value).toBe(0)
      resolve()
    })
  })
})
