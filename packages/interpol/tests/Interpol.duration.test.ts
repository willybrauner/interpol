import { it, expect, describe, afterEach } from "vitest"
import { Interpol, InterpolOptions } from "../src"
import "./_setup"
import { Value } from "../src/core/types"

describe.concurrent("Interpol duration", () => {
  afterEach(() => {
    InterpolOptions.durationFactor = 1
  })

  it("should have 1 as durationFactor by default", async () => {
    // use the default durationFactor (1)
    return new Interpol({
      duration: 200,
      onComplete: (_, time) => {
        expect(time).toBe(200)
      },
    }).play()
  })

  it("should accept custom durationFactor", async () => {
    const test = (durationFactor: number, duration: Value) => {
      // set the custom durationFactor
      InterpolOptions.durationFactor = durationFactor
      return new Interpol({
        duration,
        onComplete: (_, time) => {
          expect(time).toBe(
            (typeof duration === "function" ? duration() : duration) * durationFactor,
          )
        },
      })
    }

    return Promise.all([
      test(1, 200),
      test(1000, 100),
      test(0.5, 200),
      test(0.5, () => 200),
      test(10000, () => 300),
    ])
  })
})
