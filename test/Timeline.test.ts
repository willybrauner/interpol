import { it, expect, vi } from "vitest"
import { Timeline, Interpol, Ease } from "../src"

it("should works", () => {
  return new Promise(async (resolve: any) => {
    const go = new Interpol({
      from: 0,
      to: 100,
      duration: 100,
      paused: true,
      onUpdate: ({ value, time, advancement }) => {
        console.log("go >", { value, time, advancement })
      },

      // onComplete: ({ value, time, advancement }) => {
      //   console.log("go >", { value, time, advancement })
      // },
    })

    const back = new Interpol({
      from: 100,
      to: 0,
      duration: 100,
      paused: true,
      onUpdate: ({ value, time, advancement }) => {
        console.log("back >", { value, time, advancement })
      },
      // onComplete: ({ value, time, advancement }) => {
      //   console.log("back >", { value, time, advancement })
      // },
    })

    // const tl = new Timeline()
    // tl.add(go, 0)
    // tl.add(back, -10)

    // await tl.play()

     resolve()
  })
})
