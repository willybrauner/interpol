/**
 * Get unit from string value
 *
 * ex:
 *  "200px"
 *  return "px"
 *
 */
export const getUnit = (value: string | number): string | undefined =>
  typeof value === "number"
    ? undefined
    : /[+-]?\d*\.?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?(%|px|pt|em|rem|in|cm|mm|ex|ch|pc|vw|vh|vmin|vmax|deg|rad|turn)?$/.exec(
        value
      )?.[1]

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
