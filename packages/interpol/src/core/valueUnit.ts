// Cache regex pattern
const UNIT_REGEX = /[+-]?\d*\.?\d+|\D+/g

export function valueUnit(value: number | string): [number, string | null] {
  if (value === undefined) return [0, null]
  if (typeof value !== "string") return [Number(value) ?? 0, null]
  const matches = value.match(UNIT_REGEX)
  return matches ? [+matches[0], matches[1] || null] : [0, null]
}
