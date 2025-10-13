import { describe, expect, it } from "vitest"
import { engine, Ticker } from "../src"

describe.concurrent("options", () => {
  it("options should expose Ticker instance", () => {
    expect(engine.ticker).toBeInstanceOf(Ticker)
  })
})
