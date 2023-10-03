import { it, expect, vi, describe } from "vitest"
import { Timeline, Interpol } from "../src"

describe.concurrent("Timeline offset", () => {
  it("Timeline should return minimum the first add duration", () => {
    return new Promise(async (resolve: any) => {
      const tl = new Timeline({
        onComplete: (time) => {
          expect(time).toBe(50)
          resolve()
        },
      })

      // Total tl duration is 50 + 100 = 150
      // The second add has offset -120, and should start at 30,
      // So we expect that the TL duration is minimum 50, the first add duration
      tl.add({
        duration: 50,
        props: { v: [0, 100] },
      })
      tl.add(
        {
          duration: 100,
          props: { v: [0, 100] },
        },
        -120
      )
    })
  })

  it("Timeline should return minimum the first add duration with more than 2 adds", () => {
    return new Promise(async (resolve: any) => {
      const data = [
        { duration: 250, offset: 20 },
        { duration: 20, offset: 20 },
        { duration: 50, offset: 0 },
        { duration: 100, offset: -20 },
        { duration: 100, offset: 0 },
        { duration: 300, offset: -100 },
        { duration: 100, offset: 100 },
        { duration: 60, offset: -30000 },
      ]

      const tl = new Timeline({
        paused: true,
        onComplete: (time: number) => {
          const totalDuration = data.reduce((acc, curr) => {
            return Math.max(acc, acc + curr.duration + curr.offset)
          }, 0)
          // final time should be the total duration
          expect(time).toBe(totalDuration)
        },
      })

      data.forEach(({ duration, offset }) => {
        tl.add({ duration, props: { v: [0, 1] } }, offset)
      })

      await tl.play()
      resolve()
    })
  })
})
