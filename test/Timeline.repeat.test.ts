import { it, expect, vi, describe } from "vitest"
import { Timeline, Interpol, Ease } from "../src"
import { randomRange } from "./utils/randomRange"

describe.concurrent("Timeline repeat", () => {
  it("should exe onComplete on each repeat and onRepeatComplete once", () => {
    const pms = (repeatNumber) =>
      new Promise(async (resolve: any) => {
        const onComplete = vi.fn()
        const onRepeatComplete = vi.fn()
        const tl = new Timeline({
          repeat: repeatNumber,
          onComplete,
          onRepeatComplete,
        })
        tl.add({ from: 0, to: 100, duration: randomRange(100, 500) })
        tl.add({ from: 0, to: 100, duration: randomRange(100, 500) })
        await tl.play()
        expect(onComplete).toBeCalledTimes(repeatNumber)
        expect(onRepeatComplete).toBeCalledTimes(1)
        resolve()
      })
    return Promise.all(new Array(10).fill(null).map((el, i) => pms(i + 1)))
  })
})
