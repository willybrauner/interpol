import { it, expect, vi, describe } from "vitest"
import { Timeline, Interpol } from "../src"
import "./_setup"

describe.concurrent("Timeline play", () => {
  it("Timeline should add Interpol's and play properly", () => {
    return new Promise(async (resolve: any) => {
      const onComplete = vi.fn()
      const tl = new Timeline({ onComplete, paused: true })
      // accept instance
      tl.add(new Interpol({ duration: 100 }))
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
      const tl = new Timeline({ onComplete, paused: true })
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
