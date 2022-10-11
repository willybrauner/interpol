import { it, expect, describe, vi } from "vitest"
import { Interpol } from "../src"
import { wait } from "./utils/wait"

const options = { timeout: 5000 }

describe.concurrent("Interpol reverse", () => {
  it(
    "should reverse the interpolation",
    async () => {
      const onComplete = vi.fn()
      const onReverseComplete = vi.fn()
      let updateValues
      return new Promise(async (resolve: any) => {
        const itp = new Interpol({
          to: 10,
          duration: 1000,
          onUpdate: (e) => (updateValues = e),
          onComplete,
        })
        expect(itp.isReversed).toBe(false)
        await wait(100)
        itp.reverse()
        expect(itp.isReversed).toBe(true)
        await wait(1000)
        expect(onComplete).toHaveBeenCalledTimes(1)
        expect(updateValues).toEqual({ value: 0, time: 0, advancement: 0 })
        resolve()
      })
    },
    options
  )

  it(
    "should reverse and play again the interpolation",
    async () => {
      const onComplete = vi.fn()
      const onReverseComplete = vi.fn()
      let updateValues
      return new Promise(async (resolve: any) => {
        const itp = new Interpol({
          to: 10,
          duration: 1000,
          onUpdate: (e) => (updateValues = e),
          onComplete,
        })
        expect(itp.isReversed).toBe(false)
        await wait(100)
        itp.reverse()
        expect(itp.isReversed).toBe(true)
        await itp.play()
        expect(onComplete).toHaveBeenCalledTimes(1)
        expect(updateValues).toEqual({ value: 10, time: 1000, advancement: 1 })

        for (let i = 0; i < 5; i++) {
          itp.play()
          await wait(i === 0 ? 200 : 100)
          itp.reverse()
          await wait(100)
        }
        await wait(1000)
        expect(updateValues).toEqual({ value: 0, time: 0, advancement: 0 })
        expect(onComplete).toHaveBeenCalledTimes(2)
        resolve()
      })
    },
    options
  )
})
