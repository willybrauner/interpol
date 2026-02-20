import { it, expect, describe } from "vitest"
import { Interpol } from "../src"
import "./_setup"

describe.concurrent("Interpol keyframes", () => {
  it("should start and end properly with multiple keyframe values", async () => {
    await new Interpol({
      duration: 100,
      x: [100, 32, 20, 201, -100, 200, 400, 201, 10000, -24949],
      onStart: ({ x }) => {
        expect(x).toBe(100)
      },
      onComplete: ({ x }) => {
        expect(x).toBe(-24949)
      },
    }).play()
  })

  it("should return first keyframe at progress 0 and last at progress 1", async () => {
    const itp = new Interpol({
      duration: 100,
      paused: true,
      x: [10, 50, 30, 90],
    })
    itp.progress(0)
    expect(itp.props.x.value).toBe(10)
    itp.progress(1)
    expect(itp.props.x.value).toBe(90)
  })

  it("should interpolate at segment boundaries correctly", async () => {
    // 3 segments: [0, 100, 50, 200]
    // segment 0: 0→100 (progress 0 to 1/3)
    // segment 1: 100→50 (progress 1/3 to 2/3)
    // segment 2: 50→200 (progress 2/3 to 1)
    const itp = new Interpol({
      duration: 300,
      paused: true,
      x: [0, 100, 50, 200],
    })

    // At progress 0: first keyframe
    itp.progress(0)
    expect(itp.props.x.value).toBe(0)
    // At progress 1/3: second keyframe (end of first segment)
    itp.progress(1 / 3)
    expect(itp.props.x.value).toBe(100)
    // At progress 2/3: third keyframe (end of second segment)
    itp.progress(2 / 3)
    expect(itp.props.x.value).toBe(50)
    // At progress 1: last keyframe
    itp.progress(1)
    expect(itp.props.x.value).toBe(200)
  })

  it("should interpolate mid-segment correctly", async () => {
    // 2 segments: [0, 100, 0]
    // segment 0: 0→100 (progress 0 to 0.5)
    // segment 1: 100→0 (progress 0.5 to 1)
    const itp = new Interpol({
      duration: 200,
      paused: true,
      x: [0, 100, 0],
    })

    // At progress 0.25: midpoint of first segment → 50
    itp.progress(0.25)
    expect(itp.props.x.value).toBe(50)
    // At progress 0.5: end of first segment → 100
    itp.progress(0.5)
    expect(itp.props.x.value).toBe(100)
    // At progress 0.75: midpoint of second segment → 50
    itp.progress(0.75)
    expect(itp.props.x.value).toBe(50)
    // At progress 1: end → 0
    itp.progress(1)
    expect(itp.props.x.value).toBe(0)
  })

  it("should work with 5+ keyframe values", async () => {
    const itp = new Interpol({
      duration: 400,
      paused: true,
      x: [0, 25, 50, 75, 100],
    })
    // 4 segments, each 0.25 of progress
    itp.progress(0)
    expect(itp.props.x.value).toBe(0)
    itp.progress(0.25)
    expect(itp.props.x.value).toBe(25)
    itp.progress(0.5)
    expect(itp.props.x.value).toBe(50)
    itp.progress(0.75)
    expect(itp.props.x.value).toBe(75)
    itp.progress(1)
    expect(itp.props.x.value).toBe(100)
  })

  it("should work with duration 0 and keyframes", async () => {
    await new Interpol({
      duration: 0,
      x: [0, 100, 50, 200],
      onComplete: ({ x }) => {
        // Duration 0 sets prop.value = prop._to, which is the last keyframe
        expect(x).toBe(200)
      },
    }).play()
  })

  it("should reverse through keyframes", async () => {
    const itp2 = new Interpol({
      duration: 100,
      paused: true,
      x: [10, 100, 0],
    })
    await itp2.reverse(1)
    expect(itp2.props.x.value).toBe(10)
  })

  it("should work with multiple keyframe props simultaneously", async () => {
    const itp = new Interpol({
      duration: 200,
      paused: true,
      x: [0, 100, 0],
      y: [10, 50, 90],
    })

    itp.progress(0.5)
    expect(itp.props.x.value).toBe(100)
    expect(itp.props.y.value).toBe(50)

    itp.progress(1)
    expect(itp.props.x.value).toBe(0)
    expect(itp.props.y.value).toBe(90)
  })

  it("should mix keyframes and regular props", async () => {
    const itp = new Interpol({
      duration: 200,
      paused: true,
      x: [0, 100, 0], // keyframes
      y: [10, 90], // regular [from, to]
      z: 50, // single value
    })

    itp.progress(0.5)
    expect(itp.props.x.value).toBe(100) // mid of keyframes
    expect(itp.props.y.value).toBe(50) // mid of [10, 90]
    expect(itp.props.z.value).toBe(25) // mid of [0, 50]

    itp.progress(1)
    expect(itp.props.x.value).toBe(0)
    expect(itp.props.y.value).toBe(90)
    expect(itp.props.z.value).toBe(50)
  })

  it("should work with computed properties in keyframes", async () => {
    const itp = new Interpol({
      duration: 200,
      paused: true,
      x: [() => 0, () => 100, () => 0],
    })

    itp.progress(0)
    expect(itp.props.x.value).toBe(0)
    itp.progress(0.5)
    expect(itp.props.x.value).toBe(100)
    itp.progress(1)
    expect(itp.props.x.value).toBe(0)
  })
})
