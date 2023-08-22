import { it, expect, describe } from "vitest"
import { Interpol } from "../src"
import { getDocument } from "./utils/getDocument"

describe.concurrent("Interpol DOM el", () => {
  it("should set prop key and value on DOM element", async () => {
    return new Promise(async (resolve: any) => {
      const { el } = getDocument()

      // Props have been automatically set on div as style
      const callback = ({ opacity, y }) => {
        expect(opacity).toBeTypeOf("number")
        expect(y).toBeTypeOf("string")
        expect(el.style.opacity).toBe(`${opacity}`)
        expect(el.style.transform).toBe(`translate3d(0px, ${y}, 0px)`)
      }
      const itp = new Interpol({
        el,
        paused: true,
        props: {
          opacity: [5, 100],
          y: [-200, 100, "px"],
        },
        duration: 100,
        // init update callback before start
        initUpdate: true,
        // so beforeStart opacity is already set on div
        beforeStart: callback,
        onUpdate: callback,
        onComplete: callback,
      })

      await itp.play()
      resolve()
    })
  })
})
