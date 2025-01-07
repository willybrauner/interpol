import { it, expect, describe } from "vitest"
import { Interpol } from "../src"
import "./_setup"

describe.concurrent("Interpol props", () => {
  it("should accept array props", async () => {
    const test = (from, to, unit, onCompleteProp, onCompleteType) =>
      new Interpol({
        duration: 100,
        props: {
          x: [from, to, unit],
          y: [from, to, unit],
        },
        onUpdate: ({ x, y }) => {
          expect(x).toBeTypeOf(onCompleteType)
          expect(y).toBeTypeOf(onCompleteType)
        },
        onComplete: ({ x, y }) => {
          expect(x).toBe(onCompleteProp)
          expect(x).toBeTypeOf(onCompleteType)
          expect(y).toBeTypeOf(onCompleteType)
        },
      }).play()

    return Promise.all([
      test(0, 1000, "px", "1000px", "string"),
      test(-100, 100, "%", "100%", "string"),
      test(0, 1000, null, 1000, "number"),
      test(null, 1000, null, 1000, "number"),
      test(null, null, null, 0, "number"),
    ])
  })

  it("should accept unit as third param and return string value", async () => {
    const test = (unit) =>
      new Promise((resolve: any) => {
        const callback = ({ v }) => {
          expect(v).toBeTypeOf("string")
          expect(v).toContain(unit)
          expect(v.slice(-unit.length)).toBe(unit)
        }
        new Interpol({
          props: { v: [5, 100, unit] },
          duration: 100,
          beforeStart: ({ v }) => {
            callback({ v })
            expect(v).toBe(5 + unit)
          },
          onUpdate: callback,
          onComplete: ({ v }) => {
            callback({ v })
            expect(v).toBe(100 + unit)
            resolve()
          },
        })
      })
    return Promise.all(
      ["px", "rem", "svh", "foo", "bar", "whatever-unit-string-we-want"].map((e) => test(e)),
    )
  })

  it("should return a number value if unit as third param is not defined", async () => {
    return new Promise(async (resolve: any) => {
      const callback = ({ v }) => expect(v).toBeTypeOf("number")
      new Interpol({
        props: { v: [5, 100] },
        duration: 100,
        beforeStart: callback,
        onUpdate: callback,
        onComplete: resolve,
      })
    })
  })

  it("should accept object props", async () => {
    const test = (from, to, unit, onCompleteProp, onCompleteType) =>
      new Interpol({
        props: {
          x: { from, to, unit, ease: "power3.out", reverseEase: "power2.in" },
          y: { from, to, unit },
        },
        duration: 100,
        onUpdate: ({ x }) => {
          expect(x).toBeTypeOf(onCompleteType)
        },
        onComplete: ({ x }) => {
          expect(x).toBe(onCompleteProp)
          expect(x).toBeTypeOf(onCompleteType)
        },
      }).play()

    return Promise.all([
      test(0, 1000, "px", "1000px", "string"),
      test(-100, 100, "%", "100%", "string"),
      test(0, 1000, null, 1000, "number"),
      test(null, 1000, null, 1000, "number"),
      test(null, null, null, 0, "number"),
    ])
  })

  it("should accept number props", async () => {
    const test = (to, onCompleteProp, onCompleteType) =>
      new Interpol({
        props: { x: to },
        duration: 100,
        onUpdate: ({ x }) => {
          expect(x).toBeTypeOf(onCompleteType)
        },
        onComplete: ({ x }) => {
          expect(x).toBe(onCompleteProp)
          expect(x).toBeTypeOf(onCompleteType)
        },
      }).play()

    return Promise.all([
      test(0, 0, "number"),
      test(1000, 1000, "number"),
      test(10, 10, "number"),
      test(null, 0, "number"),
    ])
  })

  it("should accept string props", async () => {
    const test = (to, onCompleteProp, onCompleteType) =>
      new Interpol({
        x: to,
        duration: 1,
        onUpdate: ({ x }) => {
          expect(x).toBeTypeOf(onCompleteType)
        },
        onComplete: ({ x }) => {
          expect(x).toBe(onCompleteProp)
          expect(x).toBeTypeOf(onCompleteType)
        },
      }).play()

    return Promise.all([
      test(10, 10, "number"),
      test("10px", "10px", "string"),
      test(0, 0, "number"),
      test(-20, -20, "number"),
      test('-20', -20, "number"),

      // array
      test([0, 10], 10, "number"),
      test([-20, 32], 32, "number"),
      test([-20, "32px"], "32px", "string"),
      test(["-20px", 32], "32px", "string"),

      // object
      test({ from: "0", to: "10px" }, "10px", "string"),
      test({ from: "0", to: 10 }, 10, "number"),
      test({ from: "0px", to: 10 }, "10px", "string"),

      // with computed value
      test({ from: "0px", to: () => 10 }, "10px", "string"),
      test({ from: "0px", to: () => "10px" }, "10px", "string"),
    ])
  })

  it("should accept inline props (outide the props object)", async () => {
    return new Interpol({
      duration: 100,
      x: 100,
      y: -100,
      top: [0, 100],
      left: [-100, 100, "px"],
      onComplete: ({ x, y, top, left, right, marginRight }) => {
        expect(x).toBe(100)
        expect(y).toBe(-100)
        expect(top).toBe(100)
        expect(left).toBe("100px")
      },
    }).play()
  })

  it("should accept props object AND inline props together for backward compatibility", async () => {
    return new Interpol({
      duration: 100,
      // object props
      props: {
        x: 100,
        y: -100,
        // top key will be overrided by inline props
        top: -2000,
      },
      // inline props
      top: [0, 100],
      left: [-100, 100, "px"],

      onComplete: ({ x, y, top, left, right }) => {
        expect(x).toBe(100)
        expect(y).toBe(-100)
        expect(top).toBe(100)
        expect(left).toBe("100px")
        expect(right).toBe(undefined)
      },
    }).play()
  })

  it("Should works without props object and without inline props", async () => {
    return new Interpol({
      duration: 100,
      onUpdate: (props) => {
        expect(props).toEqual({})
      },
      onComplete: (props) => {
        expect(props).toEqual({})
      },
    }).play()
  })
})
