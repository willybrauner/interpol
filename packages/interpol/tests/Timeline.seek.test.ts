import { it, expect, vi, describe } from "vitest"
import { Timeline } from "../src"
import "./_setup"

describe.concurrent("Timeline seek", () => {
  it("Timeline should be seekable to specific tl progress", () => {
    return new Promise(async (resolve: any) => {
      const mock = vi.fn()
      const tl = new Timeline({ paused: true })
      tl.add({
        props: { v: [0, 100] },
        duration: 200,
        onUpdate: ({ v }) => mock(v),
      })
      for (let v of [0.25, 0.5, 0.75, 1]) {
        tl.seek(v)
        expect(mock).toHaveBeenCalledWith(100 * v)
      }
      resolve()
    })
  })

  it("Timeline should execute interpol's events callbacks on seek if suppressEvents is false", () => {
    return new Promise(async (resolve: any) => {
      const onComplete1 = vi.fn()
      const onComplete2 = vi.fn()
      const onTlComplete = vi.fn()
      const tl = new Timeline({ paused: true, onComplete: onTlComplete })
      tl.add({
        props: { v: [0, 100] },
        duration: 100,
        onComplete: onComplete1,
      })
      tl.add({
        props: { v: [0, 100] },
        duration: 100,
        onComplete: onComplete2,
      })

      tl.seek(0.5, false, false)
      expect(onComplete1).toHaveBeenCalledTimes(1)
      expect(onComplete2).toHaveBeenCalledTimes(0)
      tl.seek(1, false, false)
      expect(onComplete1).toHaveBeenCalledTimes(1)
      expect(onComplete2).toHaveBeenCalledTimes(1)
      tl.seek(0.5, false, false)
      expect(onComplete1).toHaveBeenCalledTimes(1)
      expect(onComplete2).toHaveBeenCalledTimes(1)
      tl.seek(1, false, false)
      expect(onComplete1).toHaveBeenCalledTimes(1)
      expect(onComplete2).toHaveBeenCalledTimes(2)

      // because 3th argument suppressTlEvents is "false"
      expect(onTlComplete).toHaveBeenCalledTimes(2)

      resolve()
    })
  })

  it("Timeline should execute interpol's events callbacks on seek if suppressEvents is true", () => {
    return new Promise(async (resolve: any) => {
      const onComplete1 = vi.fn()
      const onComplete2 = vi.fn()
      const onTlComplete = vi.fn()
      const tl = new Timeline({ paused: true, onComplete: onTlComplete })
      tl.add({
        props: { v: [0, 100] },
        duration: 100,
        onComplete: onComplete1,
      })
      tl.add({
        props: { v: [0, 100] },
        duration: 100,
        onComplete: onComplete2,
      })

      tl.seek(0.5)
      expect(onComplete1).toHaveBeenCalledTimes(0)
      expect(onComplete2).toHaveBeenCalledTimes(0)
      tl.seek(1)
      expect(onComplete1).toHaveBeenCalledTimes(0)
      expect(onComplete2).toHaveBeenCalledTimes(0)
      tl.seek(0.5)
      expect(onComplete1).toHaveBeenCalledTimes(0)
      expect(onComplete2).toHaveBeenCalledTimes(0)
      tl.seek(1)
      expect(onComplete1).toHaveBeenCalledTimes(0)
      expect(onComplete2).toHaveBeenCalledTimes(0)

      // because 3th argument suppressTlEvents is "true" by default
      expect(onTlComplete).toHaveBeenCalledTimes(0)

      resolve()
    })
  })
})
