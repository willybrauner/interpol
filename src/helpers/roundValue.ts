export const roundedValue = (v: number, unit = 1000): number =>
  Math.round(v * unit) / unit
