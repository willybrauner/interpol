import { it, expect, describe } from "vitest"
import { Interpol } from "../src"
import { getDocument } from "./utils/getDocument"
import "./_setup"

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
        immediateRender: true,
        // so beforeStart opacity is already set on div
        beforeStart: callback,
        onUpdate: callback,
        onComplete: callback,
      })

      await itp.play()
      resolve()
    })
  })

  it("should set prop key and value on Object element", async () => {
    const testElObj1 = () =>
      new Promise(async (resolve: any) => {
        const program = { uniform: { uProgress: { value: -100 } } }
        const callback = ({ value }) => {
          expect(program.uniform.uProgress.value).toBe(value)
        }
        const itp = new Interpol({
          el: program.uniform.uProgress,
          duration: 100,
          props: {
            value: [program.uniform.uProgress.value, 100],
          },
          beforeStart: callback,
          onUpdate: callback,
          onComplete: callback,
        })

        await itp.play()
        resolve()
      })

    const testElObj2 = () =>
      new Promise(async (resolve: any) => {
        const program = { v: 0 }
        const callback = ({ v }) => {
          expect(program.v).toBe(v)
        }
        const itp = new Interpol({
          el: program,
          duration: 300,
          props: {
            v: [program.v, 1000],
          },
          beforeStart: callback,
          onUpdate: callback,
          onComplete: callback,
        })
        await itp.play()
        resolve()
      })

    return Promise.all([testElObj1(), testElObj2()])
  })
})
