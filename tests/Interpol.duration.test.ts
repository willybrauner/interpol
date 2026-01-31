import { it, expect, describe, afterEach } from "vitest"
import { interpol, InterpolOptions } from "../src"
import "./_setup"
import { Value } from "../src/core/types"

describe.concurrent("interpol duration", () => {
  afterEach(() => {
    InterpolOptions.durationFactor = 1
  })

  it("should have 1 as durationFactor by default", async () => {
    // use the default durationFactor (1)
    return interpol({
      duration: 200,
      onComplete: (_, time) => {
        expect(time).toBe(200)
      },
    }).play()
  })

  it("should use duration in second for global interpol instances", async () => {
    // use the default durationFactor (1)
    InterpolOptions.durationFactor = 1000
    InterpolOptions.duration = 0.2
    return interpol({
      onComplete: (_, time) => {
        expect(time).toBe(200)
      },
    }).play()
  })

  it("should accept custom durationFactor", async () => {
    const test = (durationFactor: number, duration: Value) => {
      // set the custom durationFactor
      InterpolOptions.durationFactor = durationFactor
      return interpol({
        duration,
        onComplete: (_, time) => {
          expect(time).toBe(
            (typeof duration === "function" ? duration() : duration) * durationFactor,
          )
        },
      }).play()
    }

    // prettier-ignore
    return Promise.all([
      test(0.5, 400),
      test(1, 200),
      test(1000, 0.2),    
    ])
  })
})
