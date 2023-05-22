import { describe, vi, expect, it } from "vitest"
import { psap } from "../src"
import { getDocument } from "./utils/getDocument"

describe.concurrent("multiple targets", () => {
  it("should not anim multiples target and execute only one onComplete", () =>
    new Promise(async (resolve: any) => {
      const { doc, proxy, $el, $el2 } = getDocument()
      const elements = doc.body.querySelectorAll(".el")
      console.log("elements", elements)
      const mock = vi.fn()

      await psap.to([$el, $el2], {
        left: 10,
        duration: 0.4,
        ...proxy,
        onComplete: () => {
          mock()
          expect(mock).toHaveBeenCalledTimes(1)
          expect($el.style.left).toBe("10px")
          console.log("coucou")
          // expect($el2.style.left).toBe("10px")
          resolve()
        },
      })
    }))
})
