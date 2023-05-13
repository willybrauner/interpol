import { it, expect, describe, vi } from "vitest"
import { Interpol } from "../src"

describe.concurrent("Interpol play", () => {
  it("should auto play by default", async () => {
    const itp = new Interpol({
      from: 5,
      to: 100,
      duration: 100,
      onUpdate: () => {
        expect(itp.isPlaying).toBe(true)
      },
      onComplete: () => {
        // here, isPlaying remains true, but not after promise resolve
      },
    })

    itp.play().then(() => {
      expect(itp.isPlaying).toBe(false)
    })
  })

  it("should not auto play if paused is set", async () => {
    const mock = vi.fn()
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
      expect(itp.progress).toBe(0)
      expect(mock).toHaveBeenCalledTimes(0)
    }, itp._duration)
  })

  it("play should return a resolved promise when complete", async () => {
    return new Promise(async (resolve: any) => {
      const mock = vi.fn()
      const itp = new Interpol({
        to: 100,
        duration: 100,
        paused: true,
        onComplete: () => mock(),
      })
      await itp.play()
      expect(itp.isPlaying).toBe(false)
      expect(mock).toBeCalledTimes(1)
      resolve()
    })
  })

  it("play should play with duration 0", async () => {
    const mock = vi.fn()
    return new Promise((resolve: any) => {
      new Interpol({
        to: 1000,
        duration: 0,
        onUpdate: () => {
          mock()
          expect(mock).toBeCalledTimes(1)
        },
        onComplete: ({ value, time, progress }) => {
          mock()
          expect(mock).toBeCalledTimes(2)
          expect(time).toBe(0)
          resolve()
        },
      })
    })
  })
})
