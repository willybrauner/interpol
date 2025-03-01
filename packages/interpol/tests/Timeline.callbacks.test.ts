import { it, expect, vi, describe } from "vitest"
import { Timeline } from "../src"
import "./_setup"

describe.concurrent("Timeline callbacks", () => {
  it("Timeline should execute Timeline events callback once & on play only", () => {
    return new Promise(async (resolve: any) => {
      const onComplete = vi.fn()
      const tl = new Timeline({ paused: true, onComplete })
      tl.add({
        v: [0, 100],
        duration: 100,
      })
      tl.add({
        v: [0, 100],
        duration: 100,
      })
      await tl.play()
      expect(onComplete).toHaveBeenCalledTimes(1)
      await tl.reverse()
      expect(onComplete).toHaveBeenCalledTimes(1)
      resolve()
    })
  })

  it("Timeline should execute interpol's onComplete once", () => {
    return new Promise(async (resolve: any) => {
      const onComplete1 = vi.fn()
      const onComplete2 = vi.fn()
      const tl = new Timeline({ paused: true })
      tl.add({
        v: [0, 100],
        duration: 100,
        onComplete: () => onComplete1(),
      })
      tl.add({
        v: [0, 100],
        duration: 100,
        onComplete: () => onComplete2(),
      })
      await tl.play()
      expect(onComplete1).toHaveBeenCalledTimes(1)
      await tl.reverse()
      expect(onComplete2).toHaveBeenCalledTimes(1)
      resolve()
    })
  })

  it("Call onUpdate once on beforeStart if immediateRender is true", () => {
    return new Promise(async (resolve: any) => {
      const onUpdate = vi.fn()
      const onUpdate2 = vi.fn()

      const tl = new Timeline({ paused: true })
      tl.add({
        v: [0, 100],
        duration: 100,
        immediateRender: true,
        onUpdate,
      })
      tl.add({
        v: [0, 100],
        duration: 100,
        onUpdate: onUpdate2,
      })

      expect(onUpdate).toHaveBeenCalledTimes(1)
      expect(onUpdate2).toHaveBeenCalledTimes(0)

      resolve()
    })
  })
})
