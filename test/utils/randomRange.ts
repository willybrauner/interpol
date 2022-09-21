export function randomRange(min: number, max: number, decimal = 0): number {
  const rand = Math.random() * (max - min) + min
  const power = Math.pow(10, decimal)
  return Math.floor(rand * power) / power
}