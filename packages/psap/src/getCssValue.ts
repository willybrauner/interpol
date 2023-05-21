import { PropOptions } from "./psap"
import { convertMatrix } from "./convertMatrix"
import { isMatrix } from "./isMatrix"
import debug from "@wbe/debug"
// const log = debug(`psap:getCssValue`)

/**
 * Get css value from target
 */
export const getCssValue = (
  target: HTMLElement,
  prop: PropOptions,
  proxyWindow = window
): string => {
  let cptValue =
    target?.style?.[prop.usedKey] ||
    proxyWindow.getComputedStyle(target).getPropertyValue(prop.usedKey)

  // if value is NaN or empty, set it to "0px"
  if (Number.isNaN(cptValue) || cptValue === "") cptValue = "0px"

  // in case of transform, the computed value can be "none", we need to set it to "0"
  if (cptValue === "none") cptValue = "0"

  // get trans fn call from matrix of transform property, ex: translateX(10px)
  // parse trans (translateX(10px)) and return "10px"
  if (prop._isTransform) {
    const trans = isMatrix(cptValue) ? convertMatrix(cptValue)?.[prop.transformFn] : "0"
    const transExtract = trans.match(/(\d+(?:\.\d+)?)(\w+)?/)?.[0]
    // log({ transExtract })
    return transExtract
  }

  // if not transform, return value
  return cptValue
}
