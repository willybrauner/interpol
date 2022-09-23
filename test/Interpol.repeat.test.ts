import { it, expect, describe, vi } from "vitest"
import { Interpol } from "../src"
import { wait } from "./utils/wait"
import { randomRange } from "./utils/randomRange"

describe.concurrent.only("Interpol repeat", () => {
  it("should repeat a the interpolation X time and call X time onComplete", async () => {
    const onCompleteMock = vi.fn()
    return new Promise(async (resolve: any) => {
      const repeatsNumbers = new Array(10).fill(null).map((e) => randomRange(1, 10, 0))
      for (let i = 0; i < repeatsNumbers.length; i++) {
        const repeatNum = repeatsNumbers[i]
        const itp = new Interpol({
          to: 10 * repeatNum,
          duration: 100 * repeatNum,
          repeat: repeatNum,
          onComplete: () => {
            console.log("onComplete")
            onCompleteMock()
          },
          onRepeatComplete: () => {
            expect(onCompleteMock).toHaveBeenCalledTimes(repeatNum)
          },
        })
      }
      resolve()
    })
  })

  it("should reset repeatCounter on stop", async () => {})

  it("should not repeat if repeat is 0", async () => {})

  it("should repeat indefinitely if repeat number is negative", async () => {})

  it("should resolve play promise when all repeat are complete", async () => {})
})
