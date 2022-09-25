import { it, expect, vi, describe } from "vitest"
import { Timeline, Interpol, Ease } from "../src"

describe.concurrent("Timeline", () => {
  it("should exe onComplete on each repeat", () => {
    const pms = (repeatNumber) =>
      new Promise(async (resolve: any) => {
        const onComplete = vi.fn()
        const tl = new Timeline({
          repeat: repeatNumber,
          onComplete,
        })
        tl.add({ from: 0, to: 100, duration: 200 })
        tl.add({ from: 0, to: 100, duration: 100 })
        await tl.play()
        expect(onComplete).toBeCalledTimes(repeatNumber)
        resolve()
      })

    return Promise.all(new Array(10).fill(null).map((el, i) => pms(i + 1)))
  })
})
