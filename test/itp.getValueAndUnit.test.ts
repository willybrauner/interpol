import { beforeEach, expect, it } from "vitest"
import { geValueAndUnit } from "../src/itp"
import { JSDOM } from "jsdom"
import { UNITS } from "../src/helpers/getUnit"
import { randomRange } from "./utils/randomRange"

let dom
let $el: HTMLElement

beforeEach(() => {
  const opt = { contentType: "text/html" }
  dom = new JSDOM("<html><head></head><body></body></html>", opt)
  $el = dom.window.document.createElement("div")
  dom.window.document.body.append($el)
})

it("should return value and unit if brutValue is passed as param", () => {
  // left should be set to be able to get from getComputedStyle : "5px"
  // jsdom return nothing if is not set
  // Set a value "5px" allows to get the unit "px" even if a brute value is set
  $el.style.left = "5px"
  expect(geValueAndUnit($el, "left", 100, dom.window)).toEqual([100, "px"])
  $el.style.opacity = "0.5"
  expect(geValueAndUnit($el, "opacity", 1, dom.window)).toEqual([1, undefined])
  // if no property value and unit is set on top, use the brutValue
  expect(geValueAndUnit($el, "top", 10, dom.window)).toEqual([10, undefined])
})

it("should return value and unit from computedValue, if brutValue is NOT passed as param", () => {
  $el.style.left = "5%"
  expect(geValueAndUnit($el, "left", null, dom.window)).toEqual([5, "%"])
  $el.style.opacity = "0.2"
  expect(geValueAndUnit($el, "opacity", null, dom.window)).toEqual([0.2, undefined])
})

it("should return value & unit with all available units", () => {
  // test all available units
  for (let unit of UNITS) {
    const value = randomRange(-1000, 1000)
    expect(geValueAndUnit($el, "top", `${value}${unit}`, dom.window)).toEqual([value, unit])
  }
})
