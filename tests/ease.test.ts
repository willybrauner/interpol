import { describe, expect, it } from "vitest"
import "./_setup"

import {
  Ease,
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
      itp.refresh()

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

  it("Interpol should accept a custom ease function", async () => {
    const customEase = (t: number) => t * t
    const values: number[] = []

    const itp = new Interpol({
      duration: 200,
      x: [0, 100],
      ease: customEase,
      paused: true,
      onUpdate: ({ x }) => {
        values.push(x)
      },
    })

    // Check the custom ease is correctly assigned
    expect(itp.ease).toBe(customEase)
    expect(itp.props.x.ease).toBe(customEase)

    // Progress manually and check the eased value
    // At progress 0.5, custom ease (t*t) should give 0.25: value = 25
    itp.progress(0.5)
    expect(itp.props.x.value).toBe(25)

    // At progress 1, custom ease (1*1) should give 1: value = 100
    itp.progress(1)
    expect(itp.props.x.value).toBe(100)

    // At progress 0, value should be 0
    itp.progress(0)
    expect(itp.props.x.value).toBe(0)
  })

  it("chooseEase algorithm should resolve all ease input types correctly", () => {
    const customEase = (t: number) => t * t * t

    // 1. undefined/default: Linear (t => t)
    const itp1 = new Interpol({ x: [0, 100], paused: true })
    expect(itp1.ease).toBe(Linear)
    expect(itp1.reverseEase).toBe(Linear)

    // 2. null: Linear
    const itp2 = new Interpol({ x: [0, 100], ease: null, paused: true })
    expect(itp2.ease).toBe(Linear)

    // 3. string ease name: resolved via easeAdapter
    const itp3 = new Interpol({ x: [0, 100], ease: "power3.out", paused: true })
    expect(itp3.ease).toBe(Power3.out)

    // 4. "linear" string: Linear
    const itp4 = new Interpol({ x: [0, 100], ease: "linear", paused: true })
    expect(itp4.ease).toBe(Linear)

    // 5. direct EaseFn (t => number): used as-is
    const itp5 = new Interpol({ x: [0, 100], ease: customEase, paused: true })
    expect(itp5.ease).toBe(customEase)

    // 6. factory returning EaseFn: () => (t => number): inner function used
    const itp6 = new Interpol({ x: [0, 100], ease: () => customEase, paused: true })
    expect(itp6.ease).toBe(customEase)

    // 7. factory returning string: () => "power2.in": resolved via easeAdapter
    const itp7 = new Interpol({ x: [0, 100], ease: () => "power2.in" as Ease, paused: true })
    expect(itp7.ease).toBe(Power2.in)

    // 8. Power object reference: used as-is
    const itp8 = new Interpol({ x: [0, 100], ease: Expo.inOut, paused: true })
    expect(itp8.ease).toBe(Expo.inOut)

    // 9. reverseEase follows the same resolution
    const itp9 = new Interpol({
      x: [0, 100],
      ease: "power1.in",
      reverseEase: () => Power4.out,
      paused: true,
    })
    expect(itp9.ease).toBe(Power1.in)
    expect(itp9.reverseEase).toBe(Power4.out)

    // 10. per-prop ease overrides global ease
    const itp10 = new Interpol({
      x: { from: 0, to: 100, ease: Power2.out },
      ease: Power1.in,
      paused: true,
    })
    expect(itp10.ease).toBe(Power1.in)
    expect(itp10.props.x.ease).toBe(Power2.out)
  })
})
