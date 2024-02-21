import { describe, expect, it, vi } from "vitest"
import { Interpol, InterpolOptions, Ticker } from "../src"
import { wait } from "./utils/wait"
import "./_setup"

describe.concurrent("Ticker", () => {
  it("should be disable from options ", () => {
    // disable ticker
    InterpolOptions.ticker.disable()

    const mock = vi.fn()
    return new Promise(async (resolve: any) => {
      new Interpol({
        props: { v: [-100, 100] },
        duration: 100,
        onComplete: mock,
      })
      await wait(110)
      // onComplete should not be called after itp is completed
      expect(mock).toHaveBeenCalledTimes(0)
      resolve()
    })
  })
})
