import { it, expect, describe, vi } from "vitest"
import { Interpol, Timeline } from "../src"
import "./_setup"

describe("Timeline nested", () => {
  it("should store nested Timeline instances when added", () => {
    const main = new Timeline({ paused: true })
    main.add(new Timeline({ paused: true }))
    main.add(new Timeline({ paused: true }))
    for (const add of main.adds) {
      expect(add.instance).toBeInstanceOf(Timeline)
    }
  })

  it("should play nested timelines sequentially", async () => {
    const order: number[] = []

    const tl1 = new Timeline({ paused: true })
    tl1.add({ duration: 10, onComplete: () => order.push(1) })
    const tl2 = new Timeline({ paused: true })
    tl2.add({ duration: 10, onComplete: () => order.push(2) })
    const main = new Timeline({ paused: true })
    main.add(tl1)
    main.add(tl2)

    await main.play()
    expect(order).toEqual([1, 2])
  })

  it("should have main duration equal to sum of nested durations (sequential)", () => {
    const tl1 = new Timeline({ paused: true })
    tl1.add({ duration: 200 })
    const tl2 = new Timeline({ paused: true })
    tl2.add({ duration: 300 })
    const main = new Timeline({ paused: true })
    main.add(tl1)
    main.add(tl2)
    expect(main.duration).toBe(tl1.duration + tl2.duration)
  })

  it("should position nested timelines independently with absolute offsets", () => {
    const tl1 = new Timeline({ paused: true })
    tl1.add({ duration: 100 })
    const tl2 = new Timeline({ paused: true })
    tl2.add({ duration: 100 })
    const main = new Timeline({ paused: true })
    main.add(tl1, 0) // both start at 0
    main.add(tl2, 0) // both start at 0

    // both overlap
    expect(main.duration).toBe(100)
    expect(main.adds[0].time.start).toBe(0)
    expect(main.adds[1].time.start).toBe(0)
  })

  it("should fire all callbacks across nested timelines", async () => {
    const cb1 = vi.fn()
    const cb2 = vi.fn()

    const tl1 = new Timeline({ paused: true })
    tl1.add({ duration: 10, onComplete: cb1 })
    tl1.add({ duration: 10, onComplete: cb1 })

    const tl2 = new Timeline({ paused: true })
    tl2.add({ duration: 10, onComplete: cb2 })

    const main = new Timeline({ paused: true })
    main.add(tl1)
    main.add(tl2)

    await main.play()

    expect(cb1).toHaveBeenCalledTimes(2)
    expect(cb2).toHaveBeenCalledTimes(1)
  })

  it("should fire main onComplete after all nested timelines complete", async () => {
    const onComplete = vi.fn()

    const tl1 = new Timeline({ paused: true })
    tl1.add({ duration: 10 })
    const tl2 = new Timeline({ paused: true })
    tl2.add({ duration: 10 })
    const main = new Timeline({ paused: true, onComplete })
    main.add(tl1)
    main.add(tl2)
    await main.play()
    expect(onComplete).toHaveBeenCalledTimes(1)
  })

  it("should play deeply nested timelines (3 levels) correctly", async () => {
    const cb = vi.fn()
    const inner = new Timeline({ paused: true })
    inner.add({ duration: 10, onComplete: cb })
    const mid = new Timeline({ paused: true })
    mid.add(inner)
    const main = new Timeline({ paused: true })
    main.add(mid)
    await main.play()

    expect(cb).toHaveBeenCalledTimes(1)
  })

  it("should add Timeline and Interpol instances together in a nested structure", async () => {
    const cb1 = vi.fn()
    const cb2 = vi.fn()

    // TL
    const tl = new Timeline({ paused: true })
    tl.add({ duration: 10, onComplete: cb1 })

    // Interpol
    const itp = new Interpol({ duration: 10, onComplete: cb2 })

    // main timeline: both run in the same timeline
    const main = new Timeline({ paused: true })
    main.add(tl)
    main.add(itp)

    await main.play()

    expect(cb1).toHaveBeenCalledTimes(1)
    expect(cb2).toHaveBeenCalledTimes(1)
  })

  it("should set inTl=true on nested timeline and its children when added", () => {
    const three = new Timeline({ paused: true })
    three.add({ v: 0 })
    three.add(new Interpol({ v: 0 }))

    const two = new Timeline({ paused: true })
    two.add(three)

    const one = new Timeline({ paused: true })
    one.add(two)

    // All nested timelines & interpols should have inTl=true
    expect(three.inTl).toBe(true)
    for (const add of three.adds) {
      expect(add.instance.inTl).toBe(true)
    }
    expect(two.inTl).toBe(true)
    // the main timeline should not have inTl=true, it's the root TL
    expect(one.inTl).toBe(false)
  })

  it("should not auto-play a nested timeline before main.play()", () => {
    const nested = new Timeline()
    nested.add({ duration: 100 })

    const main = new Timeline()
    main.add(nested)

    // Nested shouldn't never played but "progressed" by the parent timeline
    expect(nested.isPlaying).toBe(false)

    // before play, nested timeline should not be playing, event if it has autoplay adds
    // because it should wait for main.play() to be called in queueMicrotask
    expect(main.isPlaying).toBe(false)

    // after current call stack
    queueMicrotask(() => {
      // nested Should still not be playing (never played because it's "progressed" by the parent)
      expect(nested.isPlaying).toBe(false)
      // Main timeline should be playing because main.play()
      // and is auto-played
      expect(main.isPlaying).toBe(true)
    })
  })

  it("should drive nested timeline progress via main.progress()", () => {
    const tl1 = new Timeline({ paused: true })
    tl1.add({ duration: 100 })

    const tl2 = new Timeline({ paused: true })
    tl2.add({ duration: 100 })

    const main = new Timeline({ paused: true })
    main.add(tl1)
    main.add(tl2)

    // tl1 occupies [0, 0.5], tl2 [0.5, 1]
    main.progress(0.25) // midway through tl1
    expect(tl1.progress()).toBe(0.5)
    expect(tl2.progress()).toBe(0)

    main.progress(0.75) // midway through tl2
    expect(tl1.progress()).toBe(1)
    expect(tl2.progress()).toBe(0.5)
  })

  it("should fire nested timeline onComplete exactly once", async () => {
    const onComplete = vi.fn()

    // nested timeline with onComplete callback
    const tl = new Timeline({ paused: true, onComplete })
    tl.add({ duration: 10 })
    // main timeline
    const main = new Timeline({ paused: true })
    main.add(tl)

    await main.play()
    expect(onComplete).toHaveBeenCalledTimes(1)
  })
})
