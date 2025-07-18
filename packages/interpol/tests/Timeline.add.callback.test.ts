import { it, expect, describe, vi } from "vitest"
import { Timeline } from "../src"
import "./_setup"

describe("Timeline add callback", () => {
  /**
   * We assume that the tl.time is a physical time in ms
   * It can't reflect the exact position set via duration because depend on RAF
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

    // console.log("Callback execution times:", callbackTimes)
    // console.log("Expected times:", [0, 100, 150, 300, 650])

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

  it("should execute single callback without offset", async () => {
    const cb = vi.fn()
    const tl = new Timeline({ paused: true })
    tl.add(() => cb())
    await tl.play()
    expect(cb).toHaveBeenCalledTimes(1)
  })

  it("should execute single callback with absolute offset", async () => {
    const cb = vi.fn()
    const tl = new Timeline({ paused: true })
    tl.add(() => cb(), 100) // absolute offset of 100ms
    await tl.play()
    expect(cb).toHaveBeenCalledTimes(1)
  })

  it("should execute single callback with relative offset", async () => {
    const cb = vi.fn()
    const tl = new Timeline({ paused: true })
    tl.add(() => cb(), "+=100") // relative offset of 100ms
    await tl.play()
    expect(cb).toHaveBeenCalledTimes(1)
  })

  it("should execute callback when using progress() method", async () => {
    const cb = vi.fn()
    const tl = new Timeline({ paused: true })
    tl.add(() => cb())
    tl.progress(0, false)
    expect(cb).toHaveBeenCalledTimes(1)
    tl.progress(1, false)
    expect(cb).toHaveBeenCalledTimes(1)

    cb.mockClear()
    tl.progress(0, false)
    expect(cb).toHaveBeenCalledTimes(0)
    tl.progress(0.5, false)
    expect(cb).toHaveBeenCalledTimes(0)
    tl.progress(1, false)
    expect(cb).toHaveBeenCalledTimes(0)
  })

  it("should execute single callback with offset when using progress() method", async () => {
    const cb = vi.fn()
    const tl = new Timeline({ paused: true })
    tl.add(() => cb(), 100)
    tl.progress(0, false)
    expect(cb).toHaveBeenCalledTimes(0)
    tl.progress(0.5, false)
    expect(cb).toHaveBeenCalledTimes(0)
    // + 1 when go to 1
    tl.progress(1, false)
    expect(cb).toHaveBeenCalledTimes(1)
    tl.progress(0, false)
    expect(cb).toHaveBeenCalledTimes(1)
    tl.progress(0.2, false)
    expect(cb).toHaveBeenCalledTimes(1)
    // + 1 when go to 1
    tl.progress(1, false)
    expect(cb).toHaveBeenCalledTimes(2)
  })

  it("should execute callback when his position is on the last of the timeline", async () => {
    const OFFSETS = ["0", "+=250", "-=50", 0, 100, 500, 233]

    for (let offset of OFFSETS) {
      const cb = vi.fn()
      const tl = new Timeline({ paused: true })
      tl.add({ duration: 100 })
      tl.add({ duration: 20 })
      tl.add(() => cb(), offset)
      await tl.play()
      expect(cb).toHaveBeenCalledTimes(1)
    }
  })

  it.only("should execute tl.add() callback with absolute offset, no matter the order", async () => {
    const cb = vi.fn((n: number) => n)
    let tl: Timeline

    // Set relative add offset from the beginning
    tl = new Timeline({ paused: true })
    tl.add({ duration: 100, onComplete: () => cb(3) })
    tl.add({ duration: 50, onComplete: () => cb(4) })
    tl.add(() => cb(1), 0)
    tl.add(() => cb(2), 20)
    tl.add(() => cb(5), 200)
    await tl.play()
    for (let i = 1; i <= 5; i++) expect(cb).toHaveBeenNthCalledWith(i, i)
    cb.mockClear()

    // Set relative add offset from the end
    tl = new Timeline({ paused: true })
    tl.add(() => cb(1), 0)
    tl.add(() => cb(5), 200)
    tl.add(() => cb(2), 20)
    tl.add({ duration: 100, onComplete: () => cb(3) })
    tl.add({ duration: 50, onComplete: () => cb(4) })
    await tl.play()
    for (let i = 1; i <= 5; i++) expect(cb).toHaveBeenNthCalledWith(i, i)
    cb.mockClear()

    // shuffle
    tl = new Timeline({ paused: true })
    tl.add(() => cb(2), 20)
    tl.add({ duration: 100, onComplete: () => cb(3) })
    tl.add(() => cb(5), 200)
    tl.add({ duration: 50, onComplete: () => cb(4) })
    tl.add(() => cb(1), 0)
    await tl.play()
    for (let i = 1; i <= 5; i++) expect(cb).toHaveBeenNthCalledWith(i, i)
  })
})
