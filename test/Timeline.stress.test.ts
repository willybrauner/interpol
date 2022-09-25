import { it, expect, vi, describe } from "vitest"
import { Timeline, Interpol, Ease } from "../src"
import { wait } from "./utils/wait"

describe.concurrent("Timeline stop", () => {
  it("Timeline should stop and play properly", () => {
    const timeMock = vi.fn()

    return new Promise(async (resolve: any) => {
      const tl = new Timeline({
        onUpdate: ({ time, advancement }) => {

          // FIXME
          timeMock(() => time)
        },
        onComplete: ({ time, advancement }) => {},
      })
      for (let i = 0; i < 3; i++) {
        tl.add(new Interpol({ to: 100, duration: 200 }))
      }
      // FIXME better test with tl.onUpdate
      tl.play()
      await wait(200)
      // expect(timeMock).toBeGreaterThan(200)

      resolve()
    })
  })
})
