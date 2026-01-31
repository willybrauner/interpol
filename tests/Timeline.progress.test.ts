import { it, expect, vi, describe } from "vitest"
import { timeline } from "../src"
import "./_setup"
import { wait } from "./utils/wait"

describe.concurrent("timeline progress", () => {
  it("timeline should be able to set progress to specific tl progress", () => {
    return new Promise(async (resolve: any) => {
      const mock = vi.fn()
      const tl = timeline({ paused: true })
      tl.add({
        v: [0, 100],
        duration: 200,
        onUpdate: ({ v }) => mock(v),
      })
      for (let v of [0.25, 0.5, 0.75, 1]) {
        tl.progress(v)
        expect(mock).toHaveBeenCalledWith(100 * v)
      }
      resolve()
    })
  })

  it("timeline should be able to set progress to the same progress several times in a row", () => {
    /**
     * Goal is to test if the onUpdate callback is called each time we progress to the same progress value
     */
    return new Promise(async (resolve: any) => {
      const mockAdd1 = vi.fn()
      const mockAdd2 = vi.fn()
      const tl = timeline()
      tl.add({
        v: [0, 1000],
        duration: 1000,
        onUpdate: ({ v }) => mockAdd1(v),
      })
      tl.add({
        v: [1000, 2000],
        duration: 1000,
        onUpdate: ({ v }) => mockAdd2(v),
      })

      // stop it during the play
      await wait(100)

      // clear the mock value, because it will be called before the first progress
      mockAdd1.mockClear()
      mockAdd2.mockClear()

      // progress multiple times on the same progress value
      const PROGRESS_REPEAT_NUMBER = 30

      for (let i = 0; i < PROGRESS_REPEAT_NUMBER; i++) tl.progress(0.6)

      // when we progress to 0.6, the first interpol should be at v = 1000 only called ONCE
      expect(mockAdd1).toHaveBeenCalledTimes(1)
      expect(mockAdd1).toHaveBeenCalledWith(1000)

      // and the second interpol should be at v = 1200, PROGRESS_REPEAT_NUMBER times
      expect(mockAdd2).toHaveBeenCalledTimes(PROGRESS_REPEAT_NUMBER)
      expect(mockAdd2).toHaveBeenCalledWith(1200)

      // clear the mock value before progress in orde to have a clean count
      mockAdd1.mockClear()
      mockAdd2.mockClear()

      // progress to 0
      for (let i = 0; i < PROGRESS_REPEAT_NUMBER; i++) tl.progress(0)

      // same logic as above, the 2de interpol should be at v = 1000 only called ONCE
      expect(mockAdd2).toHaveBeenCalledTimes(1)
      expect(mockAdd2).toHaveBeenCalledWith(1000)

      // and the first interpol should be at v = 0, PROGRESS_REPEAT_NUMBER times
      expect(mockAdd1).toHaveBeenCalledTimes(PROGRESS_REPEAT_NUMBER)
      expect(mockAdd1).toHaveBeenCalledWith(0)

      resolve()
    })
  })

  it("timeline should execute interpol's events callbacks on progress if suppressEvents is false", () => {
    return new Promise(async (resolve: any) => {
      const onComplete1 = vi.fn()
      const onComplete2 = vi.fn()
      const onTlComplete = vi.fn()
      const tl = timeline({ paused: true, onComplete: onTlComplete })
      tl.add({
        v: [0, 100],
        duration: 100,
        onComplete: onComplete1,
      })
      tl.add({
        v: [0, 100],
        duration: 100,
        onComplete: onComplete2,
      })

      tl.progress(0.5, false, false)
      expect(onComplete1).toHaveBeenCalledTimes(1)
      expect(onComplete2).toHaveBeenCalledTimes(0)
      tl.progress(1, false, false)
      expect(onComplete1).toHaveBeenCalledTimes(1)
      expect(onComplete2).toHaveBeenCalledTimes(1)
      tl.progress(0.5, false, false)
      expect(onComplete1).toHaveBeenCalledTimes(1)
      expect(onComplete2).toHaveBeenCalledTimes(1)
      tl.progress(1, false, false)
      expect(onComplete1).toHaveBeenCalledTimes(1)
      expect(onComplete2).toHaveBeenCalledTimes(2)

      // because 3th argument suppressTlEvents is "false"
      expect(onTlComplete).toHaveBeenCalledTimes(2)

      resolve()
    })
  })

  it("timeline should execute interpol's events callbacks on progress if suppressEvents is true", () => {
    return new Promise(async (resolve: any) => {
      const onComplete1 = vi.fn()
      const onComplete2 = vi.fn()
      const onTlComplete = vi.fn()
      const tl = timeline({ paused: true, onComplete: onTlComplete })
      tl.add({
        duration: 100,
        onComplete: onComplete1,
      })
      tl.add({
        duration: 100,
        onComplete: onComplete2,
      })

      tl.progress(0.5)
      expect(onComplete1).toHaveBeenCalledTimes(0)
      expect(onComplete2).toHaveBeenCalledTimes(0)
      tl.progress(1, false, false)
      expect(onComplete1).toHaveBeenCalledTimes(1)
      expect(onComplete2).toHaveBeenCalledTimes(1)

      // because 3th argument suppressTlEvents is "true" by default
      expect(onTlComplete).toHaveBeenCalledTimes(1)

      resolve()
    })
  })
})
