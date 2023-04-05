import { getUnit } from "./getUnit"
import { convertValueToUnit } from "./convertValueToUnit"
import debug from "@wbe/debug"
import { getCptValue } from "./idom"
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

  const computedValue = getCptValue(target, key, proxyWindow)

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
    value = convertValueToUnit(target, value, unit, rawUnit)
  }

  log({target, key, rawValue, rawUnit, computedValue, unit, value})

  return [
    value || 0,
    rawUnit || unit || ""
  ]
}
