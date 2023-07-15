import { it, expect, vi, describe } from "vitest"
import { Timeline } from "../src"
import { wait } from "./utils/wait"

describe.concurrent("Timeline reverse", () => {
  it("should reverse timeline properly", () => {
    const timeMock = vi.fn(() => 0)
    const progressMock = vi.fn(() => 0)
    const onCompleteMock = vi.fn()

    return new Promise(async (resolve: any) => {
      const tl = new Timeline({
        paused: true,
        onUpdate: ({ time, progress }) => {
          timeMock.mockReturnValue(time)
          progressMock.mockReturnValue(progress)
        },
        onComplete: ({ time, progress }) => {
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
      // accept instance
      tl.add({ to: 1000, duration: 100 })
      tl.add({ to: 1000, duration: 100 })

      await tl.play()
      await tl.reverse()
      await tl.play()
      await tl.reverse()
      
      expect(onCompleteMock).toBeCalledTimes(4)
      resolve()
    })
  })
})
