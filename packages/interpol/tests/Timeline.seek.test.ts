import { it, expect, vi, describe } from "vitest"
import { Timeline } from "../src"
import "./_setup"
import { wait } from "./utils/wait"

describe.concurrent("Timeline seek", () => {
  it("Timeline should be seekable to specific tl progress", () => {
    return new Promise(async (resolve: any) => {
      const mock = vi.fn()
      const tl = new Timeline({ paused: true })
      tl.add({
        v: [0, 100],
        duration: 200,
        onUpdate: ({ v }) => mock(v),
      })
      for (let v of [0.25, 0.5, 0.75, 1]) {
        tl.seek(v)
        expect(mock).toHaveBeenCalledWith(100 * v)
      }
      resolve()
    })
  })

  it("Timeline should be seekable to the same progress several times in a row", () => {
    /**
     * Goal is to test if the onUpdate callback is called each time we seek to the same progress value
     */
    return new Promise(async (resolve: any) => {
      const mockAdd1 = vi.fn()
      const mockAdd2 = vi.fn()
      const tl = new Timeline()
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

      // clear the mock value, because it will be called before the first seek
      mockAdd1.mockClear()
      mockAdd2.mockClear()

      // seek multiple times on the same progress value
      const SEEK_REPEAT_NUMBER = 30

      for (let i = 0; i < SEEK_REPEAT_NUMBER; i++) tl.seek(0.6)

      // when we seek to 0.6, the first interpol should be at v = 1000 only called ONCE
      expect(mockAdd1).toHaveBeenCalledTimes(1)
      expect(mockAdd1).toHaveBeenCalledWith(1000)

      // and the second interpol should be at v = 1200, SEEK_REPEAT_NUMBER times
      expect(mockAdd2).toHaveBeenCalledTimes(SEEK_REPEAT_NUMBER)
      expect(mockAdd2).toHaveBeenCalledWith(1200)

      // clear the mock value before seek in orde to have a clean count
      mockAdd1.mockClear()
      mockAdd2.mockClear()

      // seek to 0
      for (let i = 0; i < SEEK_REPEAT_NUMBER; i++) tl.seek(0)

      // same logic as above, the 2de interpol should be at v = 1000 only called ONCE
      expect(mockAdd2).toHaveBeenCalledTimes(1)
      expect(mockAdd2).toHaveBeenCalledWith(1000)

      // and the first interpol should be at v = 0, SEEK_REPEAT_NUMBER times
      expect(mockAdd1).toHaveBeenCalledTimes(SEEK_REPEAT_NUMBER)
      expect(mockAdd1).toHaveBeenCalledWith(0)

      resolve()
    })
  })

  it("Timeline should execute interpol's events callbacks on seek if suppressEvents is false", () => {
    return new Promise(async (resolve: any) => {
      const onComplete1 = vi.fn()
      const onComplete2 = vi.fn()
      const onTlComplete = vi.fn()
      const tl = new Timeline({ paused: true, onComplete: onTlComplete })
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

      tl.seek(0.5, false, false)
      expect(onComplete1).toHaveBeenCalledTimes(1)
      expect(onComplete2).toHaveBeenCalledTimes(0)
      tl.seek(1, false, false)
      expect(onComplete1).toHaveBeenCalledTimes(1)
      expect(onComplete2).toHaveBeenCalledTimes(1)
      tl.seek(0.5, false, false)
      expect(onComplete1).toHaveBeenCalledTimes(1)
      expect(onComplete2).toHaveBeenCalledTimes(1)
      tl.seek(1, false, false)
      expect(onComplete1).toHaveBeenCalledTimes(1)
      expect(onComplete2).toHaveBeenCalledTimes(2)

      // because 3th argument suppressTlEvents is "false"
      expect(onTlComplete).toHaveBeenCalledTimes(2)

      resolve()
    })
  })

  it("Timeline should execute interpol's events callbacks on seek if suppressEvents is true", () => {
    return new Promise(async (resolve: any) => {
      const onComplete1 = vi.fn()
      const onComplete2 = vi.fn()
      const onTlComplete = vi.fn()
      const tl = new Timeline({ paused: true, onComplete: onTlComplete })
      tl.add({
        duration: 100,
        onComplete: onComplete1,
      })
      tl.add({
        duration: 100,
        onComplete: onComplete2,
      })

      tl.seek(0.5)
      expect(onComplete1).toHaveBeenCalledTimes(0)
      expect(onComplete2).toHaveBeenCalledTimes(0)
      tl.seek(1, false, false)
      expect(onComplete1).toHaveBeenCalledTimes(1)
      expect(onComplete2).toHaveBeenCalledTimes(1)

      // because 3th argument suppressTlEvents is "true" by default
      expect(onTlComplete).toHaveBeenCalledTimes(1)

      resolve()
    })
  })
})
