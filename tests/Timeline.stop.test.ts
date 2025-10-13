import { it, expect, vi, describe } from "vitest"
import { Interpol, Timeline } from "../src"
import { randomRange } from "./utils/randomRange"
import { wait } from "./utils/wait"
import "./_setup"

describe.concurrent("Timeline stop", () => {
  it("Timeline should stop and play properly", () => {
    const oneTl = ({ itpNumber = 3, itpDuration = 50 }) =>
      new Promise(async (resolve: any) => {
        const timelineDuration = itpNumber * itpDuration
        const onCompleteMock = vi.fn()

        const tl = new Timeline({
          onUpdate: (time, progress) => {
            expect(time).toBeGreaterThanOrEqual(0)
            expect(progress).toBeGreaterThanOrEqual(0)
          },
          onComplete: (time, progress) => {
            expect(time).toBe(timelineDuration)
            expect(progress).toBe(1)
            onCompleteMock()
            onCompleteMock.mockClear()
          },
        })

        for (let i = 0; i < itpNumber; i++) {
          tl.add(
            new Interpol({
              v: [randomRange(-10000, 10000), randomRange(-10000, 10000)],
              duration: itpDuration,
            }),
          )
        }

        // play and stop at 50% of the timeline
        tl.play()
        await wait(timelineDuration * 0.5)
        tl.stop()

        // have been reset after stop
        expect(tl.time).toBe(0)
        expect(tl.progress()).toBe(0)

        // OnComplete should not have been called
        expect(onCompleteMock).toHaveBeenCalledTimes(0)

        resolve()
      })

    const TESTS_NUMBER = 1

    const tls = new Array(TESTS_NUMBER).fill(null).map((_) => {
      const itpNumber = randomRange(1, 10)
      const itpDuration = randomRange(10, 400)
      return oneTl({ itpNumber, itpDuration })
    })

    return Promise.all(tls)
  })
})
