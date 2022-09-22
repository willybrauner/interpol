import { it, expect, describe, vi } from "vitest"
import { Interpol } from "../src"

describe.concurrent("Interpol delay", () => {
  it("play process a delay", async () => {
    const delay = 200
    const mock = vi.fn()
    const itp = new Interpol({
      to: 100,
      delay,
      onComplete: () => mock(),
    })

    // during the delay
    await new Promise((r) => setTimeout(r, delay * 0.5))
    expect(itp.isPlaying).toBe(true)
    expect(itp.time).toBe(0)
    expect(itp.advancement).toBe(0)
    expect(itp.value).toBe(0)
    await new Promise((r) => setTimeout(r, delay))

    // after the delay
    expect(itp.time).toBeGreaterThan(0)
    expect(itp.advancement).toBeGreaterThan(0)
    expect(itp.value).toBeGreaterThan(0)
  })
})
