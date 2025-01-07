import { it, expect, vi, describe } from "vitest"
import { Timeline } from "../src"
import { randomRange } from "./utils/randomRange"
import "./_setup"

describe.concurrent("Timeline stress test", () => {
  it("should play multiple timelines properly", () => {
    const oneTl = ({ itpNumber, itpDuration }) =>
      new Promise(async (resolve: any) => {
        let timeMock = vi.fn(() => 0)
        let progressMock = vi.fn(() => 0)

        // Create TL
        const tl = new Timeline({
          paused: true,
          onUpdate: (time, progress) => {
            timeMock.mockReturnValue(time)
            progressMock.mockReturnValue(progress)
          },
          onComplete: (time, progress) => {
            const t = timeMock()
            expect(time).toEqual(t)

            const p = progressMock()
            expect(p).toBe(1)
            expect(progress).toEqual(p)

            timeMock.mockClear()
            progressMock.mockClear()
          },
        })

        // Add interpol to the TL
        for (let i = 0; i < itpNumber; i++) {
          tl.add({ duration: itpDuration })
        }

        tl.play().then(resolve)
      })

    const TESTS_NUMBER = 50

    const tls = new Array(TESTS_NUMBER).fill(null).map((_) => {
      return oneTl({
        itpNumber: randomRange(1, 20),
        itpDuration: randomRange(1, 50),
      })
    })

    return Promise.all(tls)
  })
})
