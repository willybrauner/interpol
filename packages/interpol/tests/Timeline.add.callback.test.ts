import { it, expect, describe, vi } from "vitest"
import { Timeline } from "../src"
import "./_setup"

describe("Timeline add callback", () => {
  /**
   * We assume that the tl.time is a physical time in ms
   * It can't reflect the exact position set via duration beacause depend on RAF
   *
   * ex:
   *  tl.add(() => {}, 50) // will maybe execute around 64ms and it's ok
   */
  it("should execute callbacks at their intended times", async () => {
    const callbackTimes: number[] = []
    const tl = new Timeline({ paused: true })

    // normal ITP
    tl.add({
      duration: 100,
    })
    // Callback should execute around 100ms
    tl.add(() => callbackTimes.push(tl.time))
    // normal ITP
    tl.add({
      duration: 100,
    })
    // normal ITP
    tl.add({
      duration: 200,
    })
    // Callback at 150ms (absolute)
    tl.add(() => callbackTimes.push(tl.time), 150)
    // Callback at 300ms (absolute)
    tl.add(() => callbackTimes.push(tl.time), 300)
    // Callback at 300ms (absolute)
    tl.add(() => callbackTimes.push(tl.time), 650)
    // Callback at 0ms (absolute) - Position should be independent of add order
    tl.add(() => callbackTimes.push(tl.time), 0)
    await tl.play()

    console.log("Callback execution times:", callbackTimes)
    console.log("Expected times:", [0, 100, 150, 300, 650])

    // We just verify that callbacks execute in the right order and timing range
    expect(callbackTimes.length).toBe(5)

    // Check order: callbacks should execute in chronological order regardless of add order
    const sortedTimes = [...callbackTimes].sort((a, b) => a - b)
    expect(callbackTimes).toEqual(sortedTimes)

    // Check that times are in reasonable ranges (allowing for RAF timing variations)
    const expectedRanges = [
      [0, 30],
      [80, 130],
      [130, 180],
      [280, 330],
      [630, 680],
    ]

    callbackTimes.forEach((actual, i) => {
      const [min, max] = expectedRanges[i]
      expect(actual).toBeGreaterThanOrEqual(min)
      expect(actual).toBeLessThanOrEqual(max)
    })
  })

  it("should execute multiple callbacks with different offsets", async () => {
    for (let [NUM, OFFSET] of [
      [10, `+=10`],
      [10, `-=10`],
      [100, 0],
      [100, 100],
      [50, 200],
    ]) {
      const cb = vi.fn()
      const tl = new Timeline({ paused: true })
      for (let i = 0; i < (NUM as number); i++) {
        tl.add(() => cb(), OFFSET)
      }
      await tl.play()
      expect(cb).toHaveBeenCalledTimes(NUM as number)
    }
  })

  it("should execute single callback without offset", async () => {
    const cb = vi.fn()
    const tl = new Timeline({ paused: true })
    tl.add(() => cb())
    await tl.play()
    expect(cb).toHaveBeenCalledTimes(1)
  })

  it("should execute single callback with absolute offset", async () => {
    const cb = vi.fn()
    const tl = new Timeline({ paused: true })
    tl.add(() => cb(), 100) // offset absolu de 100ms
    await tl.play()
    expect(cb).toHaveBeenCalledTimes(1)
  })

  it("should execute single callback with relative offset", async () => {
    const cb = vi.fn()
    const tl = new Timeline({ paused: true })
    tl.add(() => cb(), "+=100") // offset relatif de 100ms
    await tl.play()
    expect(cb).toHaveBeenCalledTimes(1)
  })

  it("should execute callback when using progress() method", async () => {
    const cb = vi.fn()
    const tl = new Timeline({ paused: true })
    tl.add(() => cb())

    // Test avec progress() - le callback doit s'exécuter
    // Pour un callback sans offset, il s'exécute dès progress(0) car sa position est 0
    tl.progress(0, false) // début, suppressEvents = false - le callback s'exécute
    expect(cb).toHaveBeenCalledTimes(1)

    tl.progress(1, false) // fin, suppressEvents = false - le callback ne s'exécute pas à nouveau
    expect(cb).toHaveBeenCalledTimes(1)

    // Reset et test à nouveau - pour un callback à la position 0, il ne se réexécute
    // pas quand on revient à 0, mais seulement quand on passe par sa position
    cb.mockClear()
    tl.progress(0, false) // reset - le callback ne s'exécute pas car déjà à la position 0
    expect(cb).toHaveBeenCalledTimes(0)

    tl.progress(0.5, false) // milieu - pas d'exécution
    expect(cb).toHaveBeenCalledTimes(0)

    tl.progress(1, false) // fin - pas d'exécution
    expect(cb).toHaveBeenCalledTimes(0)
  })

  it("should execute callback with offset when using progress() method", async () => {
    const cb = vi.fn()
    const tl = new Timeline({ paused: true })
    tl.add(() => cb(), 100) // offset absolu de 100ms

    // Le callback doit s'exécuter quand on atteint son point dans la timeline
    tl.progress(0, false) // début
    expect(cb).toHaveBeenCalledTimes(0)

    tl.progress(0.5, false) // milieu - dépend de la durée totale
    // Si la durée totale est 100ms, alors progress(0.5) = 50ms, donc pas encore
    expect(cb).toHaveBeenCalledTimes(0)

    tl.progress(1, false) // fin - le callback doit s'exécuter
    expect(cb).toHaveBeenCalledTimes(1)
  })

  it("should execute callback multiple times when crossing its position", async () => {
    const cb = vi.fn()
    const tl = new Timeline({ paused: true })
    tl.add(() => cb(), 100) // offset absolu de 100ms

    // Test aller-retour avec progress()
    tl.progress(0, false) // début
    expect(cb).toHaveBeenCalledTimes(0)

    tl.progress(1, false) // fin - le callback s'exécute
    expect(cb).toHaveBeenCalledTimes(1)

    tl.progress(0, false) // retour au début
    expect(cb).toHaveBeenCalledTimes(1) // pas d'exécution supplémentaire

    tl.progress(1, false) // fin à nouveau - le callback doit s'exécuter à nouveau
    expect(cb).toHaveBeenCalledTimes(2)
  })
})
