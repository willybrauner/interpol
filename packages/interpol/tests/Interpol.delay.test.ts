import { it, expect, describe, vi } from "vitest"
import { Interpol } from "../src"
import { wait } from "./utils/wait"


describe.concurrent("Interpol delay", () => {
  it("play with delay", () => {
    return new Promise(async (resolve: any) => {
      const delay = 200
      const mock = vi.fn()
      const itp = new Interpol({
        to: 100,
        delay,
        onComplete: () => mock(),
      })
      // juste before play
      await wait(delay).then(() => {
        expect(itp.isPlaying).toBe(true)
        expect(itp.time).toBe(0)
        expect(itp.progress).toBe(0)
        expect(itp.value).toBe(0)
      })
      // wait just after play
      await wait(100)
      expect(itp.time).toBeGreaterThan(0)
      expect(itp.progress).toBeGreaterThan(0)
      expect(itp.value).toBeGreaterThan(0)

      resolve()
    })
  })
})
