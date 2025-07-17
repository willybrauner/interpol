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
    tl.add({
      duration: 100,
    })
    // Callback should execute around 100ms
    tl.add(() => callbackTimes.push(tl.time))
    // Callback at 50ms (absolute)
    tl.add(() => callbackTimes.push(tl.time), 50)

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

    await tl.play()

    // We just verify that callbacks execute, accepting that tl.time
    // reflects the current timeline progression time
    expect(callbackTimes.length).toBeGreaterThan(0)
    expect(callbackTimes).toHaveLength(5)
    const expectedTimes = [50, 100, 150, 300, 650]
    callbackTimes.forEach((actual, i) => {
      expect(Math.abs(actual - expectedTimes[i])).toBeLessThanOrEqual(32)
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
})
