import { it, expect, vi, describe } from "vitest"
import { Timeline } from "../src"
import "./_setup"

describe.concurrent("Timeline seek", () => {
  it("Timeline should execute interpol's onComplete on seek", () => {
    return new Promise(async (resolve: any) => {
      const onComplete1 = vi.fn()
      const onComplete2 = vi.fn()
      const tl = new Timeline({ paused: true })
      tl.add({
        props: { v: [0, 100] },
        duration: 200,
        onComplete: () => onComplete1(),
      })
      tl.add({
        props: { v: [0, 100] },
        duration: 200,
        onComplete: () => onComplete2(),
      })

      tl.seek(0.5)
      expect(onComplete1).toHaveBeenCalledTimes(1)
      expect(onComplete2).toHaveBeenCalledTimes(0)
      tl.seek(1)
      expect(onComplete1).toHaveBeenCalledTimes(1)
      expect(onComplete2).toHaveBeenCalledTimes(1)
      tl.seek(0.5)
      expect(onComplete1).toHaveBeenCalledTimes(2)
      expect(onComplete2).toHaveBeenCalledTimes(1)
      tl.seek(1)
      expect(onComplete1).toHaveBeenCalledTimes(2)
      expect(onComplete2).toHaveBeenCalledTimes(2)

      resolve()
    })
  })
})
