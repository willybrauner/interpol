/**
 * Get unit from string value
 *
 * ex:
 *  "200px"
 *  return "px"
 *
 */
export const getUnit = (value: string | number): string => {
  const unit =
    /[+-]?\d*\.?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?(%|px|pt|em|rem|in|cm|mm|ex|ch|pc|vw|vh|vmin|vmax|deg|rad|turn)?$/.exec(
      value as string
    )?.[1]
  return typeof value === "number" || !unit ? "" : unit
}
