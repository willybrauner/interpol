import { it, expect, vi, describe } from "vitest"
import { Timeline, Interpol } from "../src"

describe.concurrent("Timeline offset", () => {
  it("Timeline should return minimum the first add duration", () => {
    return new Promise(async (resolve: any) => {
      const tl = new Timeline({
        paused: true,
        onComplete: (time) => {
          expect(time).toBe(50)
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
      await tl.play()
      resolve()
    })
  })

  it("Timeline should return minimum the first add duration 2", () => {
    return new Promise(async (resolve: any) => {
      const tl = new Timeline({
        paused: true,
        onComplete: (time) => {
          expect(time).toBe(50)
        },
      })
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
      tl.add(
        {
          duration: 100,
          props: { v: [0, 100] },
        },
        -120
      )

      await tl.play()
      resolve()
    })
  })
})
