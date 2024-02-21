import { describe, expect, it, vi } from "vitest"
import { Interpol, InterpolOptions, Ticker } from "../src"
import { wait } from "./utils/wait"

describe.concurrent("options", () => {
  it("options should expose Ticker instance", () => {
    expect(InterpolOptions.ticker).toBeInstanceOf(Ticker)
  })

  it("options should expose duration and set affect all itps", () => {
    const newDuration = 100
    InterpolOptions.duration = newDuration

    const mock = vi.fn()
    return new Promise(async (resolve: any) => {
      const itp = new Interpol({
        paused: true,
        props: { v: [-100, 100] },
        onComplete: mock,
      })
      expect(itp.duration).toBe(newDuration)

      // second test, play itp
      itp.play()
      const offset = 10
      await wait(newDuration - offset)
      expect(mock).toHaveBeenCalledTimes(0)
      await wait(offset + 10)
      expect(mock).toHaveBeenCalledTimes(1)
      resolve()
    })
  })
})
