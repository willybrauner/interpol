import { it, expect, vi, describe } from "vitest"
import { Timeline } from "../src"
import "./_setup"
import { wait } from "./utils/wait"

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

  it.only("Should call onStart with params when the animation starts", () => {
    return new Promise(async (resolve: any) => {
      const onStart = vi.fn((...args) => {
        // console.log("onStart", args)
      })
      const tl = new Timeline({ paused: true, onStart })
      tl.add({
        v: 100,
        duration: 100,
      })
      await tl.play()
      const [time, progress] = onStart.mock.calls[0]
      expect(onStart).toHaveBeenCalledTimes(1)
      expect(time).toEqual(0)
      expect(progress).toEqual(0)

      tl.play()
      await wait(50)
      expect(onStart).toHaveBeenCalledTimes(2)
      expect(time).toEqual(0)
      expect(progress).toEqual(0)

      // replay before, the end
      tl.play()
      expect(onStart).toHaveBeenCalledTimes(3)
      resolve()
    })
  })

  it("Sould call onStart if timeline play with a from value", () => {
    return new Promise(async (resolve: any) => {
      const onStart = vi.fn()
      const tl = new Timeline({ paused: true, onStart })
      tl.add({
        v: [0, 100],
        duration: 100,
      })
      await tl.play(0.5)
      expect(onStart).toHaveBeenCalledTimes(1)
      expect(onStart.mock.calls[0][0]).toEqual(50)
      expect(onStart.mock.calls[0][1]).toEqual(0.5)
      resolve()
    })
  })
})
