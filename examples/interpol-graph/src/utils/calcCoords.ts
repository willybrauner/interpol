import { clamp } from "./clamp"
import { randomRange } from "./randomRange"

export type Coords = Array<Record<string, [number, number]>>

/**
 * Calc Coordinates array
 * @param pointsNumber
 */
export const calcCoords = (pointsNumber = 12): Coords => {
  const ballSize: number = parseInt(getComputedStyle(document.body).getPropertyValue("--ball-size"))
  const win = { w: innerWidth, h: innerHeight }
  const coords: Coords = []
  const ballRectP = ballSize / pointsNumber

  for (let i = 0; i < pointsNumber; i++) {
    const odd = i % 2 === 0
    const last = coords?.[coords.length - 1]
    if (!last) {
      coords.push({
        x: [0, win.w / pointsNumber - ballRectP],
        y: [0, clamp(-win.h, -randomRange(0, win.h), 0)],
      })
    } else {
      const x = last.x[1]
      const y = last.y[1]
      coords.push({
        x: [x, x + win.w / pointsNumber - ballRectP],
        y: [
          y,
          odd ? clamp(-win.h, randomRange(0, -win.h), 0) : clamp(-win.h, -randomRange(0, win.h), 0),
        ],
      })
    }
  }
  return coords
}
