import { it, expect, describe } from "vitest"
import { styles } from "../src"
import { getDocument } from "./utils/getDocument"
import "./_setup"

describe.concurrent("styles DOM helpers", () => {
  it("should set props of basic CSS properties on DOM element", async () => {
    const { el, doc } = getDocument()

    styles(el, {
      opacity: 1,
      top: "10px",
      left: "30rem",
      position: "absolute",
    })

    expect(el.style.opacity).toBe("1")
    expect(el.style.top).toBe("10px")
    expect(el.style.left).toBe("30rem")
    expect(el.style.position).toBe("absolute")
  })

  it("should set props of transform CSS properties on DOM element", async () => {
    const { el, doc } = getDocument()
    const el2 = doc.createElement("div")
    const el3 = doc.createElement("div")

    // styles function will add px on some properties automatically
    // can be disabled by passing false as third argument
    styles(el, { x: 1 }, true)
    expect(el.style.transform).toBe("translate3d(1px, 0px, 0px)")

    styles(el, { y: 11 })
    expect(el.style.transform).toBe("translate3d(1px, 11px, 0px)")

    styles(el, { z: "111px" })
    expect(el.style.transform).toBe("translate3d(1px, 11px, 111px)")

    styles(el, { scale: 1, rotate: "1deg" })
    expect(el.style.transform).toBe("translate3d(1px, 11px, 111px) scale(1) rotate(1deg)")

    styles(el, { scale: 1, rotate: 10 })
    expect(el.style.transform).toBe("translate3d(1px, 11px, 111px) scale(1) rotate(10deg)")

    // the second element should not be affected by the first element
    // false as third argument to disable auto add px
    styles(el2, { x: 2 }, false)
    expect(el2.style.transform).toBe("translate3d(2, 0px, 0px)")

    // the third too should not be affected by the others
    styles(el3, { x: "10rem", y: "40%", skewX: 0.5 })
    expect(el3.style.transform).toBe("translate3d(10rem, 40%, 0px) skewX(0.5deg)")
  })

  it("should set props of transform CSS properties on DOM element with array", async () => {
    const { el } = getDocument()
    // translate3d & translateX can't be used together
    // This is not right as CSS declaration
    // But we should not prevent user to do it
    // Use x y z for translate3d and translateX for translateX property
    styles(el, { x: 2, translateX: "222px" })
    expect(el.style.transform).toBe("translate3d(2px, 0px, 0px) translateX(222px)")
  })

  it("null should return '' as value", async () => {
    const { el } = getDocument()
    styles(el, { transformOrigin: "left" })
    expect(el.style.transformOrigin).toBe("left")
    styles(el, { transformOrigin: null })
    expect(el.style.transformOrigin).toBe("")
  })

  it("should accept a DOM element array", async () => {
    const { el, doc } = getDocument()
    const el2 = doc.createElement("div")
    const el3 = doc.createElement("div")
    const arr = [el, el2, el3]
    // this is wrong to set a number without unit on transform, but it's just for testing
    styles(arr, { transformOrigin: "center" })
    for (let el of arr) expect(el.style.transformOrigin).toBe("center")
  })

  it("should work with translateX translateY and translateZ", async () => {
    const { el, doc } = getDocument()
    styles(el, { translateX: 1 }, true)
    expect(el.style.transform).toBe("translateX(1px)")
    styles(el, { translateY: 1 }, true)
    expect(el.style.transform).toBe("translateX(1px) translateY(1px)")
    styles(el, { translateZ: 1 }, false)
    expect(el.style.transform).toBe("translateX(1px) translateY(1px) translateZ(1)")

    // special case
    styles(el, { translateX: "10" }, true)
    expect(el.style.transform).toBe("translateX(10) translateY(1px) translateZ(1)")
    styles(el, { translateX: 10 }, true)
    expect(el.style.transform).toBe("translateX(10px) translateY(1px) translateZ(1)")
  })
})
