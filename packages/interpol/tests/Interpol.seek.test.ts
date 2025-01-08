import { it, expect, vi, describe } from "vitest"
import { Interpol } from "../src"
import "./_setup"
import { wait } from "./utils/wait"

describe.concurrent("Interpol seek", () => {
  it("Interpol should be seekable to specific progress", () => {
    return new Promise(async (resolve: any) => {
      const mock = vi.fn()
      const itp = new Interpol({
        v: [0, 100],
        duration: 1000,
        onUpdate: ({ v }) => mock(v),
      })
      for (let v of [0.25, 0.5, 0.75, 1, 1, 0.2, 0.2, 0, 0]) {
        // seek will pause the interpol, that's why the test is instant
        itp.seek(v)
        expect(mock).toHaveBeenCalledWith(100 * v)
      }
      resolve()
    })
  })

  it("Interpol should be seekable to the same progress several times in a row", () => {
    /**
     * Goal is to test if the onUpdate callback is called each time we seek to the same progress value
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
      // seek multiple times on the same progress value
      const SEEK_REPEAT_NUMBER = 30

      for (let i = 0; i < SEEK_REPEAT_NUMBER; i++) itp.seek(0.5)
      // itp onUpdate should be called 50 times
      expect(mock).toHaveBeenCalledTimes(SEEK_REPEAT_NUMBER)
      expect(mock).toHaveBeenCalledWith(500)

      // clear the mock value before seek in orde to have a clean count
      mock.mockClear()
      for (let i = 0; i < SEEK_REPEAT_NUMBER; i++) itp.seek(0)
      // itp onUpdate should be called 50 times
      expect(mock).toHaveBeenCalledTimes(SEEK_REPEAT_NUMBER)
      expect(mock).toHaveBeenCalledWith(0)

      resolve()
    })
  })

  it("Should execute Interpol events callbacks on seek if suppressEvents is false", () => {
    return new Promise(async (resolve: any) => {
      const onComplete = vi.fn()
      const itp = new Interpol({ onComplete })
      // onComplete is called each time the interpol reach the end (progress 1)
      itp.seek(0.5, false)
      expect(onComplete).toHaveBeenCalledTimes(0)
      itp.seek(1, false) // will call onComplete
      expect(onComplete).toHaveBeenCalledTimes(1)
      itp.seek(0.25, false)
      expect(onComplete).toHaveBeenCalledTimes(1)
      itp.seek(1, false) // will call onComplete again
      expect(onComplete).toHaveBeenCalledTimes(2)
      itp.seek(0, false)
      expect(onComplete).toHaveBeenCalledTimes(2)
      resolve()
    })
  })

  it("Shouldn't execute Interpol events callbacks on seek if suppressEvents is true", () => {
    return new Promise(async (resolve: any) => {
      const onComplete = vi.fn()
      const itp = new Interpol({ onComplete })
      itp.seek(0.5)
      itp.seek(1)
      itp.seek(0.25)
      itp.seek(1)
      itp.seek(0)
      expect(onComplete).toHaveBeenCalledTimes(0)
      resolve()
    })
  })
})
