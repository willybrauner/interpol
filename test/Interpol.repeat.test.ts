import { it, expect, describe, vi } from "vitest"
import { Interpol } from "../src"
import { wait } from "./utils/wait"
import { randomRange } from "./utils/randomRange"
import { interpolParamsGenerator } from "./utils/interpolParamsGenerator"

// get random param list { from, to, duration, repeat }
const getParamList = (num = 50) =>
  new Array(num)
    .fill(null)
    .map((_) => interpolParamsGenerator({ duration: randomRange(0, 500, 0) }))
    .sort((a, b) => a.duration * a.repeat - b.duration * a.repeat)

const interpolTest = (params: { from; to; duration; repeat }, resolve, isLast) => {
  const onCompleteMock = vi.fn()
  const onRepeatCompleteMock = vi.fn()
  return new Interpol({
    ...params,
    onComplete: () => onCompleteMock(),
    onRepeatComplete: () => {
      onRepeatCompleteMock()
      expect(onCompleteMock).toHaveBeenCalledTimes(params.repeat)
      expect(onRepeatCompleteMock).toHaveBeenCalledTimes(1)
      if (isLast) resolve()
    },
  })
}

describe.concurrent("Interpol repeat", () => {
  it("should repeat the interpolation X time and call X time onComplete", async () => {
    return new Promise(async (resolve: any) => {
      const paramList = getParamList()
      for (let i = 0; i < paramList.length; i++) {
        const oneRandomParamObj = paramList[i]
        const isLast = paramList.length - 1 === i
        interpolTest(oneRandomParamObj, resolve, isLast)
      }
    })
  })

  it("should reset repeatCounter on stop", async () => {
    const onCompleteMock = vi.fn()
    return new Promise(async (resolve: any) => {
      const itp = new Interpol({
        to: 100,
        duration: 1000,
        repeat: 3,
        paused: true,
        onComplete: onCompleteMock,
        onRepeatComplete: () => {
          expect(onCompleteMock).toBeCalledTimes(3)
        },
      })
      // play est stop before end
      itp.play()
      await wait(itp._duration * 0.5)
      itp.stop()
      // clear mock and restart
      onCompleteMock.mockClear()
      await itp.play()
      // if mock as been called 3 time in onRepeatComplete (because 3 repeats)
      // we deduce the repeatCounter has been reset between the two play()
      resolve()
    })
  })

  it("should not repeat if repeat is 0", async () => {
    return new Promise(async (resolve: any) => {
      const onCompleteMock = vi.fn()
      const onRepeatCompleteMock = vi.fn()
      const itp = new Interpol({
        to: 100,
        repeat: 0,
        paused: true,
        onComplete: onCompleteMock,
        onRepeatComplete: onRepeatCompleteMock,
      })
      await itp.play()
      expect(onRepeatCompleteMock).toHaveBeenCalledTimes(0)
      expect(onCompleteMock).toHaveBeenCalledTimes(1)
      resolve()
    })
  })

  it("should repeat indefinitely if repeat number is negative", async () => {
    const pms = (duration) =>
      new Promise(async (resolve: any) => {
        let count = 0
        const onRepeatCompleteMock = vi.fn()
        const itp = new Interpol({
          to: 100,
          repeat: -1,
          duration,
          onComplete: () => {
            count++
          },
          onRepeatComplete: onRepeatCompleteMock,
        })

        const repeatNum = 4
        await wait(itp._duration * repeatNum + itp._duration)
        expect(count).toBe(repeatNum)
        expect(onRepeatCompleteMock).toHaveBeenCalledTimes(0)
        resolve()
      })
    return Promise.all([pms(300), pms(500), pms(700), pms(1000)])
  })

  it("should resolve play & replay promise when all repeat are complete", async () => {
    const pms = (func) =>
      new Promise(async (resolve: any) => {
        const onCompleteMock = vi.fn()
        const itp = new Interpol({
          to: 100,
          repeat: 8,
          duration: 100,
          paused: true,
        })
        await itp[func]()
        onCompleteMock()
        expect(onCompleteMock).toHaveBeenCalledTimes(1)
        resolve()
      })
    return Promise.all([pms("play"), pms(["replay"])])
  })
})
