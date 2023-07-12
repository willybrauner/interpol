import { describe, expect, it } from "vitest"
import { psap } from "../src"
import { randomRange } from "./utils/randomRange"
import { CSSPropertiesCamelCase } from "./utils/CSSProperties"
import { getDocument } from "./utils/getDocument"

describe.concurrent(
  "should anim properly 'to' common CSS Properties (one psap per property)",
  () => {
    it("should anim properly 'to'", () =>
      new Promise((resolve: any) => {
        const { doc, proxy, $el } = getDocument()
        CSSPropertiesCamelCase.forEach((prop, i) => {
          $el.style[prop] = "0px"
          const last = i === CSSPropertiesCamelCase.length - 1
          const to = `${randomRange(-100, 100)}px`
          psap.to($el, {
            [prop]: to,
            ...proxy,
            onComplete: () => {
              expect($el.style[prop]).toBe(to)
              if (last) resolve()
            },
          })
        })
      }))

    // 2de test, use each property on same animation
    // on large number of properties, onComplete is called before all animations are done
    // and I don't know why
    // so we need to wait a bit...
    it("should anim properly 'to' animating all properties on the same psap", () =>
      new Promise((resolve: any) => {
        const { doc, proxy, $el } = getDocument()
        doc.body.append($el)
        const to = `${randomRange(-100, 100)}px`
        const props = CSSPropertiesCamelCase.reduce((acc, prop) => {
          acc[prop] = to
          return acc
        }, {})

        psap.to($el, {
          ...props,
          ...proxy,
          onComplete: async () => {
            CSSPropertiesCamelCase.forEach((prop) => expect($el.style[prop]).toBe(to))
            resolve()
          },
        })
      }))

    // 1. create an animation for each property
    it("should anim properly 'fromTo'", () =>
      new Promise((resolve: any) => {
        const { doc, proxy, $el } = getDocument()
        CSSPropertiesCamelCase.forEach((prop, i) => {
          const last = i === CSSPropertiesCamelCase.length - 1
          const from = `${randomRange(-100, 100)}px`
          const to = `${randomRange(-100, 100)}px`

          psap.fromTo(
            $el,
            { [prop]: from },
            {
              [prop]: to,
              ...proxy,
              onComplete: () => {
                expect($el.style[prop]).toBe(to)
                if (last) resolve()
              },
            }
          )
        })
      }))

    // 2de test, use each property on same animation
    // on large number of properties, onComplete is called before all animations are done
    // and I don't know why
    // so we need to wait a bit...
    it("should anim properly 'fromTo' all properties on the same psap", () =>
      new Promise((resolve: any) => {
        const { doc, proxy, $el } = getDocument()
        doc.body.append($el)
        const from = `${randomRange(-100, 100)}px`
        const to = `${randomRange(-100, 100)}px`
        const propsFrom = CSSPropertiesCamelCase.reduce((acc, prop) => {
          acc[prop] = from
          return acc
        }, {})
        const propsTo = CSSPropertiesCamelCase.reduce((acc, prop) => {
          acc[prop] = to
          return acc
        }, {})
        psap.fromTo($el, propsFrom, {
          ...propsTo,
          ...proxy,
          onComplete: () => {
            CSSPropertiesCamelCase.forEach((prop) => {
              expect($el.style[prop]).toBe(to)
            })
            resolve()
          },
        })
      }))

    it("should anim properly 'from'", () =>
      new Promise((resolve: any) => {
        const { proxy, $el } = getDocument()
        psap.from($el, {
          left: `${randomRange(-100, 100)}px`,
          width: `${randomRange(-100, 100)}px`,
          x: 10,
          y: "10rem",
          ...proxy,
          onComplete: () => {
            expect($el.style.left).toBe("0px")
            expect($el.style.width).toBe("0px")
            expect($el.style.transform).toBe("translateX(0px) translateZ(0px) translateY(0px)")
            resolve()
          },
        })
      }))

    it("should not anim 'set' method", () =>
      new Promise((resolve: any) => {
        const { proxy, $el } = getDocument()
        psap.set($el, {
          left: `10px`,
          width: `10rem`,
          x: 10,
          y: "10rem",
          ...proxy,
          onComplete: () => {
            expect($el.style.left).toBe("10px")
            expect($el.style.width).toBe("10rem")
            expect($el.style.transform).toBe("translateX(10px) translateY(10rem) translateZ(0px)")
            resolve()
          },
        })
      }))
  }
)
