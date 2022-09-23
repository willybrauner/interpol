import { it, expect, describe, vi } from "vitest"
import { Interpol } from "../src"

describe.concurrent("Interpol beforeStart", () => {
  it("should execute beforeStart before the play", async () => {
    const pms = (paused: boolean) =>
      new Promise(async (resolve: any) => {
        const mock = vi.fn()
        const itp = new Interpol({
          to: 100,
          duration: 500,
          paused: true,
          beforeStart: mock,
        })
        expect(mock).toHaveBeenCalledTimes(1)
        await itp.play()
        expect(mock).toHaveBeenCalledTimes(1)
        resolve()
      })
    return Promise.all([pms(true), pms(false)])
  })
})
