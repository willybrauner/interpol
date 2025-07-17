import { it, expect, describe, vi } from "vitest"
import { Timeline } from "../src"
import "./_setup"
import { off } from "process"

describe("Timeline add callback", () => {
  it("should have exact time in callback", async () => {
    const cb = vi.fn((arg) => {
      //console.log(arg)
      return arg
    })

    const tl = new Timeline({ paused: true })

    tl.add({
      duration: 100,
    })
    // 100
    tl.add((...args) => cb(tl.time))

    // 50, absolute
    tl.add(() => cb(tl.time), 50)

    tl.add({
      duration: 100,
    })

    tl.add({
      duration: 200,
    })
    // 150, absolute
    tl.add(() => cb(tl.time), 150)
    // 300, absolute
    tl.add(() => cb(tl.time), 300)

    // 400 because it follows the lase add with duration 200  (relative)
    tl.add(() => cb(tl.time), "+=0")

    // 700, absolute
    tl.add(() => cb(tl.time), 560)

    await tl.play()

    const times = [50, 100, 150, 300, 300, 560]
    for (let i = 0; i < times.length; i++) {
      expect(cb).toHaveBeenCalledTimes(times.length)
      expect(cb).toHaveBeenNthCalledWith(i + 1, times[i])
    }
  })

  it("should have execute multiple absolute add callback offset", async () => {
    for (let [NUM, OFFSET] of [
      [10, `+=10`],
      [10, `-=10`],
      [100, 0],
      [100, 100],
      [1000, 200],
      [10000, 100],
    ]) {
      const cb = vi.fn()
      const tl = new Timeline({ paused: true })
      for (let i = 0; i < (NUM as number); i++) {
        tl.add(() => cb(tl.time), OFFSET)
      }
      await tl.play()
      expect(cb).toHaveBeenCalledTimes(NUM as number)
    }
  })
})
