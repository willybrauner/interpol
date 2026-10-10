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

  it("Timeline should not autoplay if stop() is called synchronously after add()", async () => {
    const tlOnUpdate = vi.fn()
    const itpOnUpdate = vi.fn()
    const tl = new Timeline({ onUpdate: tlOnUpdate })
    tl.add({ v: [0, 100], duration: 50, onUpdate: itpOnUpdate })
    tl.stop()

    await wait(100)
    expect(tlOnUpdate).toHaveBeenCalledTimes(0)
    expect(itpOnUpdate).toHaveBeenCalledTimes(0)
    expect(tl.isPlaying).toBe(false)
  })

  it("Timeline should stay reversed if reverse() is called synchronously after add()", async () => {
    const tl = new Timeline()
    tl.add({ v: [0, 100], duration: 200 })
    tl.reverse()

    // let the autoplay microtask run
    await Promise.resolve()
    expect(tl.isReversed).toBe(true)
    tl.stop()
  })
})
