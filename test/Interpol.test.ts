import { it, expect, vi } from "vitest"
import { Interpol } from "../src"

it("should interpol value between two points", async () => {
  return new Promise((resolve: any) => {
    const inter = new Interpol({
      from: 0,
      to: 100,
      duration: 1000,
      onUpdate: ({ value, time, advancement }) => {
        // console.log({ value, time, advancement })
        expect(value).toBeGreaterThanOrEqual(inter.from)
      },
      onComplete: ({ value, time, advancement }) => {
        expect(value).toBe(inter.to)
        expect(time).toBe(inter.duration)
        expect(advancement).toBe(1)
        resolve()
      },
    })
  })
})

it("should not auto play if paused is set", async () => {
  let inter
  inter = new Interpol({ to: 100, paused: true })
  expect(inter.isPlaying).toBe(false)

  inter = new Interpol({ to: 100, paused: false })
  expect(inter.isPlaying).toBe(true)
})

it("should play, pause and play again", async () => {
  let inter
  inter = new Interpol({ to: 100, paused: true })
  inter.play()
  expect(inter.isPlaying).toBe(true)
  inter.pause()
  expect(inter.isPlaying).toBe(false)
  inter.play()
  expect(inter.isPlaying).toBe(true)
})

it("play() should return a resolved promise when complete", async () => {
  const mock = vi.fn()
  const inter = new Interpol({
    to: 100,
    paused: true,
    onComplete: () => {
      mock()
    },
  })
  await inter.play()
  expect(inter.isPlaying).toBe(false)
  expect(mock).toBeCalledTimes(1)
})


it('should execute onComplete once', ()=>
{

})
