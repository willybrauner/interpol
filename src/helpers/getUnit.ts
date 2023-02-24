/**
 *
 * @param val
 */
export const getUnit = (val: string | number): string => {
  if (typeof val === "number") return null
  else {
    const split =
      /[+-]?\d*\.?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?(%|px|pt|em|rem|in|cm|mm|ex|ch|pc|vw|vh|vmin|vmax|deg|rad|turn)?$/.exec(
        val
      )
    if (split) return split[1]
    else return null
  }
}
