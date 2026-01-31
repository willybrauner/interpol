import { it, expect, vi, describe } from "vitest"
import { timeline, interpol } from "../src"
import "./_setup"

describe.concurrent("timeline play", () => {
  it("timeline should add interpol's and play properly", () => {
    return new Promise(async (resolve: any) => {
      const onComplete = vi.fn()
      const tl = timeline({ onComplete, paused: true })
      // accept instance
      tl.add(interpol({ duration: 100 }))
      // accept object
      tl.add({ duration: 100 })
      await tl.play()
      expect(onComplete).toBeCalledTimes(1)
      resolve()
    })
  })

  it("play should return a promise resolve once, even if play is exe during playing", () => {
    return new Promise(async (resolve: any) => {
      const onComplete = vi.fn()
      const promiseResolve = vi.fn()
      const tl = timeline({ onComplete })
      for (let i = 0; i < 3; i++) {
        tl.add({ duration: 100 })
      }
      for (let i = 0; i < 3; i++) tl.play()
      await tl.play()
      expect(onComplete).toBeCalledTimes(1)
      promiseResolve()
      expect(promiseResolve).toBeCalledTimes(1)
      resolve()
    })
  })
})
