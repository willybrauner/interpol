import { it, expect, vi, describe } from "vitest"
import { timeline } from "../src"
import "./_setup"
import { wait } from "./utils/wait"

describe.concurrent("timeline reverse", () => {
  it("should reverse timeline properly", () => {
    const timeMock = vi.fn(() => 0)
    const progressMock = vi.fn(() => 0)
    const onCompleteMock = vi.fn()
    const reverseCompleteMock = vi.fn()

    return new Promise(async (resolve: any) => {
      const tl = timeline({
        paused: true,
        onUpdate: (time, progress) => {
          timeMock.mockReturnValue(time)
          progressMock.mockReturnValue(progress)
        },
        onComplete: () => {
          onCompleteMock()

          if (!tl.isReversed) {
            expect(timeMock()).toBe(200)
            expect(progressMock()).toBe(1)
          } else {
            expect(timeMock()).toBe(0)
            expect(progressMock()).toBe(0)
          }
        },
      })

      tl.add({ duration: 100 })
      tl.add({ duration: 100 })

      await tl.play()
      await tl.reverse()
      await tl.play()
      tl.reverse().then(() => {
        reverseCompleteMock()
      })
      // reverse is not complete yet
      expect(reverseCompleteMock).toBeCalledTimes(0)
      await wait(300)
      // reverse is complete
      expect(reverseCompleteMock).toBeCalledTimes(1)

      // onComplete is called 2 times
      expect(onCompleteMock).toBeCalledTimes(2)
      resolve()
    })
  })
})
