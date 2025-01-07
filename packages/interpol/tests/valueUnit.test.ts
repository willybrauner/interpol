import { describe, expect, it } from "vitest"
import { valueUnit } from "../src/core/valueUnit"

describe.concurrent("getUnits", () => {
  it("should return the correct unit", () => {
    expect(valueUnit(100)).toEqual([100, null])
    expect(valueUnit("100")).toEqual([100, null])
    expect(valueUnit("12020020.210rem")).toEqual([12020020.21, "rem"])
    ;[
      "px",
      "%",
      "rem",
      "em",
      "vw",
      "vh",
      "vmin",
      "vmax",
      "cm",
      "mm",
      "in",
      "pt",
      "pc",
      "whatever",
    ].forEach((unit) => {
      expect(valueUnit(`30${unit}`)).toEqual([30, unit])
    })

    // Null value
    expect(valueUnit(null)).toEqual([0, null])
    expect(valueUnit(undefined)).toEqual([0, null])

    // Empty string
    expect(valueUnit("")).toEqual([0, null])
  })
})
