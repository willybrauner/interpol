import { it, expect, describe, vi } from "vitest"
import { Interpol } from "../src"
import { wait } from "./utils/wait"

describe.concurrent.only("Interpol repeat", () => {
  it("should repeat a the interpolation X time", async () => {
    const mock = vi.fn()
    return new Promise(async (resolve: any) => {
      const itp = new Interpol({
        to: 10,
        duration: 1000,
        repeat: 3,
        onComplete: mock,
        onUpdate:(e)=>
        {
//        console.log(e)
        }

      })

      await wait(itp.duration * 3 + 100)
      expect(mock).toHaveBeenCalledTimes(3)
      resolve()
    })
  })
})
