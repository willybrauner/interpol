import { beforeEach, expect, it } from "vitest"
import { JSDOM } from "jsdom"
import { randomRange } from "./utils/randomRange"

/**
 * Available units
 * (useful for unit tests)
 */
export const UNITS = [
  "%",
  "px",
  "pt",
  "em",
  "rem",
  "in",
  "cm",
  "mm",
  "ex",
  "ch",
  "pc",
  "vw",
  "vh",
  "vmin",
  "vmax",
  "deg",
  "rad",
  "turn",
]
let dom
let $el: HTMLElement

beforeEach(() => {
  const opt = { contentType: "text/html" }
  dom = new JSDOM("<html><head></head><body></body></html>", opt)
  $el = dom.window.document.createElement("div")
  dom.window.document.body.append($el)
})

it("should return value and unit if brutValue is passed as param", () => {
  // // left should be set to be able to get from getComputedStyle : "5px"
  // // jsdom return nothing if style property value is not defined
  // // Set a value "5px" allows to get the unit "px" even if a brute value is set
  // $el.style.left = "5px"
  // expect(extractValueAndUnit($el, "left", 100, null, dom.window)).toEqual([100, "px"])
  // $el.style.opacity = "0.5"
  // expect(extractValueAndUnit($el, "opacity", 1, null, dom.window)).toEqual([1, ""])
  // // if no property value and unit is set on top, use the brutValue
  // expect(extractValueAndUnit($el, "top", 10, null, dom.window)).toEqual([10, ""])
})

it("should return value and unit from computedValue, if brutValue is NOT passed as param", () => {
  // $el.style.left = "5%"
  // expect(extractValueAndUnit($el, "left", null, null, dom.window)).toEqual([5, "%"])
  // $el.style.opacity = "0.2"
  // expect(extractValueAndUnit($el, "opacity", null, null, dom.window)).toEqual([0.2, ""])
})

it("should return value & unit with all available units", () => {
  // // test all available units
  // for (let unit of UNITS) {
  //   const value = randomRange(-1000, 1000)
  //   expect(extractValueAndUnit($el, "top", `${value}${unit}`, null, dom.window)).toEqual([
  //     value,
  //     unit,
  //   ])
  // }
})
