export function randomRange(min: number, max: number, decimal = 0): number {
  let rand

  // except the value 0
  do rand = Math.random() * (max - min + 1) + min
  while (rand === 0)

  const power = Math.pow(10, decimal)
  return Math.floor(rand * power) / power
}

