import { describe, expect, it } from "vitest"
import { JSDOM } from "jsdom"
import { psap } from "../src"
import { randomRange } from "./utils/randomRange"
import { VALID_TRANSFORMS } from "../src/psap"

const getDocument = () => {
  const dom = new JSDOM()
  const win = dom.window
  const doc = win.document
  const proxy = { proxyWindow: win, proxyDocument: doc }
  const $el = doc.createElement("div")
  doc.body.append($el)
  return { dom, win, doc, proxy, $el }
}

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

  it("should anim properly 'to' on regular transform properties", () =>
    new Promise((resolve: any) => {
      const props = VALID_TRANSFORMS.filter((prop) => prop !== "x" && prop !== "y" && prop !== "z")
      props.forEach((prop, i) => {
        const isLast = i === props.length - 1
        const { proxy, $el } = getDocument()
        $el.style.transform = `${prop}(0px)`
        const to = randomRange(-100, 100)
        psap.to($el, {
          [prop]: to,
          ...proxy,
          onComplete: () => {
            expect($el.style.transform).toBe(`${prop}(${to}px)`)
            isLast && resolve()
          },
        })
      })
    }))

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
            expect($el.style.transform).toBe(`${prop}(${to}px)`)
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

  it("should anim properly 'scale' with no unit", () => {
    return new Promise((resolve: any) => {
      const { proxy, $el } = getDocument()
      $el.style.transform = `scale(0)`
      psap.to($el, {
        scale: 10,
        ...proxy,
        onComplete: () => {
          expect($el.style.transform).toBe("scale(10)")
          resolve()
        },
      })
    })
  })


  // FIXME
  it("cool", () => {
    return new Promise((resolve: any) => {
      const { proxy, $el } = getDocument()
      $el.style.transform = "translateX(10px) scale(1.1)"
      psap.to($el, {
        scale: 10,
        duration: 0,
        ...proxy,
        onUpdate: (e) => {
          console.log("e", e)
        },
        onComplete: () => {
          expect($el.style.transform).toBe("translateX(10px) scale(10)")
          resolve()
        },
      })
    })
  })

  // it.only("should keep existing transform properties on DOM if a new one is animated", () => {
  //   const test = (startTransform: string, expectedTransform: string, prop: string, to: number) =>
  //     new Promise((resolve: any) => {
  //       const { proxy, $el } = getDocument()
  //       $el.style.transform = startTransform
  //       psap.to($el, {
  //         [prop]: to,
  //         duration: 0,
  //         ...proxy,
  //         onUpdate: (e) => {
  //           console.log("prop", prop, $el.style.transform,e)
  //         },
  //         onComplete: () => {
  //           expect($el.style.transform).toBe(expectedTransform)
  //           resolve()
  //         },
  //       })
  //     })
  //
  //   return Promise.all([
  //     test("translateX(10px) scale(1.1)", "translateX(1px) scale(10)", "scaleX", 10),
  //   ])
  // })
})
