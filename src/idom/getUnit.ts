/**
 *
 * @param val
 */
export const getUnit = (val: string | number): string | undefined => {
  if (typeof val === "number") return undefined
  else {
    const split =
      /[+-]?\d*\.?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?(%|px|pt|em|rem|in|cm|mm|ex|ch|pc|vw|vh|vmin|vmax|deg|rad|turn)?$/.exec(
        val
      )
    if (split) return split[1]
    else return undefined
  }
}

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
