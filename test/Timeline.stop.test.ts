import { it, expect, vi, describe } from "vitest"
import { Timeline, Interpol, Ease } from "../src"
import { wait } from "./utils/wait"

describe.concurrent("Timeline stop", () => {

  it("Timeline should stop and play properly", () => {
    return new Promise(async (resolve: any) => {
      const tl = new Timeline()
      for (let i = 0; i < 3; i++) {
        tl.add(new Interpol({ to: 100, duration: 200 }))
      }
    // FIXME better test with tl.onUpdate
      tl.play()
      expect(tl.isPlaying).toBe(true)
      tl.stop()
      expect(tl.isPlaying).toBe(false)
      tl.play()
      expect(tl.isPlaying).toBe(true)
      resolve()
    })
  })
})
