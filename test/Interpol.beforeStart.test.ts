import { it, expect, describe, vi } from "vitest"
import { Interpol } from "../src"

describe.concurrent("Interpol beforeStart", () => {
  it("should execute beforeStart before the play", async () => {
    const pms = (paused: boolean) =>
      new Promise(async (resolve: any) => {
        const beforeStart = vi.fn()
        const itp = new Interpol({
          to: 100,
          duration: 500,
          paused,
          beforeStart,
        })
        expect(beforeStart).toHaveBeenCalledTimes(1)
        await itp.play()
        expect(beforeStart).toHaveBeenCalledTimes(1)
        resolve()
      })

    // play with paused = true
    // play with paused = false
    return Promise.all([pms(true), pms(false)])
  })
})
