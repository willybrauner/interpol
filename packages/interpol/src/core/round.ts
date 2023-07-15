export const round = (v: number, decimal = 1000): number =>
  Math.round(v * decimal) / decimal
