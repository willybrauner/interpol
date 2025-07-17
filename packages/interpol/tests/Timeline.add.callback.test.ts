import { it, expect, describe, vi } from "vitest"
import { Timeline } from "../src"
import "./_setup"

describe("Timeline add callback", () => {
  /**
   * We assume that the tl.time is a physical time in ms
   * It can't reflect the exact position set via duration beacause depend on RAF
   *
   * ex:
   *  tl.add(() => {}, 50) // will maybe execute around 64ms and it's ok
   */
  it("should execute callbacks at their intended times", async () => {
    const callbackTimes: number[] = []
    const tl = new Timeline({ paused: true })

    // normal ITP
    tl.add({
      duration: 100,
    })
    // Callback should execute around 100ms
    tl.add(() => callbackTimes.push(tl.time))
    // normal ITP
    tl.add({
      duration: 100,
    })
    // normal ITP
    tl.add({
      duration: 200,
    })
    // Callback at 150ms (absolute)
    tl.add(() => callbackTimes.push(tl.time), 150)
    // Callback at 300ms (absolute)
    tl.add(() => callbackTimes.push(tl.time), 300)
    // Callback at 300ms (absolute)
    tl.add(() => callbackTimes.push(tl.time), 650)
    // Callback at 0ms (absolute) - Position should be independent of add order
    tl.add(() => callbackTimes.push(tl.time), 0)
    await tl.play()

    console.log("Callback execution times:", callbackTimes)
    console.log("Expected times:", [0, 100, 150, 300, 650])

    // We just verify that callbacks execute in the right order and timing range
    expect(callbackTimes.length).toBe(5)

    // Check order: callbacks should execute in chronological order regardless of add order
    const sortedTimes = [...callbackTimes].sort((a, b) => a - b)
    expect(callbackTimes).toEqual(sortedTimes)

    // Check that times are in reasonable ranges (allowing for RAF timing variations)
    const expectedRanges = [
      [0, 30],
      [80, 130],
      [130, 180],
      [280, 330],
      [630, 680],
    ]

    callbackTimes.forEach((actual, i) => {
      const [min, max] = expectedRanges[i]
      expect(actual).toBeGreaterThanOrEqual(min)
      expect(actual).toBeLessThanOrEqual(max)
    })
  })

  it("should execute multiple callbacks with different offsets", async () => {
    for (let [NUM, OFFSET] of [
      [10, `+=10`],
      [10, `-=10`],
      [100, 0],
      [100, 100],
      [50, 200],
    ]) {
      const cb = vi.fn()
      const tl = new Timeline({ paused: true })
      for (let i = 0; i < (NUM as number); i++) {
        tl.add(() => cb(), OFFSET)
      }
      await tl.play()
      expect(cb).toHaveBeenCalledTimes(NUM as number)
    }
  })

  it("should execute single callbacks with absolute offset", async () => {
    const cb = vi.fn()
    const tl = new Timeline({ paused: true })
    tl.add(() => cb(), "200")
    await tl.play()
    expect(cb).toHaveBeenCalledTimes(1)
  })
})
