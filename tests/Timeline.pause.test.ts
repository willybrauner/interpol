import { it, expect, vi, describe } from "vitest"
import { Timeline, Interpol, Ease } from "../packages"
import { wait } from "./utils/wait"

describe.concurrent("Timeline pause", () => {
  it("Timeline should pause and play properly", () => {
    return new Promise(async (resolve: any) => {
      const tl = new Timeline()
      for (let i = 0; i < 3; i++) {
        tl.add(new Interpol({ to: 100, duration: 200 }))
      }
      tl.play()
      expect(tl.isPlaying).toBe(true)
      tl.pause()
      expect(tl.isPlaying).toBe(false)
      tl.play()
      expect(tl.isPlaying).toBe(true)
      resolve()
    })
  })
})
