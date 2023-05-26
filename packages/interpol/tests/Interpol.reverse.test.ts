import { it, expect, describe, vi } from "vitest"
import { Interpol } from "../src"
import { wait } from "./utils/wait"

const options = { timeout: 2000 }

describe.concurrent("Interpol reverse", () => {
  it(
    "should reverse the interpolation",
    async () => {
      const onComplete = vi.fn()
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
        expect(updateValues.value).toBeCloseTo(0, 100)
        expect(updateValues.time).toBeCloseTo(0, 100)
        expect(updateValues.progress).toBeCloseTo(0, 100)
        resolve()
      })
    },
    options
  )
})
