import { it, expect, describe, vi } from "vitest"
import { Interpol } from "../src"
import { wait } from "./utils/wait"
import "./_setup"

describe.concurrent("Interpol reverse", () => {
  it("should update 'isRevered' state", async () => {
    return new Promise(async (resolve: any) => {
      const duration = 500
      const itp = new Interpol({
        paused: true,
        duration,
      })
      expect(itp.isReversed).toBe(false)
      await wait(100)
      itp.reverse()
      expect(itp.isReversed).toBe(true)
      resolve()
    })
  })

  it("should not call onComplete if play is not resolved", async () => {
    const onComplete = vi.fn()
    return new Promise(async (resolve: any) => {
      const duration = 300
      const itp = new Interpol({
        paused: true,
        duration,
        onComplete,
      })

      itp.play()
      await wait(duration / 2)
      itp.reverse()
      await wait(duration)
      expect(onComplete).toHaveBeenCalledTimes(0)
      resolve()
    })
  })

  it("should resolve reverse() promise when reverse is complete", async () => {
    const test = async ({ duration, waitBetweenPlayAndReverse }) => {
      const reverseComplete = vi.fn()
      const itp = new Interpol({ duration, paused: true })
      // play and wait half duration
      itp.play()
      await wait(waitBetweenPlayAndReverse)
      // reverse during the play
      await itp.reverse().then(() => reverseComplete())
      // the reverse() promise should resolve when the reverse is complete
      expect(reverseComplete).toHaveBeenCalledTimes(1)
    }

    return Promise.all([
      // wait long time between play and reverse
      test({
        duration: 100,
        waitBetweenPlayAndReverse: 100 * 2,
      }),

      // wait only the duration of the play before reverse
      test({
        duration: 100,
        waitBetweenPlayAndReverse: 100,
      }),

      // wait half the duration of the play before reverse
      // Start the reverse during the play
      test({
        duration: 100,
        waitBetweenPlayAndReverse: 100 / 2,
      }),
    ])
  })
})
