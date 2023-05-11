import { PropOptions } from "./psap"
import { convertMatrix } from "./convertMatrix"
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
  let cptValue =
    target.style[prop.usedKey] ||
    proxyWindow.getComputedStyle(target).getPropertyValue(prop.usedKey)
  if (cptValue === "none") cptValue = "0px"
  // get trans fn call from matrix of transform property, ex: translateX(10px)
  // parse trans (translateX(10px)) and return "10px"
  if (prop._isTransform) {
    const trans = /^matrix(3d)?\([^)]*\)$/.test(cptValue)
      ? convertMatrix(cptValue)?.[prop.transformFn]
      : cptValue

    const transExtract = trans.match(/(\d+(?:\.\d+)?)(\w+)?/)?.[0]
    // log({ transExtract })
    return transExtract
  }

  // if not transform, return value
  return cptValue
}
