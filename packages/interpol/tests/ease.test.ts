import { describe, expect, it } from "vitest"
import "./_setup"

import {
  easeAdapter,
  EaseName,
  Expo,
  Linear,
  Power1,
  Power2,
  Power3,
  Power4,
} from "../src/core/ease"

const eases = { Power1, Power2, Power3, Power4, Expo }
const types = ["power1", "power2", "power3", "power4", "expo"]

describe.concurrent("Ease", () => {
  // prettier-ignore
  it("adaptor should return easing function", () => {
    const directions = ["in", "out", "inOut"]
    const capitalizeFirstLetter = (s) => {
      if (typeof s !== "string" || s.length === 0) return s
      return s.charAt(0).toUpperCase() + s.slice(1)
    }

    // all other eases
    for (const type of types) {
      for (const direction of directions) {
        const adaptor = easeAdapter(`${type}.${direction}` as EaseName)
        expect(adaptor).toBe(eases[capitalizeFirstLetter(type)]?.[direction])
      }
    }

    // linear
    const adaptor = easeAdapter(`linear` as EaseName)
    expect(adaptor).toBe(Linear)
    
  })

  it("adaptor should return linear easing function if name doesnt exist", () => {
    expect(easeAdapter("power2.oit" as any)).toBe(Linear)
    expect(easeAdapter("coucou" as any)).toBe(Linear)
  })
})
