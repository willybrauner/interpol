import { it, expect, describe, vi } from "vitest"
import { randomRange } from "./utils/randomRange"
import { Interpol } from "../src"
import { wait } from "./utils/wait"

describe.concurrent("Interpol refresh", () => {
  it("should compute 'from' 'to' and 'duration' if there are functions", async () => {
    return new Promise(async (resolve: any) => {
      const itp = new Interpol({
        props: { v: [() => randomRange(-100, 100), () => randomRange(-100, 100)] },
        duration: () => randomRange(-200, 200),
      })
      expect(typeof itp.props.v._to).toBe("number")
      expect(typeof itp.props.v._from).toBe("number")
      expect(typeof itp.duration).toBe("number")
      resolve()
    })
  })

  it("should re compute if refreshComputedValues() is called", async () => {
    return new Promise(async (resolve: any) => {
      const mockTo = vi.fn()
      const mockFrom = vi.fn()
      const itp = new Interpol({
        props: {
          v: [
            () => {
              mockFrom()
              return randomRange(-100, 100)
            },
            () => {
              mockTo()
              return randomRange(-100, 100)
            },
          ],
        },
        duration: () => 1000,
      })

      expect(mockFrom).toHaveBeenCalledTimes(1)
      expect(mockTo).toHaveBeenCalledTimes(1)
      expect(itp.duration).toBe(1000)
      await wait(itp.duration)
      itp.refreshComputedValues()
      await wait(500)
      expect(mockFrom).toHaveBeenCalledTimes(2)
      expect(mockTo).toHaveBeenCalledTimes(2)
      expect(itp.duration).toBe(1000)
      resolve()
    })
  })
})
