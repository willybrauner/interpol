import { describe, expect, it } from "vitest"
import { JSDOM } from "jsdom"
import { psap } from "../src"
import { randomRange } from "./utils/randomRange"
import { propsCamelCase } from "./utils/CSSProperties"

const getDocument = () => {
  const dom = new JSDOM()
  const win = dom.window
  const doc = win.document
  const proxy = { proxyWindow: win, proxyDocument: doc }
  const $el = doc.createElement("div")
  doc.body.append($el)
  return { dom, win, doc, proxy, $el }
}

describe.concurrent("anim common CSS Properties (px), one anim() by property", () => {
  it("should anim properly 'to'", () =>
    new Promise((resolve: any) => {
      const { doc, proxy, $el } = getDocument()
      propsCamelCase.forEach((prop, i) => {
        $el.style[prop] = "0px"
        const last = i === propsCamelCase.length - 1
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
  it("should anim properly 'to' animating all properties on the same anim()", () =>
    new Promise((resolve: any) => {
      const { doc, proxy, $el } = getDocument()
      doc.body.append($el)
      const to = `${randomRange(-100, 100)}px`
      const props = propsCamelCase.reduce((acc, prop) => {
        acc[prop] = to
        return acc
      }, {})

      psap.to($el, {
        ...props,
        ...proxy,
        onComplete: async () => {
          propsCamelCase.forEach((prop) => expect($el.style[prop]).toBe(to))
          resolve()
        },
      })
    }))

  // 1. create an animation for each property
  it("should anim properly [from to], one anim() by property", () =>
    new Promise((resolve: any) => {
      const { doc, proxy, $el } = getDocument()
      propsCamelCase.forEach((prop, i) => {
        const last = i === propsCamelCase.length - 1
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
  it("should anim properly [from to] animating all properties on the same anim()", () =>
    new Promise((resolve: any) => {
      const { doc, proxy, $el } = getDocument()
      doc.body.append($el)
      const from = `${randomRange(-100, 100)}px`
      const to = `${randomRange(-100, 100)}px`
      const propsFrom = propsCamelCase.reduce((acc, prop) => {
        acc[prop] = from
        return acc
      }, {})
      const propsTo = propsCamelCase.reduce((acc, prop) => {
        acc[prop] = to
        return acc
      }, {})
      psap.fromTo($el, propsFrom, {
        ...propsTo,
        ...proxy,
        onComplete: () => {
          propsCamelCase.forEach((prop) => {
            expect($el.style[prop]).toBe(to)
          })
          resolve()
        },
      })
    }))
})
