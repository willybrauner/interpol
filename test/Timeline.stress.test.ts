import { it, expect, vi, describe } from "vitest"
import { Timeline, Interpol, Ease } from "../src"
import { randomRange } from "./utils/randomRange"
import { wait } from "./utils/wait"

describe.concurrent("Timeline stress test", () => {
  it("Timeline should play mutilples timelines properly", () => {
    const oneTl = ({ itpNumber = 3, itpDuration = 200 }) =>
      new Promise(async (resolve: any) => {
        let t, a
        const timelineDuration = itpNumber * itpDuration

        const tl = new Timeline({
          onUpdate: ({ time, advancement }) => {
            t = time
            a = advancement
            expect(t).toBeGreaterThan(0)
            expect(a).toBeGreaterThan(0)
          },
          onComplete: ({ time, advancement }) => {
            expect(time).toBe(timelineDuration)
            expect(advancement).toBe(1)
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

        tl.play().then(() => {
          expect(t).toBe(timelineDuration)
          expect(a).toBe(1)
          resolve()
        })
      })

    const TESTS_NUMBER = 500

    const tls = new Array(TESTS_NUMBER).fill(null).map((_) => {
      const itpNumber = randomRange(1, 10)
      const itpDuration = randomRange(1, 500)
      return oneTl({ itpNumber, itpDuration })
    })

    return Promise.all(tls)
  })
})
