import { describe, vi, expect, it } from "vitest"
import { psap } from "../src"
import { getDocument } from "./utils/getDocument"

describe.concurrent("computed values", () => {
  it("should anim computed values on 'to', 'from' 'set'", () => {
    const test = (type: "to" | "set" | "from", result = "20rem") =>
      new Promise(async (resolve: any) => {
        const { proxy, $el } = getDocument()
        psap[type]($el, {
          top: () => 10 * 2 + "rem",
          ...proxy,
          onComplete: () => {
            expect($el.style.top).toBe(result)
            resolve()
          },
        })
      })
    return Promise.all([test("to"), test("set"), test("from", "0px")])
  })

  it("should anim computed values on 'fromTo", () => {
    const test = (type: "fromTo") =>
      new Promise(async (resolve: any) => {
        const { proxy, $el } = getDocument()
        psap[type](
          $el,
          {
            top: () => -20 * 30,
          },
          {
            top: () => 100 * 2,
            ...proxy,
            onComplete: () => {
              expect($el.style.top).toBe("200px")
              resolve()
            },
          }
        )
      })
    return Promise.all([test("fromTo")])
  })

  it("should refresh computed values when refresh() is called", () =>
    new Promise(async (resolve: any) => {
      const { proxy, $el } = getDocument()
      const [first, second] = [10, 100]
      let isFirst = true
      const anim = psap.to($el, {
        top: () => (isFirst ? first : second),
        ...proxy,
      })
      await anim.play()
      expect($el.style.top).toBe(`${first}px`)
      isFirst = false
      anim.refresh()
      await anim.play()
      expect($el.style.top).toBe(`${second}px`)
      resolve()
    }))
})
