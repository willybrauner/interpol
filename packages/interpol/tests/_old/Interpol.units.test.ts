import { it, expect, describe, vi } from "vitest"
import { Interpol } from "../../src"
import "../_setup"

describe.concurrent.skip("Interpol units", () => {
  // it("should return a string value with unit", async () => {
  //   const test = (unit) =>
  //     new Promise((resolve: any) => {
  //       const callback = ({ v }) => {
  //         expect(v).toBeTypeOf("string")
  //         expect(v).toContain(unit)
  //         expect(v.slice(-unit.length)).toBe(unit)
  //       }
  //       new Interpol({
  //         props: { v: [5, 100, unit] },
  //         duration: 100,
  //         beforeStart: ({ v }) => {
  //           callback({ v })
  //           expect(v).toBe(5 + unit)
  //         },
  //         onUpdate: callback,
  //         onComplete: ({ v }) => {
  //           callback({ v })
  //           expect(v).toBe(100 + unit)
  //           resolve()
  //         },
  //       })
  //     })
  //   return Promise.all(
  //     ["px", "rem", "svh", "foo", "bar", "whatever-unit-string-we-want"].map((e) => test(e))
  //   )
  // })
  // it("should return a number value if unit is not defined", async () => {
  //   return new Promise(async (resolve: any) => {
  //     const callback = ({ v }) => expect(v).toBeTypeOf("number")
  //     new Interpol({
  //       props: { v: [5, 100] },
  //       duration: 100,
  //       beforeStart: callback,
  //       onUpdate: callback,
  //       onComplete: resolve,
  //     })
  //   })
  // })
})
