import { describe, expect, it } from "vitest"
import { psap } from "../src"
import { randomRange } from "./utils/randomRange"
import { DEG_UNIT_FN, NO_UNIT_FN, PX_UNIT_FN, RAD_UNIT_FN } from "../src/core/psap"
import { getDocument } from "./utils/getDocument"

describe.concurrent("anim specific CSS Properties", () => {
  it("should anim properly 'to' on opacity", () =>
    new Promise((resolve: any) => {
      const { proxy, $el } = getDocument()
      $el.style.opacity = "0"
      const to = 0.2
      psap.to($el, {
        opacity: to,
        ...proxy,
        onComplete: () => {
          expect($el.style.opacity).toBe(`${to}`)
          resolve()
        },
      })
    }))

  it("should anim properly 'to' on opacity and a transform prop", () =>
    new Promise((resolve: any) => {
      const { proxy, $el } = getDocument()
      $el.style.opacity = "0"
      $el.style.transform = "translateX(0px)"
      const to = 0.2
      psap.to($el, {
        opacity: to,
        translateX: 100,
        ...proxy,
        onComplete: () => {
          expect($el.style.opacity).toBe(`${to}`)
          resolve()
        },
      })
    }))

  it("should anim properly 'to' on regular transform properties", () => {
    const test = (props, unit) =>
      new Promise((resolve: any) => {
        props.forEach((prop, i) => {
          const isLast = i === props.length - 1
          const { proxy, $el } = getDocument()
          $el.style.transform = `${prop}(0${unit})`
          const to = randomRange(-100, 100)
          psap.to($el, {
            [prop]: to,
            ...proxy,
            onComplete: () => {
              const result = `${prop}(${to}${unit})`
              if (prop === "translateZ") {
                expect($el.style.transform).toBe(result)
              } else {
                expect($el.style.transform).toBe(`${result} translateZ(0px)`)
              }
              isLast && resolve()
            },
          })
        })
      })
    return Promise.all([
      test(DEG_UNIT_FN, "deg"),
      test(PX_UNIT_FN, "px"),
      test(RAD_UNIT_FN, "rad"),
      test(NO_UNIT_FN, ""),
    ])
  })

  it("should anim properly 'to' on adapter transform properties x, y, z", () =>
    new Promise((resolve: any) => {
      const props = ["translateX", "translateY", "translateZ"]
      // transform PROPS to adapter PROPS
      const getAdapter = (prop: string) => prop[prop.length - 1].toLowerCase()

      props.forEach((prop, i) => {
        const isLast = i === props.length - 1
        const { proxy, $el } = getDocument()
        $el.style.transform = `${prop}(0px)`
        const to = randomRange(-100, 100)
        psap.to($el, {
          [getAdapter(prop)]: to,
          ...proxy,
          onComplete: () => {
            if (prop === "translateZ") {
              expect($el.style.transform).toBe(`${prop}(${to}px)`)
            } else {
              expect($el.style.transform).toBe(`${prop}(${to}px) translateZ(0px)`)
            }
            isLast && resolve()
          },
        })
      })
    }))

  it("should anim properly 'to' on regular transform properties with multiple transforms", () => {
    const { proxy, $el } = getDocument()
    $el.style.transform = `translateX(0px) translateY(0px) translateZ(0px)`
    const to = randomRange(-100, 100)
    return new Promise((resolve: any) => {
      psap.to($el, {
        translateX: to,
        translateY: to,
        translateZ: to,
        ...proxy,
        onComplete: () => {
          expect($el.style.transform).toBe(
            `translateX(${to}px) translateY(${to}px) translateZ(${to}px)`
          )
          resolve()
        },
      })
    })
  })

  it("should anim different transform fn together and respect different units", () => {
    return new Promise((resolve: any) => {
      const { proxy, $el } = getDocument()
      $el.style.transform = "translateX(0px) scale(1.1)"
      $el.style.left = "0rem"
      psap.to($el, {
        x: 10,
        scale: 10,
        left: "10rem",
        duration: 0,
        ...proxy,
        onComplete: () => {
          expect($el.style.transform).toBe("translateX(10px) scale(10) translateZ(0px)")
          expect($el.style.left).toBe("10rem")
          resolve()
        },
      })
    })
  })

  it("should anim properly 'scale' with no unit and stop to '1'", () => {
    return new Promise((resolve: any) => {
      const { proxy, $el } = getDocument()
      psap.from($el, {
        scale: 10,
        ...proxy,
        onComplete: () => {
          expect($el.style.transform).toBe("scale(1) translateZ(0px)")
          resolve()
        },
      })
    })
  })
})
