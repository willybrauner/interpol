import { it, expect, describe, vi } from "vitest"
import { Interpol } from "../src"

describe.concurrent("Interpol beforeStart", () => {
  it("should execute beforeStart before the play", async () => {
    const pms = (paused: boolean) =>
      new Promise(async (resolve: any) => {
        const beforeStart = vi.fn()
        const itp = new Interpol({
          props: { x: [0, 100] },
          duration: 500,
          paused,
          beforeStart,
        })
        expect(beforeStart).toHaveBeenCalledTimes(1)
        await itp.play()
        expect(beforeStart).toHaveBeenCalledTimes(1)
        resolve()
      })

    // play with paused = true
    // play with paused = false
    return Promise.all([pms(true), pms(false)])
  })
})

it("should return a resolved promise when complete", async () => {
  return new Promise(async (resolve: any) => {
    const mock = vi.fn()
    const itp = new Interpol({
      props: { v: [0, 100] },
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