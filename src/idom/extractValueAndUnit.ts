import { getUnit } from "./getUnit"
import { convertValueToUnitValue } from "./convertValueToUnitValue"
import debug from "@wbe/debug"
import { convertMatrix, getCssValue } from "./idom"
const log = debug(`interpol:extractValueAndUnit`)

/**
 *
 * Extract value and units
 *    from target
 *    or from raw value
 *
 * From given a DOM target element,
 * we want to extract value + unit from a specific CSS property key
 *
 * ex
 *  target.style.top = "20rem"
 *  fn return -> [20, "rem"]
 *
 */

// prettier-ignore
export const extractValueAndUnit = (
  target: HTMLElement,
  key: string,
  rawValue: number | string,
  rawUnit?: string,
  proxyWindow = window
): [value: number, unit: string] => {


  let computedValue = getCssValue(target, key, proxyWindow)
  if (key === "transform" && rawValue) {
   // log("r",target.style.transform)
  //   log('rawValue',rawValue)
  //   log("convertMatrix",convertMatrix(computedValue))
  //   computedValue = Object.keys(convertMatrix(computedValue)).map(e => convertMatrix(computedValue)[e]).join(' ')
  }

  let value = (
    typeof rawValue === "string"
      ? parseFloat(rawValue)
      : rawValue
    )
    ?? parseFloat(computedValue)

  const unit = getUnit(rawValue) || getUnit(computedValue)

  // if we have a rawUnit param
  // we want to convert the value to from his unit value to this rawUnit value
  // ex:
  // "-20px" with rawUnit "%"
  // "-20px" need to be convert in '%' according to the parent element
  // possible conversion "-3%" (depend on parent width)
  // The final usage will be [from, to] as ["-3%", "50%"]
  if (rawUnit) {
    value = convertValueToUnitValue(target, value, unit, rawUnit)
  }

  // log({target, key, rawValue, rawUnit, computedValue, unit, value})

  return [
    value || 0,
    rawUnit || unit || ""
  ]
}
