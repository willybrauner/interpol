import { it, expect, describe, vi } from "vitest"
import { Interpol } from "../src"

describe.concurrent("Interpol play", () => {
  it("should auto play by default", async () => {
    const mock = vi.fn()
    return new Promise((resolve: any) => {
      const itp = new Interpol({
        from: 5,
        to: 100,
        duration: 100,
        onUpdate: () => expect(itp.isPlaying).toBe(true),
        onComplete: () => mock(),
      })
      setTimeout(() => {
        expect(mock).toHaveBeenCalledTimes(1)
        expect(itp.isPlaying).toBe(false)
        resolve()
      }, itp.duration + 100)
    })
  })

  it("should not auto play if paused is set", async () => {
    const mock = vi.fn()
    return new Promise((resolve: any) => {
      const itp = new Interpol({
        from: 5,
        to: 100,
        duration: 100,
        paused: true,
        onUpdate: () => mock(),
        onComplete: () => mock(),
      })
      expect(itp.isPlaying).toBe(false)
      setTimeout(() => {
        expect(itp.advancement).toBe(0)
        expect(mock).toHaveBeenCalledTimes(0)
        resolve()
      }, itp.duration)
    })
  })

  it("play should return a resolved promise when complete", async () => {
    const mock = vi.fn()
    const itp = new Interpol({
      to: 100,
      paused: true,
      onComplete: () => mock(),
    })
    await itp.play()
    expect(itp.isPlaying).toBe(false)
    expect(mock).toBeCalledTimes(1)
  })
})
