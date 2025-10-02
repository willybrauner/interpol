import { describe, expect, it } from "vitest"
import "./_setup"

import {
  easeAdapter,
  EaseName,
  Expo,
  Linear,
  Power1,
  Power2,
  Power3,
  Power4,
} from "../src/core/ease"
import { Interpol } from "../src"
import { wait } from "./utils/wait"

const eases = { Power1, Power2, Power3, Power4, Expo }
const types = ["power1", "power2", "power3", "power4", "expo"]

describe.concurrent("Ease", () => {
  // prettier-ignore
  it("adaptor should return easing function", () => {
    const directions = ["in", "out", "inOut"]
    const capitalizeFirstLetter = (s) => {
      if (typeof s !== "string" || s.length === 0) return s
      return s.charAt(0).toUpperCase() + s.slice(1)
    }

    // all other eases
    for (const type of types) {
      for (const direction of directions) {
        const adaptor = easeAdapter(`${type}.${direction}` as EaseName)
        expect(adaptor).toBe(eases[capitalizeFirstLetter(type)]?.[direction])
      }
    }

    // linear
    const adaptor = easeAdapter(`linear` as EaseName)
    expect(adaptor).toBe(Linear)
    
  })

  it("adaptor should return linear easing function if name doesnt exist", () => {
    expect(easeAdapter("power2.oit" as any)).toBe(Linear)
    expect(easeAdapter("coucou" as any)).toBe(Linear)
  })

  it("Interpol should accept recompute ease & reverseEase on refresh", async () => {
    return new Promise(async (resolve) => {
      let ease = Power1.in
      let reverseEase = Power2.in

      const itp = new Interpol({
        duration: 300,
        x: [0, 200],
        ease: () => ease,
        reverseEase: () => reverseEase,
        onUpdate: (props, t, p, instance) => {
          if (p < 0.5) {
          } else {
            ease = Power1.out
            reverseEase = Power2.out
          }
        },
      })

      expect(itp.ease).toBe(Power1.in)
      expect(itp.reverseEase).toBe(Power2.in)
      expect(itp.props.x.ease).toBe(Power1.in)
      expect(itp.props.x.reverseEase).toBe(Power2.in)

      // wait after the middle of the tween
      // and refresh
      await wait(200)
      itp.refreshComputedValues()

      // ease functions should be updated
      expect(itp.ease).toBe(Power1.out)
      expect(itp.reverseEase).toBe(Power2.out)
      expect(itp.props.x.ease).toBe(Power1.out)
      expect(itp.props.x.reverseEase).toBe(Power2.out)

      resolve(true)
    })
  })

  it("Interpol should accept string easename for ease & reverseEase", async () => {
    const itp = (ease, reverseEase) =>
      new Promise(async (resolve) => {
        const itp = new Interpol({
          duration: 300,
          x: [0, 100],
          ease: ease,
          reverseEase: reverseEase,
          onComplete: (props, t, p, instance) => {
            expect(props.x).toBe(100)
          },
        })

        expect(itp.ease).toBe(Power1.in)
        expect(itp.props.x.ease).toBe(Power1.in)
        expect(itp.reverseEase).toBe(Power2.inOut)
        expect(itp.props.x.reverseEase).toBe(Power2.inOut)

        await itp.play()
        resolve(true)
      })

    // prettier-ignore
    return Promise.all([
      itp("power1.in", "power2.inOut"),
      itp(() => "power1.in", () => "power2.inOut"),
      itp(() => Power1.in, () => Power2.inOut),
      itp(Power1.in, Power2.inOut),
    ])
  })
})
