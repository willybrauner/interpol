import debug from "@wbe/debug"
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
      const degUnitFn = ["rotate", "rotateX", "rotateY", "rotateZ", "skew", "skewX", "skewY"]
      const radUnitFn = ["perspective"]
      const pxUnitFn = ["translateX", "translateY", "translateZ"]
      // const noUnitFn = ["scale", "scaleX", "scaleY", "scaleZ"]

      if (degUnitFn.includes(prop.transformFn)) return "deg"
      else if (radUnitFn.includes(prop.transformFn)) return "rad"
      else if (pxUnitFn.includes(prop.transformFn)) return "px"
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
