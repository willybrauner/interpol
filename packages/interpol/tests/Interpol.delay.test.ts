import { it, expect, describe, vi } from "vitest"
import { wait } from "./utils/wait"
import { Interpol } from "../src"
import "./_setup"

describe.concurrent("Interpol delay", () => {
  it("play with delay", () => {
    return new Promise(async (resolve: any) => {
      const delay = 200
      const mock = vi.fn()
      const itp = new Interpol({
        props: { x: [0, 100] },
        delay,
        onComplete: () => mock(),
      })
      // juste before play
      await wait(delay).then(() => {
        expect(itp.isPlaying).toBe(true)
        expect(itp.time).toBe(0)
        expect(itp.progress).toBe(0)
      })
      // wait just after play
      await wait(100)
      expect(itp.time).toBeGreaterThan(0)
      expect(itp.progress).toBeGreaterThan(0)
      resolve()
    })
  })
})
