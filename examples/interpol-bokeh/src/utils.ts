export function random(min: number, max: number, decimal = 0): number {
  let rand
  do rand = Math.random() * (max - min + 1) + min
  while (rand === 0)
  const power = Math.pow(10, decimal)
  return Math.floor(rand * power) / power
}

export const randomRGB = () => {
  return `rgb(${random(20, 200)}, ${random(20, 200)}, ${random(20, 200)})`
}

const _getEases = () =>
  ["power1", "power2", "power3", "expo"].reduce(
    (a, b) => [...a, ...["in", "out", "inOut"].map((d) => `${b}.${d}`)],
    [],
  )
const _eases = _getEases()

export const randomEase = () => _eases[random(0, _eases.length - 1)]
