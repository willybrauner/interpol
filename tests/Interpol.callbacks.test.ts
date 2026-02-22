import { it, expect, describe, vi } from "vitest"
import { Interpol } from "../src"
import "./_setup"
import { wait } from "./utils/wait"

describe.concurrent("Interpol callbacks", () => {
  it("should return a resolved promise when complete", async () => {
    return new Promise(async (resolve: any) => {
      const mock = vi.fn()
      const itp = new Interpol({
        v: [0, 100],
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

  it("Call onUpdate once if immediateRender is true", () => {
    const test = (immediateRender: boolean) =>
      new Promise(async (resolve: any) => {
        const onUpdate = vi.fn()
        new Interpol({
          paused: true,
          v: [0, 100],
          duration: 100,
          immediateRender,
          onUpdate,
        })
        expect(onUpdate).toHaveBeenCalledTimes(immediateRender ? 1 : 0)
        resolve()
      })
    return Promise.all([test(true), test(false)])
  })

  it("Should call onStart each time, we replay after or during a play", () => {
    return new Promise(async (resolve: any) => {
      const onStart = vi.fn()
      const itp = new Interpol({
        x: [0, 100],
        y: [-20, 100],
        duration: 150,
        paused: true,
        onStart: (props, time, progress) => {
          onStart()
          expect(props).toEqual({ x: 0, y: -20 })
          expect(time).toBe(0)
          expect(progress).toBe(0)
        },
      })

      // onStart is not already called
      expect(onStart).toHaveBeenCalledTimes(0)

      // onStart is called on play()
      await itp.play()
      expect(onStart).toHaveBeenCalledTimes(1)

      // if doesn't start from 0, onStart is not called
      await itp.play(0.5)
      expect(onStart).toHaveBeenCalledTimes(1)

      // if we play again from 0, onStart is called again
      await itp.play()
      expect(onStart).toHaveBeenCalledTimes(2)

      itp.play()
      // do not wait the end of the animation
      await wait(100)
      expect(onStart).toHaveBeenCalledTimes(3)

      itp.play()
      // wait delay after the end of the animation
      await wait(250)
      expect(onStart).toHaveBeenCalledTimes(4)

      resolve()
    })
  })

  it("Should not call onStart on reverse", () => {
    return new Promise(async (resolve: any) => {
      const onStart = vi.fn()
      const itp = new Interpol({
        x: [0, 100],
        duration: 100,
        paused: true,
        onStart,
      })
      await itp.play()
      expect(onStart).toHaveBeenCalledTimes(1)
      await itp.reverse()
      expect(onStart).toHaveBeenCalledTimes(1)
      resolve()
    })
  })
})
