import { it, expect, describe, vi } from "vitest"
import { Interpol } from "../packages"
import { randomRange } from "./utils/randomRange"
import { wait } from "./utils/wait"

describe.concurrent("Interpol refresh", () => {
  it("should compute 'from' 'to' and 'duration' if there are functions", async () => {
    return new Promise(async (resolve: any) => {
      const itp = new Interpol({
        from: () => randomRange(-100, 100),
        to: () => randomRange(-100, 100),
        duration: () => randomRange(-200, 200),
      })
      expect(typeof itp._to).toBe("number")
      expect(typeof itp._from).toBe("number")
      expect(typeof itp._duration).toBe("number")
      resolve()
    })
  })

  it("should re compute if refreshComputedValues() is called", async () => {
    return new Promise(async (resolve: any) => {
      const mockTo = vi.fn()
      const mockFrom = vi.fn()
      const itp = new Interpol({
        from: () => {
          mockFrom()
          return randomRange(-100, 100)
        },
        to: () => {
          mockTo()
          return randomRange(-100, 100)
        },
        duration: () => 1000,
      })

      expect(mockFrom).toHaveBeenCalledTimes(1)
      expect(mockTo).toHaveBeenCalledTimes(1)
      expect(itp._duration).toBe(1000)
      await wait(itp._duration)
      itp.refreshComputedValues()
      await wait(500)
      expect(mockFrom).toHaveBeenCalledTimes(2)
      expect(mockTo).toHaveBeenCalledTimes(2)
      expect(itp._duration).toBe(1000)
      resolve()
    })
  })
})
