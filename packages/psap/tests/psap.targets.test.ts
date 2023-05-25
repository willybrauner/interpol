import { describe, vi, expect, it } from "vitest"
import { psap } from "../src"
import { getDocument } from "./utils/getDocument"

describe.concurrent("multiple targets", () => {
  it("should anim multiple targets on psap.set", () =>
    new Promise(async (resolve: any) => {
      const { proxy, $el, $el2 } = getDocument()
      const onCompleteMock = vi.fn()
      const animTo = psap.set([$el, $el2], {
        left: 10,
        ...proxy,
        onComplete: () => {
          onCompleteMock()
          expect($el.style.left).toBe("10px")
          expect($el2.style.left).toBe("10px")
        },
      })
      await animTo.play()
      expect(onCompleteMock).toHaveBeenCalledTimes(1)
      resolve()
    }))

  it("should anim multiple targets on psap.to", () =>
    new Promise(async (resolve: any) => {
      const { dom, doc, proxy, $el, $el2 } = getDocument()
      const beforeStartMock = vi.fn()
      const onCompleteMock = vi.fn()
      const animTo = psap.to([$el, $el2], {
        left: 10,
        duration: 0.2,
        paused: true,
        ...proxy,
        beforeStart: () => {
          beforeStartMock()
        },
        onComplete: () => {
          onCompleteMock()
          expect($el.style.left).toBe("10px")
          expect($el2.style.left).toBe("10px")
        },
      })
      await animTo.play()
      expect(beforeStartMock).toHaveBeenCalledTimes(1)
      expect(onCompleteMock).toHaveBeenCalledTimes(1)
      resolve()
    }))

  it("should anim multiple targets on psap.from", () =>
    new Promise(async (resolve: any) => {
      const { dom, doc, proxy, $el, $el2 } = getDocument()
      const beforeStartMock = vi.fn()
      const onCompleteMock = vi.fn()
      const animTo = psap.from([$el, $el2], {
        left: 10,
        duration: 0.2,
        paused: true,
        ...proxy,
        beforeStart: () => {
          beforeStartMock()
        },
        onComplete: () => {
          onCompleteMock()
          expect($el.style.left).toBe("0px")
          expect($el2.style.left).toBe("0px")
        },
      })
      await animTo.play()
      expect(beforeStartMock).toHaveBeenCalledTimes(1)
      expect(onCompleteMock).toHaveBeenCalledTimes(1)
      resolve()
    }))

  it("should anim multiple targets on psap.fromTo", () =>
    new Promise(async (resolve: any) => {
      const { dom, doc, proxy, $el, $el2 } = getDocument()
      const beforeStartMock = vi.fn()
      const onCompleteMock = vi.fn()
      const animTo = psap.fromTo(
        [$el, $el2],
        {
          left: 10,
          x: 10,
        },
        {
          left: 0,
          x: -10,
          duration: 0.2,
          paused: true,
          ...proxy,
          beforeStart: () => {
            beforeStartMock()
          },
          onComplete: () => {
            onCompleteMock()
            const expected = ($el) => {
              expect($el.style.left).toBe("0px")
              expect($el.style.transform).toBe("translateX(-10px)")
            }
            expected($el)
            expected($el2)
          },
        }
      )
      await animTo.play()
      expect(beforeStartMock).toHaveBeenCalledTimes(1)
      expect(onCompleteMock).toHaveBeenCalledTimes(1)
      resolve()
    }))

  /**
   * Stress test
   */
  it("should anim lot of targets - stress test", () =>
    new Promise(async (resolve: any) => {
      const { proxy, $el } = getDocument()
      const targets = []
      for (let i = 0; i < 30; i++) {
        targets.push($el.cloneNode(true))
      }

      const beforeStartMock = vi.fn()
      const onCompleteMock = vi.fn()
      const animTo = psap.to(targets, {
        left: 10,
        duration: 1,
        paused: true,
        ...proxy,
        beforeStart: () => {
          beforeStartMock()
        },
        onComplete: () => {
          onCompleteMock()
          targets.forEach((e) => {
            expect(parseFloat(e.style.left)).toBeCloseTo(10, 5)
          })
        },
      })
      await animTo.play()
      expect(onCompleteMock).toHaveBeenCalledTimes(1)
      resolve()
    }))
})
