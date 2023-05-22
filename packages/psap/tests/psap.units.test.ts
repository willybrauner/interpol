import { describe, expect, it } from "vitest"
import { JSDOM } from "jsdom"
import { randomRange } from "./utils/randomRange"
import { CSSPropertiesCamelCase } from "./utils/CSSProperties"
import { psap } from "../src"
import { getDocument } from "./utils/getDocument"

describe.concurrent("anim with different units", () => {
  it("should anim 'from' an unit to another unit", () => {
    const test = (fromUnit: string, toUnit: string, props = CSSPropertiesCamelCase) =>
      new Promise((resolve: any) => {
        const { proxy, $el } = getDocument()
        props.forEach((prop, i) => {
          const last = i === props.length - 1
          $el.style[prop] = "0px"
          const from = fromUnit ? `${randomRange(-100, 100)}${fromUnit}` : randomRange(-100, 100)
          const to = toUnit ? `${randomRange(-100, 100)}${toUnit}` : randomRange(-100, 100)
          psap.fromTo(
            $el,
            { [prop]: from },
            {
              [prop]: to,
              ...proxy,
              onComplete: () => {
                // if toUnit is undefined, the value returned is in px
                const hasNotToUnit = toUnit === undefined
                expect($el.style[prop]).toBe(hasNotToUnit ? to + "px" : to)
                // console.log({ prop, from, to })
                last && resolve()
              },
            }
          )
        })
      })

    return Promise.all([
      test("px", "rem"),
      test(undefined, "rem"),
      test(undefined, "px"),
      test("px", undefined),
      test(undefined, undefined),
      test("em", "px"),
      test("px", "em"),
      test("vh", "vw"),
      test("vw", "px"),
      test("%", undefined),
      // doest not work with all props
      test("%", "%", ["top", "right", "bottom", "left", "width", "height"]),
      test(undefined, "%", ["top", "right", "bottom", "left", "width", "height"]),
    ])
  })

  it("should anim from number to number (no unit) and return a px value", () =>
    new Promise((resolve: any) => {
      const { proxy, $el } = getDocument()
      CSSPropertiesCamelCase.forEach((prop, i) => {
        const last = i === CSSPropertiesCamelCase.length - 1
        $el.style[prop] = "0px"
        const from = randomRange(-100, 100)
        const to = randomRange(-100, 100)
        psap.fromTo(
          $el,
          { [prop]: from },
          {
            [prop]: to,
            ...proxy,
            onComplete: () => {
              expect($el.style[prop]).toBe(to + "px")
              last && resolve()
            },
          }
        )
      })
    }))

  it("should anim an 'transform' properties unit from another unit", () =>
    new Promise((resolve: any) => {
      const { proxy, $el } = getDocument()
      $el.style.transform = "translateX(0px) translateY(0px) translateZ(0px)"
      psap.fromTo(
        $el,
        {
          x: -1,
          y: "-2rem",
          z: -3,
        },
        {
          x: 1,
          y: "2rem",
          z: "3px",
          ...proxy,
          onComplete: () => {
            expect($el.style.transform).toBe(`translateX(1px) translateY(2rem) translateZ(3px)`)
            resolve()
          },
        }
      )
    }))
})
