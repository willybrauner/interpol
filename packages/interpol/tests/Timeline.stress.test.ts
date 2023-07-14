import { it, expect, vi, describe } from "vitest"
import { Interpol, Timeline } from "../src"
import { randomRange } from "./utils/randomRange"

describe.concurrent("Timeline stress test", () => {
  it("should play multiple timelines properly", () => {
    const oneTl = ({ itpNumber, itpDuration }) =>
      new Promise(async (resolve: any) => {
        let t, a
        const timelineDuration = itpNumber * itpDuration

        // Create TL
        const tl = new Timeline({
          onUpdate: ({ time, progress }) => {
            t = time
            a = progress
            expect(t).toBeGreaterThan(0)
            expect(a).toBeGreaterThan(0)
          },
          onComplete: ({ time, progress }) => {
            expect(time).toBe(timelineDuration)
            expect(progress).toBe(1)
          },
          paused: true,
        })

        // Add interpol to the TL
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

    const TESTS_NUMBER = 1

    const tls = new Array(TESTS_NUMBER).fill(null).map((_) => {
      const itpNumber = randomRange(1, 20)
      const itpDuration = randomRange(1, 500)
      return oneTl({
        itpNumber: randomRange(1, 20),
        itpDuration: randomRange(1, 500),
      })
    })

    return Promise.all(tls)
  })
})
