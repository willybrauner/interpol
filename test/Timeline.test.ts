import { it, expect, vi, describe } from "vitest"
import { Timeline, Interpol, Ease } from "../src"

// const createInterpol = ({ duration = 1000, updateMock, completeMock }) => {
//   return new Interpol({
//     from: 0,
//     to: 100,
//     duration,
//     onUpdate: () => updateMock(),
//     onComplete: () => completeMock(),
//   })
// }

describe("Timeline", () => {
  it("Timeline should add Interpol's and play properly", () => {
    const goUpdateMock = vi.fn()
    const goCompleteMock = vi.fn()
    const backUpdateMock = vi.fn()
    const backCompleteMock = vi.fn()
    const tlCompleteMock = vi.fn()
    const tl = new Timeline({ onComplete: tlCompleteMock })
    tl.add(
      new Interpol({
        to: 100,
        onUpdate: goUpdateMock,
        onComplete: goCompleteMock,
      })
    )
    tl.add(
      new Interpol({
        to: 100,
        onUpdate: backUpdateMock,
        onComplete: backCompleteMock,
      })
    )
    return new Promise(async (resolve: any) => {
      await tl.play()
      expect(tlCompleteMock).toBeCalledTimes(1)
      expect(goUpdateMock).toBeCalled()
      expect(goCompleteMock).toBeCalledTimes(1)
      expect(backUpdateMock).toBeCalled()
      expect(backCompleteMock).toBeCalledTimes(1)
      resolve()
    })
  })

  it("Timeline should play properly", () => {})

})
