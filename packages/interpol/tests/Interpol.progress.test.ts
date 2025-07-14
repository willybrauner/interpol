import { it, expect, vi, describe } from "vitest"
import { Interpol } from "../src"
import "./_setup"
import { wait } from "./utils/wait"

describe.concurrent("Interpol progress", () => {
  it("Interpol should be able to set progress to specific value", () => {
    return new Promise(async (resolve: any) => {
      const mock = vi.fn()
      const itp = new Interpol({
        v: [0, 100],
        duration: 1000,
        onUpdate: ({ v }) => mock(v),
      })
      for (let v of [0.25, 0.5, 0.75, 1, 1, 0.2, 0.2, 0, 0]) {
        // progress will pause the interpol, that's why the test is instant
        itp.progress(v)
        expect(mock).toHaveBeenCalledWith(100 * v)
      }
      resolve()
    })
  })

  it("Interpol should be seekable to the same progress several times in a row", () => {
    /**
     * Goal is to test if the onUpdate callback is called each time we progress to the same progress value
     */
    return new Promise(async (resolve: any) => {
      const mock = vi.fn()
      const itp = new Interpol({
        v: [0, 1000],
        duration: 1000,
        onUpdate: ({ v }) => mock(v),
      })

      // stop it during the play
      await wait(100)

      // clear the mock value, because it will be called before the first seek
      mock.mockClear()
      // progress multiple times on the same progress value
      const PROGRESS_REPEAT_NUMBER = 30

      for (let i = 0; i < PROGRESS_REPEAT_NUMBER; i++) itp.progress(0.5)
      // itp onUpdate should be called 50 times
      expect(mock).toHaveBeenCalledTimes(PROGRESS_REPEAT_NUMBER)
      expect(mock).toHaveBeenCalledWith(500)

      // clear the mock value before progress in orde to have a clean count
      mock.mockClear()
      for (let i = 0; i < PROGRESS_REPEAT_NUMBER; i++) itp.progress(0)
      // itp onUpdate should be called 50 times
      expect(mock).toHaveBeenCalledTimes(PROGRESS_REPEAT_NUMBER)
      expect(mock).toHaveBeenCalledWith(0)

      resolve()
    })
  })

  it("Should execute Interpol events callbacks on progress if suppressEvents is false", () => {
    return new Promise(async (resolve: any) => {
      const onStart = vi.fn()
      const onComplete = vi.fn()
      const itp = new Interpol({ onStart, onComplete })

      const testCounts = (onStartCount: number, onCompleteCount: number) => {
        expect(onStart).toHaveBeenCalledTimes(onStartCount)
        expect(onComplete).toHaveBeenCalledTimes(onCompleteCount)
      }

      let onStartCount = 0
      let onCompleteCount = 0

      // rules:
      // onStart: is called each time the interpol start (progress 0) and go to x
      // onComplete: is called each time the interpol reach the end (progress 1)

      itp.progress(0.5, false)
      // come from 0 to .5, onStart is called, but to onComplete
      onStartCount += 1
      onCompleteCount += 0
      testCounts(onStartCount, onCompleteCount)

      itp.progress(1, false)
      //  onComplete is called, because we reach the end of the animation
      onStartCount += 0
      onCompleteCount += 1
      testCounts(onStartCount, onCompleteCount)

      itp.progress(0.25, false)
      onStartCount += 0
      onCompleteCount += 0
      testCounts(onStartCount, onCompleteCount)

      itp.progress(1, false)
      onStartCount += 0
      onCompleteCount += 1
      testCounts(onStartCount, onCompleteCount)

      itp.progress(0, false)
      onStartCount += 0
      onCompleteCount += 0
      testCounts(onStartCount, onCompleteCount)

      itp.progress(1, false)
      onStartCount += 1
      onCompleteCount += 1
      testCounts(onStartCount, onCompleteCount)

      resolve()
    })
  })

  it("Shouldn't execute Interpol events callbacks on progress if suppressEvents is true", () => {
    return new Promise(async (resolve: any) => {
      const onComplete = vi.fn()
      const onStart = vi.fn()
      const itp = new Interpol({ onStart, onComplete })

      for (let i = 0; i < 100; i++) {
        itp.progress(-1)
        itp.progress(0.5)
        itp.progress(1)
        itp.progress(0.25)
        itp.progress(1.666)
        itp.progress(0.1)
        itp.progress(+200)
      }
      for (let cb of [onStart, onComplete]) expect(cb).toHaveBeenCalledTimes(0)
      resolve()
    })
  })
})
