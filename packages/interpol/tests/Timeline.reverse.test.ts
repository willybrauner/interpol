import { it, expect, vi, describe } from "vitest"
import { Timeline } from "../src"
import { wait } from "./utils/wait"

describe.concurrent("Timeline reverse", () => {
  it("should reverse timeline properly", () => {
    let t, a
    return new Promise(async (resolve: any) => {
      const onComplete = vi.fn()
      const tl = new Timeline({
        paused: true,
        onUpdate: ({ time, progress }) => {
          t = time
          a = progress
        },
        onComplete,
      })
      // accept instance
      tl.add({ to: 1000 })
      tl.add({ to: 1000 })
      await tl.play()
      await wait(300)
      tl.reverse().then(() => {
        expect(t).toBe(0)
        expect(a).toBe(0)
        resolve()
      })
      expect(onComplete).toBeCalledTimes(1)
    })
  })
})