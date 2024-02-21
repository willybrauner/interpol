import { describe, expect, it } from "vitest"
import { InterpolOptions, Ticker } from "../src"

describe.concurrent("options", () => {
  it("options should expose Ticker instance", () => {
    expect(InterpolOptions.ticker).toBeInstanceOf(Ticker)
  })
})
