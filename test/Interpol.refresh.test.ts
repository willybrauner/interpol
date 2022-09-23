import { it, expect, describe, vi } from "vitest"
import { Interpol } from "../src"
import { randomRange } from "./utils/randomRange"

describe.concurrent("Interpol refresh", () => {
  it("should compute again 'from' 'to' and 'duration' if there are functions", async () => {
    const pms = () =>
      new Promise(async (resolve: any) => {
        // TODO
        // let to, from, duration
        // const mock = vi.fn()
        // const itp = new Interpol({
        //   from: () => randomRange(-100, 100),
        //   to: () => randomRange(-100, 100),
        //   duration: () => randomRange(-200, 200),
        // })
        // await itp.play()
        resolve()
      })
    return Promise.all([pms()])
  })
})
