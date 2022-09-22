import { it, expect, vi, describe } from "vitest"
import { Timeline, Interpol, Ease } from "../src"

describe.concurrent("Timeline", () => {
  it("Timeline should add Interpol's and play properly", () => {
    const tlCompleteMock = vi.fn()
    const tl = new Timeline({ onComplete: tlCompleteMock })
    tl.add(new Interpol({ to: 100 }))
    tl.add(new Interpol({ to: 100 }))
    return new Promise(async (resolve: any) => {
      await tl.play()
      expect(tlCompleteMock).toBeCalledTimes(1)
      resolve()
    })
  })
})
