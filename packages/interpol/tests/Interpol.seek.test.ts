import { it, expect, vi, describe } from "vitest"
import { Interpol, Timeline } from "../src"
import "./_setup"

describe.concurrent("Interpol seek", () => {
  it("Interpol should be seekable to specific progress", () => {
    return new Promise(async (resolve: any) => {
      const mock = vi.fn()
      const itp = new Interpol({
        props: { v: [0, 100] },
        duration: 1000,
        onUpdate: ({ v }) => mock(v),
      })
      for (let v of [0.25, 0.5, 0.75, 1, 1, 1, .2, .2, 0, 0]) {
        // seek will pause the interpol, that's why the test is instant
        itp.seek(v)
        expect(mock).toHaveBeenCalledWith(100 * v)
      }
      resolve()
    })
  })

  it("Should execute Interpol events callbacks on seek if suppressEvents is false", () => {
    return new Promise(async (resolve: any) => {
      const onComplete = vi.fn()
      const itp = new Interpol({ props: { v: [0, 100] }, onComplete })
      // onComplete is called each time the interpol reach the end (progress 1)
      itp.seek(0.5, false)
      expect(onComplete).toHaveBeenCalledTimes(0)
      itp.seek(1, false) // will call onComplete
      expect(onComplete).toHaveBeenCalledTimes(1)
      itp.seek(0.25, false)
      expect(onComplete).toHaveBeenCalledTimes(1)
      itp.seek(1, false) // will call onComplete again
      expect(onComplete).toHaveBeenCalledTimes(2)
      itp.seek(0, false)
      expect(onComplete).toHaveBeenCalledTimes(2)
      resolve()
    })
  })

  it("Shouldn't execute Interpol events callbacks on seek if suppressEvents is true", () => {
    return new Promise(async (resolve: any) => {
      const onComplete = vi.fn()
      const itp = new Interpol({ props: { v: [0, 100] }, onComplete })
      itp.seek(0.5)
      itp.seek(1)
      itp.seek(0.25)
      itp.seek(1)
      itp.seek(0)
      expect(onComplete).toHaveBeenCalledTimes(0)
      resolve()
    })
  })
})
