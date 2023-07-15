import { it, expect, vi, describe } from "vitest"
import { Timeline } from "../src"

describe.concurrent("Timeline play", () => {
  it("Timeline should execute interpol's onComplete once", () => {
    return new Promise(async (resolve: any) => {
      const onComplete1 = vi.fn()
      const onComplete2 = vi.fn()
      const tl = new Timeline({ paused: true })
      tl.add({ 
        to: 100,
        onComplete: onComplete1,
      })
      tl.add({ 
        to: 100,
        onComplete: onComplete2,
      })

      await tl.play()
      expect(onComplete1).toHaveBeenCalledTimes(1)
      expect(onComplete2).toHaveBeenCalledTimes(1)
      resolve()
    })
  })

  it("Timeline should execute Timeline onComplete once", () => {
    return new Promise(async (resolve: any) => {
      const onComplete = vi.fn()
      
      const tl = new Timeline({ paused: true, onComplete })
      tl.add({ 
        to: 100,
      })
      tl.add({ 
        to: 100,
      })

      await tl.play()
      expect(onComplete).toHaveBeenCalledTimes(1)
      
      await tl.reverse()
      expect(onComplete).toHaveBeenCalledTimes(2)
      resolve()
    })
   })
})
