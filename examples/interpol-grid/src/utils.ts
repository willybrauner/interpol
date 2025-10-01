export function random(min: number, max: number, decimal = 0): number {
  let rand
  do rand = Math.random() * (max - min + 1) + min
  while (rand === 0)
  const power = Math.pow(10, decimal)
  return Math.floor(rand * power) / power
}

export const randomRGB = () => {
  //return `rgb(${random(50, 200)}, ${random(50, 200)}, ${random(50, 200)})`
  return `rgb(${random(150, 255)}, ${random(0, 80)}, ${random(0, 80)})`
}
