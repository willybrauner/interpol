import { it, expect, describe, vi } from "vitest"
import { Interpol } from "../src"
import { wait } from "./utils/wait"
import "./_setup"

const options = { timeout: 2000 }

describe.concurrent("Interpol reverse", () => {
  it(
    "should reverse the interpolation",
    async () => {
      const onComplete = vi.fn()
      const onUpdate = vi.fn()
      return new Promise(async (resolve: any) => {
        const itp = new Interpol({
          props: { v: [0, 10] },
          duration: 1000,
          onUpdate,
          onComplete,
        })
        expect(itp.isReversed).toBe(false)
        await wait(100)
        itp.reverse()
        expect(itp.isReversed).toBe(true)
        await wait(1000)
        expect(onComplete).toHaveBeenCalledTimes(0)
        resolve()
      })
    },
    options
  )
})
