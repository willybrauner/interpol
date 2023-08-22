import { it, expect, describe } from "vitest"
import { Interpol, styles } from "../src"
import { getDocument } from "./utils/getDocument"

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

    // this is wrong to set a number without unit on transform, but it's just for testing
    styles(el, { x: 1 })
    expect(el.style.transform).toBe("translate3d(1, 0px, 0px)")

    styles(el, { y: "11px" })
    expect(el.style.transform).toBe("translate3d(1, 11px, 0px)")

    styles(el, { z: "111px" })
    expect(el.style.transform).toBe("translate3d(1, 11px, 111px)")

    styles(el, { scale: 1, rotate: "1deg" })
    expect(el.style.transform).toBe("translate3d(1, 11px, 111px) scale(1) rotate(1deg)")

    // the second element should not be affected by the first element
    styles(el2, { x: 2 })
    expect(el2.style.transform).toBe("translate3d(2, 0px, 0px)")

    // the third too
    styles(el3, { x: "10rem", y: "40%", skewX: 0.5 })
    expect(el3.style.transform).toBe("translate3d(10rem, 40%, 0px) skewX(0.5)")

    // translate3d & translateX can't be used together
    // This is not right as CSS declaration
    // But we should not prevent user to do it
    // Use x y z for translate3d and translateX for translateX property
    styles(el2, { translateX: "222px" })
    expect(el2.style.transform).toBe("translate3d(2, 0px, 0px) translateX(222px)")
  })
})
