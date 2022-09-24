import { it, expect, describe, vi } from "vitest"
import { Interpol } from "../src"

describe.concurrent("Interpol onStart", () => {
  it("should execute onStart on each play, (after delay)", async () => {
    return new Promise(async (resolve: any) => {
      const mock = vi.fn()
      const itp = new Interpol({
        to: 100,
        duration: 500,
        paused: true,
        delay: 100,
        onStart: mock,
      })
      for (let i = 0; i < 10; i++) {
        expect(mock).toHaveBeenCalledTimes(i)
        await itp.play()
      }

      resolve()
    })
  })
})
