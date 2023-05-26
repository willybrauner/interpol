import debug from "@wbe/debug"
import { DEG_UNIT_FN, PX_UNIT_FN, RAD_UNIT_FN } from "./psap"
const log = debug(`psap:getUnit`)
/**
 * Get unit from string value
 *
 * ex:
 *  "200px"
 *  return "px"
 *
 */
export const getUnit = (value: string | number, prop): string => {
  const unitFromString =
    /[+-]?\d*\.?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?(%|px|pt|em|rem|in|cm|mm|ex|ch|pc|vw|vh|vmin|vmax|deg|rad|turn)?$/.exec(
      value as string
    )?.[1]

  // if is a number
  // or no unit from string ex: "0" | "10"...
  if (typeof value === "number" || !unitFromString) {
    // if is a transform property, return the unit from the transform function
    if (prop._isTransform) {
      if (DEG_UNIT_FN.includes(prop.transformFn)) return "deg"
      else if (RAD_UNIT_FN.includes(prop.transformFn)) return "rad"
      else if (PX_UNIT_FN.includes(prop.transformFn)) return "px"
      else return ""
    }
    // if is not a transform property, return no unit
    else return ""
  } else if (!unitFromString) {
    return ""
  } else {
    return unitFromString
  }
}
