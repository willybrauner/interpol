import { it, expect, vi, describe } from "vitest"
import { Timeline, Interpol, Ease } from "../src"
import { randomRange } from "./utils/randomRange"
import { wait } from "./utils/wait"

describe.concurrent("Timeline stop", () => {
  it("Timeline should stop and play properly", () => {
    const oneTl = ({ itpNumber = 3, itpDuration = 200 }) =>
      new Promise(async (resolve: any) => {
        const timelineDuration = itpNumber * itpDuration
        const onCompleteMock = vi.fn()

        const tl = new Timeline({
          onUpdate: ({ time, advancement }) => {
            expect(time).toBeGreaterThan(0)
            expect(advancement).toBeGreaterThan(0)
          },
          onComplete: ({ time, advancement }) => {
            expect(time).toBe(timelineDuration)
            expect(advancement).toBe(1)
            onCompleteMock()
          },
        })

        for (let i = 0; i < itpNumber; i++) {
          tl.add(
            new Interpol({
              from: randomRange(-10000, 10000),
              to: randomRange(-10000, 10000),
              duration: itpDuration,
            })
          )
        }

        tl.play()
        await wait(timelineDuration * 0.5)
        tl.stop()
        expect(tl.time).toBe(0)
        expect(tl.advancement).toBe(0)
        expect(onCompleteMock).toHaveBeenCalledTimes(0)
        resolve()
      })

    const TESTS_NUMBER = 500

    const tls = new Array(TESTS_NUMBER).fill(null).map((_) => {
      const itpNumber = randomRange(1, 10)
      const itpDuration = randomRange(200, 600)
      return oneTl({ itpNumber, itpDuration })
    })

    return Promise.all(tls)
  })
})
