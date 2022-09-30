import { it, expect, describe, vi } from "vitest"
import { Interpol } from "../src"
import { wait } from "./utils/wait"

const options = { timeout: 2000 }

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
        await wait(100)
        expect(onComplete).toHaveBeenCalledTimes(1)
        expect(updateValues).toEqual({ value: 0, time: 0, advancement: 0 })
        resolve()
      })
    },
    options
  )
})
