import { it, expect, vi, describe } from "vitest"
import { Timeline } from "../src"

describe.concurrent("Timeline callback", () => {
   it("Timeline should execute interpol's onComplete once", () => {
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
