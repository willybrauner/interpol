import { PropOptions } from "./psap"
import { convertMatrix } from "./convertMatrix"
import { isMatrix } from "./isMatrix"
import debug from "@wbe/debug"
 const log = debug(`psap:getCssValue`)

/**
 * Get css value from target
 */
export const getCssValue = (
  target: HTMLElement,
  prop: PropOptions,
  proxyWindow = window
): string => {

  log('target?.style?.[prop.usedKey]',target?.style?.[prop.usedKey])

  let cptValue =
    target?.style?.[prop.usedKey] ??
    proxyWindow.getComputedStyle(target).getPropertyValue(prop.usedKey)

  // if value is NaN or empty, set it to "0px"
  if (Number.isNaN(cptValue) || cptValue === "") cptValue = "0px"

  // in case of transform, the computed value can be "none", we need to set it to "0"
  if (cptValue === "none") {
    cptValue = "0"
  }

  // get trans fn call from matrix of transform property, ex: translateX(10px)
  // parse trans (translateX(10px)) and return "10px"
  if (prop._isTransform) {
    // if transform is a matrix, we need to convert default value to an object
    // and get the value from the transform function
    let defaultValue
    log('cptValue',cptValue)
    if (isMatrix(cptValue)) {
      defaultValue = convertMatrix(cptValue)?.[prop.transformFn]
      // else if transform is a scale, default value is 1
      // else default value is 0
    } else {
      defaultValue = prop.transformFn.includes("scale") ? "1" : "0"
    }

    const transExtract = defaultValue.match(/(\d+(?:\.\d+)?)(\w+)?/)?.[0]
    log({defaultValue, transExtract })
    return transExtract
  }

  // if not transform, return value
  return cptValue
}
